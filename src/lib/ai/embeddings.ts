import { env } from "@/config/env";
import { RAG_DEFAULTS } from "@/config/constants";
import { logger } from "@/lib/utils/logger";

export interface IEmbeddingProvider {
  name: string;
  dimension: number;
  generateEmbedding(text: string): Promise<number[]>;
  generateBatchEmbeddings(texts: string[]): Promise<number[][]>;
}

export class OpenAIEmbeddingProvider implements IEmbeddingProvider {
  name = "OpenAI Embedding Service";
  dimension = RAG_DEFAULTS.vectorDimension;

  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = env.EMBEDDING_API_KEY || env.AI_API_KEY;
    this.model = env.EMBEDDING_MODEL_NAME || "text-embedding-3-small";
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const results = await this.generateBatchEmbeddings([text]);
    return results[0];
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    if (!texts || texts.length === 0) return [];

    // Fallback to deterministic vector generator if API key is not configured or mock
    if (!this.apiKey || this.apiKey.includes("your_") || this.apiKey.includes("mock-")) {
      logger.warn("Using fallback deterministic embedding generator (Mock API key detected)");
      return texts.map((t) => this.createMockEmbedding(t));
    }

    try {
      logger.info("Generating batch embeddings via OpenAI API", { count: texts.length, model: this.model });

      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          input: texts,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI Embedding API error (${response.status}): ${errorText}`);
      }

      const json = await response.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return json.data.map((item: any) => item.embedding);
    } catch (error) {
      logger.error("Embedding API request failed, switching to fallback generator", error);
      return texts.map((t) => this.createMockEmbedding(t));
    }
  }

  // Deterministic normalized 1536-dimensional mock vector generator for dev testing
  private createMockEmbedding(text: string): number[] {
    const dim = this.dimension;
    const vector = new Array(dim).fill(0);
    let hash = 0;

    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }

    let norm = 0;
    for (let i = 0; i < dim; i++) {
      const val = Math.sin(hash + i);
      vector[i] = val;
      norm += val * val;
    }

    norm = Math.sqrt(norm);
    return vector.map((v) => (norm > 0 ? v / norm : 0));
  }
}

export const embeddingProvider: IEmbeddingProvider = new OpenAIEmbeddingProvider();
