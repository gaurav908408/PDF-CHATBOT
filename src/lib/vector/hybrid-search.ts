import { VectorSearchResult } from "@/types/rag";
import { normalizeNumber } from "@/lib/utils/number";

/**
 * Lightweight hybrid reranking algorithm.
 * Combines dense vector similarity score with exact keyword matching bonus
 * for short factual queries (diploma, percentage, CGPA, skills, etc.).
 */
export function rerankSearchResults(
  query: string,
  results: VectorSearchResult[]
): VectorSearchResult[] {
  if (!results || results.length === 0) return [];

  const queryTerms = extractQueryKeywords(query);
  if (queryTerms.length === 0) return results;

  const reranked = results.map((res) => {
    const contentLower = res.chunk.content.toLowerCase();
    let keywordMatches = 0;

    for (const term of queryTerms) {
      if (contentLower.includes(term)) {
        keywordMatches += 1;
      }
    }

    // Calculate keyword boost (0.15 boost per matching query term)
    const keywordBoost = (keywordMatches / queryTerms.length) * 0.35;
    const baseVectorScore = normalizeNumber(res.score, 0);
    const finalScore = Number((baseVectorScore + keywordBoost).toFixed(4));

    return {
      ...res,
      score: finalScore,
    };
  });

  // Sort by combined score descending
  reranked.sort((a, b) => b.score - a.score);

  return reranked;
}

function extractQueryKeywords(query: string): string[] {
  const stopWords = new Set([
    "what", "is", "my", "the", "a", "an", "in", "of", "for", "on", "to", "and", "or",
    "give", "me", "brief", "summary", "points", "tell", "which", "do", "i", "know",
    "are", "was", "were", "have", "has", "had"
  ]);

  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s.%]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 2 && !stopWords.has(word));
}
