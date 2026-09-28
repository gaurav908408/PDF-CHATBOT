import pdfParse from "pdf-parse";
import { logger } from "@/lib/utils/logger";
import { cleanExtractedText } from "./cleaner";

export interface ParsedPdfPage {
  pageNumber: number;
  text: string;
}

export interface ParsedPdfResult {
  totalPages: number;
  pages: ParsedPdfPage[];
  info?: Record<string, unknown>;
}

export async function parsePdfPages(dataBuffer: Buffer): Promise<ParsedPdfResult> {
  try {
    const pages: ParsedPdfPage[] = [];

    // Custom pagerender function to extract page text individually
    const customPageRender = async (pageData: {
      pageIndex: number;
      getTextContent: (options?: unknown) => Promise<{ items: Array<{ str: string; transform: number[] }> }>;
    }) => {
      const pageNumber = pageData.pageIndex + 1;
      const textContent = await pageData.getTextContent({
        normalizeWhitespace: true,
        disableCombineTextItems: false,
      });

      let pageText = "";
      let lastY: number | undefined;

      for (const item of textContent.items) {
        if (lastY === item.transform[5] || lastY === undefined) {
          pageText += item.str;
        } else {
          pageText += "\n" + item.str;
        }
        lastY = item.transform[5];
      }

      const cleanedText = cleanExtractedText(pageText);

      pages.push({
        pageNumber,
        text: cleanedText,
      });

      return pageText;
    };

    const parsed = await pdfParse(dataBuffer, {
      pagerender: customPageRender,
    });

    // Ensure pages are sorted by page number
    pages.sort((a, b) => a.pageNumber - b.pageNumber);

    const actualPageCount = Math.max(parsed.numpages || 0, pages.length, 1);

    logger.info("PDF parsed successfully page-by-page", {
      totalPages: actualPageCount,
      extractedPagesCount: pages.length,
    });

    return {
      totalPages: actualPageCount,
      pages,
      info: parsed.info,
    };
  } catch (error) {
    logger.error("Failed to parse PDF document buffer", error);
    throw new Error("Failed to extract text from PDF file. File may be encrypted, password-protected, or corrupted.");
  }
}
