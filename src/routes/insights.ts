import { Router, Request, Response } from "express";
import { generateTripInsights } from "../services/ai";
import { InsightsRequestSchema } from "../types";

export const insightsRouter = Router();

insightsRouter.post("/insights", async (req: Request, res: Response) => {
  // Validate request body
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