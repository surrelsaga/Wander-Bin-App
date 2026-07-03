// Vercel serverless function — keeps the Gemini key server-side.
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const PROMPT = `
  Analyze this trash item.
  1. Is it RECYCLABLE in Singapore? (Boolean).
  2. What is the item name? (Short string).
  3. Why? (Short 1-sentence reason).
  4. Return ONLY JSON: { "isRecyclable": true, "itemName": "Plastic Bottle", "reason": "It is clean PET plastic." }
`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const { data, mimeType } = req.body;
    const result = await model.generateContent([
      PROMPT,
      { inlineData: { data, mimeType } },
    ]);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    return res.status(200).json(JSON.parse(text));
  } catch (error) {
    console.error("Gemini Scan Error:", error);
    return res.status(500).json({
      error: "scan failed",
      detail: error?.message,
      hasKey: Boolean(process.env.GEMINI_API_KEY),
    });
  }
}
