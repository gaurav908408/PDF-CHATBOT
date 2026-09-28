import { VectorSearchResult } from "@/types/rag";

export const RAG_SYSTEM_PROMPT = `You are an expert AI research assistant specializing in PDF Document Analysis.
Your job is to answer user questions accurately and concisely based ONLY on the provided PDF context below.

GROUNDED ANSWERING RULES:
1. Base your answer strictly on the provided PDF context snippets.
2. If the user asks for a summary, key points, overview, or specific details, extract and format them clearly using the provided PDF context.
3. Do NOT invent or assume facts not supported by the text.
4. Only if no text content is provided in the context, state: "I couldn't find this information in the uploaded document."
5. Whenever possible, cite the specific source page numbers using [Page X] markers.
6. Format your response cleanly using GitHub-flavored markdown (bullet points, bold headers, concise paragraphs).`;

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

Instruction: Answer the user's question accurately using ONLY the PDF context above. Provide a structured, clear response with page citations [Page X].`;
}
