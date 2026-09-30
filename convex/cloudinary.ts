// convex/cloudinary.ts
// Photos live on Cloudinary; Convex only stores their URL + public_id.
// Requires these Convex env vars (npx convex env set NAME value):
//   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";

export const FOLDERS = {
  news: "go-pgs/news",
  staff: "go-pgs/staff",
  alumni: "go-pgs/alumni",
  spotlight: "go-pgs/spotlight",
} as const;

export const folderType = v.union(
  v.literal("news"),
  v.literal("staff"),
  v.literal("alumni"),
  v.literal("spotlight"),
);

/** What Convex stores for a Cloudinary-hosted photo. */
export const cloudinaryImage = v.object({ url: v.string(), publicId: v.string() });

function config() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Missing Cloudinary env vars: set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET on the Convex deployment",
    );
  }
  return { cloudName, apiKey, apiSecret };
}

type Params = Record<string, string | number | boolean>;

/** Cloudinary signature: sorted `k=v&...` + api_secret, SHA-1 hex. */
async function sign(params: Params, apiSecret: string) {
  const toSign =
    Object.keys(params)
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join("&") + apiSecret;
  const digest = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(toSign),
  );
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function callApi(endpoint: "upload" | "destroy", params: Params, file?: string) {
  const { cloudName, apiKey, apiSecret } = config();
  const signed = { ...params, timestamp: Math.floor(Date.now() / 1000) };
  const body = new FormData();
  for (const [k, val] of Object.entries(signed)) body.append(k, String(val));
  body.append("api_key", apiKey);
  body.append("signature", await sign(signed, apiSecret));
  if (file) body.append("file", file);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/${endpoint}`,
    { method: "POST", body },
  );
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(`Cloudinary ${endpoint} failed: ${json.error?.message ?? res.status}`);
  }
  return json;
}

/** Upload an image Cloudinary can fetch from a public URL (or a data URI). */
export async function uploadFromUrl(fileUrl: string, publicId: string) {
  const json = await callApi(
    "upload",
    { public_id: publicId, overwrite: true, invalidate: true },
    fileUrl,
  );
  return { url: json.secure_url as string, publicId: json.public_id as string };
}

export async function destroyImage(publicId: string) {
  await callApi("destroy", { public_id: publicId, invalidate: true });
}

/**
 * Signature for a direct browser -> Cloudinary upload from the admin app.
 * The client POSTs the file to https://api.cloudinary.com/v1_1/<cloudName>/image/upload
 * with { file, api_key, timestamp, folder, signature }, then passes the
 * returned { url: secure_url, publicId: public_id } to the add/update mutation.
 */
export const signUpload = action({
  args: { folder: folderType },
  handler: async (_ctx, args) => {
    const { cloudName, apiKey, apiSecret } = config();
    const folder = FOLDERS[args.folder];
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = await sign({ folder, timestamp }, apiSecret);
    return { cloudName, apiKey, timestamp, folder, signature };
  },
});

export const deleteImages = internalAction({
  args: { publicIds: v.array(v.string()) },
  handler: async (_ctx, { publicIds }) => {
    for (const publicId of publicIds) {
      try {
        await destroyImage(publicId);
      } catch (err) {
        console.error(`Could not delete ${publicId} from Cloudinary`, err);
      }
    }
  },
});

/** Cloudinary public_ids a set of photos owns, for cleanup when they change. */
export const publicIdsOf = (images?: { publicId?: string }[]) =>
  (images ?? []).flatMap((img) => (img.publicId ? [img.publicId] : []));
