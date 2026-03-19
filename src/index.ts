import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const privacyPolicyDir = path.join(process.cwd(), "privacy-policy");
app.use(express.static(privacyPolicyDir));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/privacy-policy", (_req, res) => {
  res.sendFile(path.join(privacyPolicyDir, "privacy-policy.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});