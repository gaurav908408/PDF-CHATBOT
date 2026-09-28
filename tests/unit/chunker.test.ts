import { generateTextChunks } from "../../src/lib/pdf/chunker";

describe("Text Chunker Unit Tests", () => {
  it("should generate chunks with correct page numbers and metadata", () => {
    const pages = [
      { pageNumber: 1, text: "This is page one text content for testing RAG chunking algorithm." },
      { pageNumber: 2, text: "This is page two text content for testing RAG chunking algorithm." },
    ];

    const chunks = generateTextChunks(pages, "test-doc-id", { chunkSize: 100, chunkOverlap: 20 });
    
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].documentId).toBe("test-doc-id");
    expect(chunks[0].pageNumber).toBe(1);
    expect(chunks[0].tokenCount).toBeGreaterThan(0);
  });
});
