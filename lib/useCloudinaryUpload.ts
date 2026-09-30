"use client";

import { api } from "@/convex/_generated/api";
import { useAction } from "convex/react";
import { useCallback } from "react";

export type CloudinaryFolder = "news" | "staff" | "alumni" | "spotlight";

/** What the Convex mutations store for a Cloudinary-hosted photo. */
export type CloudinaryImage = { url: string; publicId: string };

/**
 * Uploads a photo straight from the browser to Cloudinary, using a signature
 * from Convex (api.cloudinary.signUpload). Throws if the upload fails.
 */
export function useCloudinaryUpload() {
  const signUpload = useAction(api.cloudinary.signUpload);

  return useCallback(
    async (file: File, folder: CloudinaryFolder): Promise<CloudinaryImage> => {
      const { cloudName, apiKey, timestamp, folder: path, signature } =
        await signUpload({ folder });

      const body = new FormData();
      body.append("file", file);
      body.append("api_key", apiKey);
      body.append("timestamp", String(timestamp));
      body.append("folder", path);
      body.append("signature", signature);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.error) {
        throw new Error(json.error?.message ?? `Upload failed (${res.status})`);
      }
      return { url: json.secure_url, publicId: json.public_id };
    },
    [signUpload]
  );
}
