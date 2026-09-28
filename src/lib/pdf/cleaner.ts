export function cleanExtractedText(text: string): string {
  if (!text) return "";

  return (
    text
      // Remove null characters and non-printable control characters
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      // Fix hyphens split across newlines (e.g. "con-\ntest" -> "contest")
      .replace(/(\w+)-\s*[\r\n]+\s*(\w+)/g, "$1$2")
      // Normalize Windows carriage returns
      .replace(/\r\n/g, "\n")
      // Replace multiple consecutive tabs/spaces with a single space
      .replace(/[ \t]+/g, " ")
      // Replace 3 or more consecutive newlines with double newlines (paragraph separator)
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}
