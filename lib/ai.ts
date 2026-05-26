import { GoogleGenerativeAI } from "@google/generative-ai";

type Suggestions = { standard: string; friendly: string; fix_issue: string };

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "models/gemini-2.5-flash";

export async function generateWithGemini(review: { text?: string; rating?: number; author?: string }): Promise<Suggestions> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY for Gemini provider");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const prompt = `Bạn là nhân viên chăm sóc khách hàng. Viết 3 câu trả lời JSON (standard, friendly, fix_issue) cho review:\n"${review.text}"`;
  // small delay to avoid 429 spikes
  await new Promise((r) => setTimeout(r, 500));
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    return JSON.parse(text) as Suggestions;
  } catch {
    throw new Error("Gemini returned non-JSON response");
  }
}

export async function generateWithOpenAI(review: { text?: string; rating?: number; author?: string }): Promise<Suggestions> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Missing OPENAI_API_KEY");

  const system = `You are a customer support assistant. Produce a JSON object with keys: standard, friendly, fix_issue. Replies should be short.`;
  const user = `Review (${review.rating ?? "?"}): "${review.text}"\nAuthor: ${review.author ?? "guest"}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: process.env.OPENAI_MODEL ?? "gpt-4o-mini", messages: [{ role: "system", content: system }, { role: "user", content: user }], max_tokens: 400 }),
  });

  const body = await res.json();
  const txt = body?.choices?.[0]?.message?.content ?? "";

  try {
    return JSON.parse(txt) as Suggestions;
  } catch {
    throw new Error("OpenAI returned non-JSON response");
  }
}

export async function generateSuggestions(review: { text?: string; rating?: number; author?: string }) {
  const provider = (process.env.AI_PROVIDER || "gemini").toLowerCase();
  try {
    if (provider === "openai") return await generateWithOpenAI(review);
    return await generateWithGemini(review);
  } catch (e) {
    // rethrow to calling route which may fallback
    throw e;
  }
}

export default { generateSuggestions };
