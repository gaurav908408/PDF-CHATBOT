import { VectorSearchResult } from "@/types/rag";

export const RAG_SYSTEM_PROMPT = `You are a senior AI research assistant specializing in PDF Document Analysis.
Your job is to answer user questions accurately and concisely based ONLY on the provided PDF context below.

STRICT GROUNDED ANSWERING RULES:
1. Base your answer strictly on the provided PDF context snippets.
2. Do NOT invent, assume, extrapolate, or bring in outside information not supported by the text.
3. If the answer is not explicitly contained in the provided PDF context, respond ONLY with:
   "I couldn't find this information in the uploaded document."
4. Whenever you present facts or state information, cite the exact source page numbers using [Page X] markers.
5. Format your response cleanly using GitHub-flavored markdown (bullet points, bold headers, concise paragraphs).`;

export function buildRagPrompt(question: string, contextResults: VectorSearchResult[]): string {
  if (!contextResults || contextResults.length === 0) {
    return `CONTEXT FROM UPLOADED DOCUMENT(S):
No relevant context found.

USER QUESTION:
${question}

Follow system rules: state clearly that the information could not be found.`;
  }

  const formattedContext = contextResults
    .map((res, index) => {
      const fileName = (res.chunk.metadata?.fileName as string) || "Document";
      const pageNum = res.chunk.pageNumber;
      return `--- CONTEXT CHUNK ${index + 1} [Document: ${fileName} | Page ${pageNum}] ---\n${res.chunk.content}`;
    })
    .join("\n\n");

  return `CONTEXT FROM UPLOADED PDF DOCUMENT(S):
=====================================================
${formattedContext}
=====================================================

USER QUESTION:
${question}

Instruciton: Answer the user's question accurately using ONLY the PDF context above. Include page citations [Page X] where applicable.`;
}
