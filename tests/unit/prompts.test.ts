import { buildRagPrompt } from "../../src/lib/ai/prompts";

describe("RAG Prompts Unit Tests", () => {
  it("should format context with page markers and document names", () => {
    const mockResults = [
      {
        chunk: {
          id: "c1",
          documentId: "d1",
          chunkIndex: 0,
          pageNumber: 5,
          content: "The company revenue grew by 25% in 2024.",
          tokenCount: 10,
          metadata: { fileName: "report.pdf" },
        },
        score: 0.92,
      },
    ];

    const prompt = buildRagPrompt("What was the revenue growth?", mockResults);

    expect(prompt).toContain("report.pdf");
    expect(prompt).toContain("Page 5");
    expect(prompt).toContain("The company revenue grew by 25%");
  });

  it("should handle empty context results gracefully", () => {
    const prompt = buildRagPrompt("Where is the office located?", []);
    expect(prompt).toContain("No relevant context found");
  });
});
