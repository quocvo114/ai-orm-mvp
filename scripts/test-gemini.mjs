#!/usr/bin/env node
/*
  Simple Gemini tester script (requires GEMINI_API_KEY in env).
  Usage:
    GEMINI_API_KEY=your_key node scripts/test-gemini.mjs

  Note: This script is for local testing only. It is not committed by request.
*/
import { TextServiceClient } from "@google/generative-ai";

async function main() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error("GEMINI_API_KEY is not set. Export it before running.");
    console.error("Example: GEMINI_API_KEY=xxx node scripts/test-gemini.mjs");
    process.exit(1);
  }

  const client = new TextServiceClient({ apiKey: key });

  try {
    const response = await client.generateText({
      model: process.env.GEMINI_MODEL || "models/text-bison-001",
      input: process.env.GEMINI_PROMPT || "Generate a short polite reply to a 2-star review"
    });

    console.log("--- raw response ---");
    console.log(JSON.stringify(response, null, 2));
  } catch (err) {
    console.error("Error calling Gemini:", err);
    process.exitCode = 1;
  }
}

main();
