import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";

// 1. IMPORT YOUR ROUTER
import { insightsRouter } from "./routes/insights";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const privacyPolicyDir = path.join(process.cwd(), "privacy-policy");
app.use(express.static(privacyPolicyDir));

// 2. MOUNT THE ROUTER
// This makes your endpoints available at /api/insights and /api/chat
app.use("/api", insightsRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/privacy-policy", (_req, res) => {
  res.sendFile(path.join(privacyPolicyDir, "privacy-policy.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});