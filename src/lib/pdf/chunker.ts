import { ChunkingOptions } from "@/types/rag";
import { RAG_DEFAULTS } from "@/config/constants";

export interface GeneratedChunk {
  documentId: string;
  chunkIndex: number;
  pageNumber: number;
  content: string;
  tokenCount: number;
  metadata: {
    wordCount: number;
    charCount: number;
    startChar: number;
    endChar: number;
  };
}

export function generateTextChunks(
  pages: { pageNumber: number; text: string }[],
  documentId: string,
  options: Partial<ChunkingOptions> = {}
): GeneratedChunk[] {
  const chunkSize = options.chunkSize || RAG_DEFAULTS.chunkSize;
  const chunkOverlap = options.chunkOverlap || RAG_DEFAULTS.chunkOverlap;

  const chunks: GeneratedChunk[] = [];
  let globalChunkIndex = 0;

  for (const page of pages) {
    const text = page.text.trim();
    if (!text) continue;

    if (text.length <= chunkSize) {
      // Single chunk for small page content
      chunks.push(createChunkObject(text, documentId, globalChunkIndex++, page.pageNumber, 0, text.length));
      continue;
    }

    // Sliding window chunking per page
    let start = 0;
    while (start < text.length) {
      let end = start + chunkSize;

      if (end >= text.length) {
        end = text.length;
      } else {
        // Try to break at logical boundaries (paragraph, sentence, or space)
        const logicalBreak = findLogicalBreak(text, start, end);
        if (logicalBreak > start) {
          end = logicalBreak;
        }
      }

      const chunkContent = text.slice(start, end).trim();
      if (chunkContent.length > 0) {
        chunks.push(
          createChunkObject(chunkContent, documentId, globalChunkIndex++, page.pageNumber, start, end)
        );
      }

      if (end >= text.length) {
        break;
      }

      // Advance sliding window by (chunkSize - chunkOverlap)
      const step = end - start - chunkOverlap;
      start += step > 0 ? step : chunkSize - chunkOverlap;
    }
  }

  return chunks;
}

function findLogicalBreak(text: string, start: number, targetEnd: number): number {
  const searchWindow = text.slice(start, targetEnd);
  
  // 1. Try paragraph break (\n\n)
  const paragraphBreak = searchWindow.lastIndexOf("\n\n");
  if (paragraphBreak > 200) {
    return start + paragraphBreak + 2;
  }

  // 2. Try newline break (\n)
  const lineBreak = searchWindow.lastIndexOf("\n");
  if (lineBreak > 200) {
    return start + lineBreak + 1;
  }

  // 3. Try sentence break (. / ? / !)
  const sentenceMatches = Array.from(searchWindow.matchAll(/[.!?]\s+/g));
  if (sentenceMatches.length > 0) {
    const lastSentence = sentenceMatches[sentenceMatches.length - 1];
    if (lastSentence.index && lastSentence.index > 150) {
      return start + lastSentence.index + lastSentence[0].length;
    }
  }

  // 4. Try word space break
  const spaceBreak = searchWindow.lastIndexOf(" ");
  if (spaceBreak > 100) {
    return start + spaceBreak + 1;
  }

  return targetEnd;
}

function createChunkObject(
  content: string,
  documentId: string,
  chunkIndex: number,
  pageNumber: number,
  startChar: number,
  endChar: number
): GeneratedChunk {
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  // Estimate ~4 characters per token
  const tokenCount = Math.ceil(content.length / 4);

  return {
    documentId,
    chunkIndex,
    pageNumber,
    content,
    tokenCount,
    metadata: {
      wordCount,
      charCount: content.length,
      startChar,
      endChar,
    },
  };
}
