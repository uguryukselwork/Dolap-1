import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import recognizeHandler from "./api/recognize.ts";
import suggestHandler from "./api/suggest.ts";
import tryonHandler from "./api/tryon.ts";
import proxyImageHandler from "./api/proxy-image.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Increased payload limits for image base64 uploads
  app.use(express.json({ limit: "30mb" }));
  app.use(express.urlencoded({ extended: true, limit: "30mb" }));

  // API Endpoints (matching Vercel serverless paths)
  app.all("/api/recognize", (req, res) => recognizeHandler(req, res));
  app.all("/api/suggest", (req, res) => suggestHandler(req, res));
  app.all("/api/tryon", (req, res) => tryonHandler(req, res));
  app.all("/api/proxy-image", (req, res) => proxyImageHandler(req, res));

  // Health endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "Dolap AI", timestamp: new Date().toISOString() });
  });

  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Dolap full-stack server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
