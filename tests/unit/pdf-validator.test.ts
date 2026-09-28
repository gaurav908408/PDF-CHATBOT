import { validatePdfFile } from "../../src/lib/pdf/validator";

describe("PDF Validator Unit Tests", () => {
  it("should reject non-PDF file extensions", async () => {
    const file = new File(["dummy text"], "test.txt", { type: "text/plain" });
    const result = await validatePdfFile(file);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Only PDF files are allowed");
  });

  it("should reject empty 0-byte files", async () => {
    const file = new File([], "empty.pdf", { type: "application/pdf" });
    const result = await validatePdfFile(file);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("empty");
  });
});
