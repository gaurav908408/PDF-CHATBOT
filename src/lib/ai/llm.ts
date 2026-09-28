import { env } from "@/config/env";
import { logger } from "@/lib/utils/logger";

export interface ILLMProvider {
  name: string;
  generateAnswer(prompt: string, systemPrompt?: string): Promise<string>;
}

export class MultiProviderLLMService implements ILLMProvider {
  name = "Multi-Provider AI LLM Service (Gemini & OpenAI)";
  private apiKey: string;

  constructor() {
    this.apiKey = env.AI_API_KEY;
  }

  async generateAnswer(prompt: string, systemPrompt?: string): Promise<string> {
    if (!prompt || !prompt.trim()) {
      throw new Error("Prompt cannot be empty");
    }

    if (!this.apiKey || this.apiKey.includes("your_") || this.apiKey.includes("mock-")) {
      logger.warn("Using fallback grounded response synthesizer (No API Key detected)");
      return this.synthesizeMockAnswer(prompt);
    }

    // Determine if key is Gemini API key or OpenAI key
    const isGeminiKey = this.apiKey.startsWith("AQ.") || this.apiKey.startsWith("AIzaSy") || this.apiKey.length > 30;

    if (isGeminiKey) {
      try {
        return await this.callGeminiApi(prompt, systemPrompt);
      } catch (geminiError) {
        logger.warn("Gemini API call failed, trying OpenAI or fallback", geminiError);
      }
    }

    try {
      return await this.callOpenAiApi(prompt, systemPrompt);
    } catch (openAiError) {
      logger.warn("OpenAI API call failed, using intelligent fallback synthesizer", openAiError);
      return this.synthesizeMockAnswer(prompt);
    }
  }

  private async callGeminiApi(prompt: string, systemPrompt?: string): Promise<string> {
    logger.info("Sending LLM request to Google Gemini API");

    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: fullPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errText}`);
    }

    const json = await response.json();
    const answer = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!answer) {
      throw new Error("Empty response returned by Gemini API");
    }

    return answer.trim();
  }

  private async callOpenAiApi(prompt: string, systemPrompt?: string): Promise<string> {
    logger.info("Sending LLM request to OpenAI API");

    const messages = [
      ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
      { role: "user", content: prompt },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: env.AI_MODEL_NAME || "gpt-4o-mini",
        messages,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API Error (${response.status}): ${errText}`);
    }

    const json = await response.json();
    const answer = json.choices?.[0]?.message?.content;
    if (!answer) {
      throw new Error("Empty response returned by OpenAI API");
    }

    return answer.trim();
  }

  // Intelligent context synthesizer fallback when offline
  private synthesizeMockAnswer(prompt: string): string {
    if (prompt.includes("No relevant context found")) {
      return "I couldn't find this information in the uploaded document.";
    }

    // Extract extracted context lines from prompt
    const contextLines = prompt
      .split("\n")
      .filter((line) => !line.startsWith("---") && !line.startsWith("==") && !line.startsWith("CONTEXT") && !line.startsWith("USER") && line.trim().length > 10)
      .slice(0, 10);

    const pages = Array.from(new Set(Array.from(prompt.matchAll(/\[Page (\d+)\]/g)).map((m) => m[1]))).join(", ");

    if (contextLines.length === 0) {
      return "I couldn't find this information in the uploaded document.";
    }

    return `Here is a summary based on your uploaded document [Page ${pages || "1"}]:\n\n` +
      contextLines.map((line, idx) => `• **Point ${idx + 1}**: ${line.trim()}`).join("\n");
  }
}

export const llmProvider: ILLMProvider = new MultiProviderLLMService();
