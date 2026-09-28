import { vectorSearchService } from "./vector-search.service";
import { llmProvider } from "@/lib/ai/llm";
import { RAG_SYSTEM_PROMPT, buildRagPrompt } from "@/lib/ai/prompts";
import { SourceCitation } from "@/types/chat";
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
    const searchResults = await vectorSearchService.search(question, {
      documentId: options.documentId,
      topK: options.topK || RAG_DEFAULTS.topK,
      similarityThreshold: options.similarityThreshold ?? RAG_DEFAULTS.similarityThreshold,
    });

    // Handle case where no relevant chunks pass threshold
    if (!searchResults || searchResults.length === 0) {
      logger.info("No matching vector context found above threshold");
      return {
        answer: "I couldn't find this information in the uploaded document.",
        sources: [],
      };
    }

    // Step 2: Build Source Citations metadata list
    const sources: SourceCitation[] = searchResults.map((res) => ({
      documentId: res.chunk.documentId,
      documentName: (res.chunk.metadata?.fileName as string) || "PDF Document",
      pageNumber: res.chunk.pageNumber,
      chunkId: res.chunk.id,
      snippet: res.chunk.content.length > 200 ? res.chunk.content.substring(0, 200) + "..." : res.chunk.content,
      similarityScore: parseFloat(res.score.toFixed(4)),
    }));

    // Step 3: Build Grounded System & Context Prompt
    const prompt = buildRagPrompt(question, searchResults);

    // Step 4: Generate Grounded Answer via LLM
    const answer = await llmProvider.generateAnswer(prompt, RAG_SYSTEM_PROMPT);

    logger.info("RAG Pipeline execution completed successfully", { sourcesCount: sources.length });

    return {
      answer,
      sources,
    };
  }
}

export const ragService = new RagService();
