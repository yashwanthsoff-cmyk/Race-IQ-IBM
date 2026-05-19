const GEMINI_MODELS = { reasoning: "gemini-2.5-pro", fast: "gemini-2.5-flash" };
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const cleanJSON = (t: string) => t.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type CallOpts = {
  model?: string;
  systemPrompt?: string;
  userMessage?: string;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
  expectJSON?: boolean;
  temperature?: number;
  maxTokens?: number;
  retries?: number;
};

export const getApiKey = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("raceiq_gemini_key") || (import.meta as any).env?.VITE_GEMINI_API_KEY || null;
};

export const callGemini = async ({
  model = GEMINI_MODELS.reasoning,
  systemPrompt = "",
  userMessage = "",
  conversationHistory = [],
  expectJSON = false,
  temperature = 0.7,
  maxTokens = 2048,
  retries = 2,
}: CallOpts): Promise<any> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("No Gemini API key configured. Please configure it in Settings.");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const contents = [
      ...conversationHistory.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      { role: "user", parts: [{ text: `SYSTEM:\n${systemPrompt}\n\nUSER:\n${userMessage}` }] },
    ];

    const response = await fetch(`${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents, generationConfig: { temperature, topP: 0.95, maxOutputTokens: maxTokens } }),
    });
    clearTimeout(timeout);

    if (response.status === 429 && retries > 0) {
      await sleep(2000);
      return callGemini({ model, systemPrompt, userMessage, conversationHistory, expectJSON, temperature, maxTokens, retries: retries - 1 });
    }
    if (!response.ok) {
      const e = await response.json().catch(() => ({}));
      throw new Error(e?.error?.message || "Gemini API request failed");
    }
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!text) throw new Error("Gemini returned an empty response");
    if (expectJSON) {
      try { return JSON.parse(cleanJSON(text)); } catch { throw new Error("Gemini returned malformed JSON"); }
    }
    return text;
  } catch (error: any) {
    if (error.name === "AbortError") throw new Error("Gemini request timed out. Please retry.");
    throw error;
  }
};

export { GEMINI_MODELS };
export default callGemini;
