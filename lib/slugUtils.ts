// lib/utils.ts
export function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with dashes
    .replace(/(^-|-$)+/g, "") // Remove leading/trailing dashes
    .slice(0, 50); // Limit slug length
}
