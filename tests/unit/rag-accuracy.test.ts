import { rerankSearchResults } from "../../src/lib/vector/hybrid-search";
import { buildRagPrompt } from "../../src/lib/ai/prompts";

describe("RAG Accuracy & Hybrid Retrieval Unit Tests", () => {
  it("should boost diploma percentage chunk for 'What is my diploma percentage?' query", () => {
    const results = [
      {
        chunk: {
          id: "c1",
          documentId: "doc-1",
          chunkIndex: 0,
          pageNumber: 1,
          content: "Skills: JavaScript, React, Node.js, Next.js, PostgreSQL",
          tokenCount: 10,
        },
        score: 0.70,
      },
      {
        chunk: {
          id: "c2",
          documentId: "doc-1",
          chunkIndex: 1,
          pageNumber: 1,
          content: "Education: Diploma in Computer Engineering - 84.22% marks",
          tokenCount: 10,
        },
        score: 0.68,
      },
    ];

    const reranked = rerankSearchResults("What is my diploma percentage?", results);

    // Diploma chunk must be reranked to top position (#1)
    expect(reranked[0].chunk.id).toBe("c2");
    expect(reranked[0].chunk.content).toContain("84.22%");
  });

  it("should format prompt with exact diploma facts", () => {
    const results = [
      {
        chunk: {
          id: "c2",
          documentId: "doc-1",
          chunkIndex: 1,
          pageNumber: 1,
          content: "Education: Diploma in Computer Engineering - 84.22% marks",
          tokenCount: 10,
          metadata: { fileName: "resume.pdf" },
        },
        score: 0.95,
      },
    ];

    const prompt = buildRagPrompt("What is my diploma percentage?", results);

    expect(prompt).toContain("84.22%");
    expect(prompt).toContain("Page 1");
  });
});
