"use client";
// components/SafeHTMLRenderer.tsx
import { useEffect, useState } from "react";
import DOMPurify from "dompurify";

interface SafeHTMLRendererProps {
  htmlContent: string;
  className?: string;
}

export const SafeHTMLRenderer = ({
  htmlContent,
  className,
}: SafeHTMLRendererProps) => {
  const [sanitizedContent, setSanitizedContent] = useState("");

  useEffect(() => {
    const cleanHTML = DOMPurify.sanitize(htmlContent, {
      ALLOWED_TAGS: [
        "p",
        "strong",
        "em",
        "u",
        "h1",
        "h2",
        "h3",
        "ul",
        "ol",
        "li",
        "a",
      ],
      ALLOWED_ATTR: ["href", "target", "rel"],
      FORBID_ATTR: ["style", "onclick"],
      FORBID_TAGS: ["script", "iframe", "form"],
    });
    setSanitizedContent(cleanHTML);
  }, [htmlContent]);

  return (
    <div
      className={`prose max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};
