import { vectorSearchService } from "./vector-search.service";
import { ingestionService } from "./ingestion.service";
import { getChunksByDocumentId } from "@/lib/db/queries";
import { llmProvider } from "@/lib/ai/llm";
import { RAG_SYSTEM_PROMPT, buildRagPrompt } from "@/lib/ai/prompts";
import { SourceCitation } from "@/types/chat";
import { VectorSearchResult } from "@/types/rag";
import { normalizeNumber } from "@/lib/utils/number";
import { logger } from "@/lib/utils/logger";
import { RAG_DEFAULTS } from "@/config/constants";

export interface RagAnswerResult {
  answer: string;
  sources: SourceCitation[];
}

export class RagService {
  async generateAnswer(
    question: string,
    options: {
      documentId?: string;
      topK?: number;
      similarityThreshold?: number;
    } = {}
  ): Promise<RagAnswerResult> {
    logger.info("Executing RAG Pipeline", { question: question.substring(0, 100), documentId: options.documentId });

    // Step 1: Perform vector similarity search
    let searchResults: VectorSearchResult[] = [];
    try {
      searchResults = await vectorSearchService.search(question, {
        documentId: options.documentId,
        topK: options.topK || RAG_DEFAULTS.topK,
        similarityThreshold: options.similarityThreshold ?? 0.05,
      });
    } catch (err) {
      logger.warn("Initial vector similarity search yielded error", err);
    }

    // Step 2: Fallback context retrieval if vector search returned 0 results
    if (!searchResults || searchResults.length === 0) {
      logger.info("Attempting direct document chunks fallback retrieval", { documentId: options.documentId });

      searchResults = await getChunksByDocumentId(options.documentId, 8);

      // If document chunks are completely missing from DB, trigger self-indexing on the fly
      if ((!searchResults || searchResults.length === 0) && options.documentId) {
        try {
          logger.info("Chunks missing for target document. Triggering on-the-fly indexing...", { documentId: options.documentId });
          await ingestionService.processAndIndexDocument(options.documentId);
          searchResults = await getChunksByDocumentId(options.documentId, 8);
        } catch (indexErr) {
          logger.error("On-the-fly indexing failed", indexErr);
        }
      }
    }

    // Handle case where document text is completely absent
    if (!searchResults || searchResults.length === 0) {
      logger.info("No matching context chunks could be retrieved.");
      return {
        answer: "I couldn't find this information in the uploaded document. Please attach a valid PDF document.",
        sources: [],
      };
    }

    // Step 3: Build Source Citations metadata list with normalized numeric scores
    const sources: SourceCitation[] = searchResults.map((res) => {
      const numericScore = normalizeNumber(res.score, 0);
      const roundedScore = Number(numericScore.toFixed(4));

      return {
        documentId: res.chunk.documentId,
        documentName: (res.chunk.metadata?.fileName as string) || "PDF Document",
        pageNumber: res.chunk.pageNumber,
        chunkId: res.chunk.id,
        snippet: res.chunk.content.length > 200 ? res.chunk.content.substring(0, 200) + "..." : res.chunk.content,
        similarityScore: roundedScore,
      };
    });

    // Step 4: Build Grounded System & Context Prompt
    const prompt = buildRagPrompt(question, searchResults);

    // Step 5: Generate Grounded Answer via LLM Provider
    const answer = await llmProvider.generateAnswer(prompt, RAG_SYSTEM_PROMPT);

    logger.info("RAG Pipeline execution completed successfully", { sourcesCount: sources.length });

    return {
      answer,
      sources,
    };
  }
}

export const ragService = new RagService();
