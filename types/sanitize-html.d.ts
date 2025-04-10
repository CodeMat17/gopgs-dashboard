// types/sanitize-html.d.ts
declare module "sanitize-html" {
  export interface SanitizeOptions {
    allowedTags?: string[] | false;
    allowedAttributes?: { [key: string]: string[] };
    allowedSchemes?: string[];
    allowProtocolRelative?: boolean;
    // Add other options as needed
  }

  function sanitizeHtml(html: string, options?: SanitizeOptions): string;
  export = sanitizeHtml;
}
