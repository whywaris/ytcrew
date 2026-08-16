export interface TocItem {
  id: string;
  text: string;
  level: number; // 2 for h2, 3 for h3
}

/**
 * Decodes standard and numerical HTML entities back into regular text characters.
 */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;|&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, dec) => {
      try {
        return String.fromCharCode(parseInt(dec, 10));
      } catch {
        return "";
      }
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      try {
        return String.fromCharCode(parseInt(hex, 16));
      } catch {
        return "";
      }
    });
}

/**
 * Extracts Table of Contents from HTML content and injects IDs into <h2> and <h3> tags.
 */
export function processBlogContent(html: string): {
  toc: TocItem[];
  processedHtml: string;
} {
  if (!html) {
    return { toc: [], processedHtml: "" };
  }

  const toc: TocItem[] = [];
  let index = 0;

  // Regex to find <h2> and <h3> tags (with optional attributes)
  const processedHtml = html.replace(
    /<(h[23])([^>]*)>(.*?)<\/\1>/gi,
    (_match, tag, attrs, text) => {
      // 1. Strip inner HTML tags
      const strippedText = text.replace(/<[^>]*>/g, "").trim();
      if (!strippedText) return _match;

      // 2. Decode HTML entities (e.g. &amp; -> &)
      const cleanText = decodeHtmlEntities(strippedText);

      const level = parseInt(tag.charAt(1), 10);
      const slugId =
        cleanText
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-") || `heading-${index}`;

      const uniqueId = `${slugId}-${index++}`;

      toc.push({
        id: uniqueId,
        text: cleanText,
        level,
      });

      // Preserve existing attributes if any, adding the unique id
      const cleanAttrs = attrs ? attrs.replace(/id="[^"]*"/gi, "") : "";
      return `<${tag} id="${uniqueId}" ${cleanAttrs}>${text}</${tag}>`;
    }
  );

  // Wrap tables in responsive container if not already wrapped
  let finalHtml = processedHtml.replace(
    /(?:<div class="table-wrapper">)?(<table[\s\S]*?<\/table>)(?:<\/div>)?/gi,
    '<div class="table-wrapper">$1</div>'
  );

  return { toc, processedHtml: finalHtml };
}

/**
 * Splits article HTML at the middle point (before middle <h2> or middle <p>)
 * to allow inserting an in-article ad slot directly between content sections.
 */
export function splitContentForAd(html: string): {
  beforeAd: string;
  afterAd: string;
} {
  if (!html) {
    return { beforeAd: "", afterAd: "" };
  }

  // Strategy 1: Find all <h2> tags
  const h2Matches = Array.from(html.matchAll(/<h2[^>]*>/gi));
  if (h2Matches.length >= 2) {
    // Pick middle H2 (e.g. index 1 if 2 or 3, index 2 if 4 or 5)
    const targetH2Index = Math.floor(h2Matches.length / 2);
    const targetMatch = h2Matches[targetH2Index];
    if (targetMatch && typeof targetMatch.index === "number") {
      return {
        beforeAd: html.slice(0, targetMatch.index),
        afterAd: html.slice(targetMatch.index),
      };
    }
  }

  // Strategy 2: If fewer than 2 H2s, split at the middle paragraph closing tag </p>
  // Ensure we don't split inside <table> or other containers
  const pMatches = Array.from(html.matchAll(/<\/p>/gi));
  if (pMatches.length >= 2) {
    const validMatches = pMatches.filter((match) => {
      if (typeof match.index !== "number") return false;
      const textBefore = html.slice(0, match.index);
      const openTableCount = (textBefore.match(/<table[^>]*>/gi) || []).length;
      const closeTableCount = (textBefore.match(/<\/table>/gi) || []).length;
      return openTableCount === closeTableCount; // Not inside a table
    });

    const candidates = validMatches.length > 0 ? validMatches : pMatches;
    const targetPIndex = Math.floor(candidates.length / 2);
    const targetMatch = candidates[targetPIndex];
    if (targetMatch && typeof targetMatch.index === "number") {
      const splitPos = targetMatch.index + targetMatch[0].length;
      return {
        beforeAd: html.slice(0, splitPos),
        afterAd: html.slice(splitPos),
      };
    }
  }

  // Fallback for very short articles
  return {
    beforeAd: html,
    afterAd: "",
  };
}

