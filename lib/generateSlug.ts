export function generateSlug(input: string) {
  return input
    .toLowerCase() // Convert to lowercase
    .trim() // Remove whitespace from start and end
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Remove duplicate hyphens
}
