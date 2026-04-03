interface SanitizeHtmlParams {
  /** Raw HTML string to sanitize. */
  html: string;
}

/**
 * Sanitizes HTML using DOMPurify on the client side.
 *
 * This function is intended for use in browser environments or API route
 * handlers where the DOM is available (or polyfilled). For server-side
 * rendering, store HTML as-is and sanitize on render using this function
 * in a client component.
 *
 * @returns Sanitized HTML string with dangerous elements/attributes removed.
 */
export const sanitizeHtml = async ({
  html,
}: SanitizeHtmlParams): Promise<string> => {
  if (!html) {
    return "";
  }

  const DOMPurifyModule = await import("dompurify");
  const DOMPurify = DOMPurifyModule.default;

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br", "hr",
      "ul", "ol", "li",
      "strong", "em", "u", "s", "mark",
      "blockquote", "pre", "code",
      "a", "img",
      "table", "thead", "tbody", "tr", "th", "td",
      "div", "span",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "target", "rel"],
  });
};

interface StripHtmlTagsParams {
  /** HTML string to convert to plain text. */
  html: string;
}

/**
 * Strips all HTML tags from a string, returning plain text.
 *
 * Uses a regex-based approach that works in any environment (server or client)
 * without DOM dependencies. Suitable for generating contentPlainText from
 * rich-text editor output.
 *
 * Also normalizes whitespace: collapses multiple spaces/newlines and trims
 * leading/trailing whitespace.
 *
 * @returns Plain text with all HTML tags removed.
 */
export const stripHtmlTags = ({ html }: StripHtmlTagsParams): string => {
  if (!html) {
    return "";
  }

  const withoutTags = html.replace(/<[^>]*>/g, " ");
  const decoded = decodeHtmlEntities({ text: withoutTags });
  const normalized = decoded.replace(/\s+/g, " ").trim();

  return normalized;
};

interface DecodeHtmlEntitiesParams {
  text: string;
}

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

/**
 * Decodes common HTML entities in a plain-text string.
 */
const decodeHtmlEntities = ({ text }: DecodeHtmlEntitiesParams): string => {
  return text.replace(
    /&(?:amp|lt|gt|quot|#39|apos|nbsp);/g,
    (match) => HTML_ENTITIES[match] ?? match
  );
};
