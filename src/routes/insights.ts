import { Router, Request, Response } from "express";
import { generateTripInsights, generateChatReply } from "../services/ai.ts";
import { InsightsRequestSchema, ChatRequestSchema } from "../types/index.ts";

export const insightsRouter = Router();

// --- EXISTING INSIGHTS ROUTE ---
insightsRouter.post("/insights", async (req: Request, res: Response) => {
  const parsed = InsightsRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request body",
      details: parsed.error.flatten(),
    });
  }

  try {
    const suggestions = await generateTripInsights(parsed.data);
    return res.json({ suggestions });
  } catch (err) {
    console.error("[Route] /insights failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// --- NEW CHAT ROUTE YOU MISSED ---
insightsRouter.post("/chat", async (req: Request, res: Response) => {
  const parsed = ChatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request body",
      details: parsed.error.flatten(),
    });
  }

  try {
    const reply = await generateChatReply(parsed.data);
    return res.json({ reply });
  } catch (err) {
    console.error("[Route] /chat failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});