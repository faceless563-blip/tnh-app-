import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // AI Analysis Route
  app.post("/api/analyze-report", async (req, res) => {
    const { base64ImageData, systemPrompt, userPrompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key not configured" });
    }

    // Strip base64 prefix if it exists
    const base64Data = base64ImageData.includes('base64,') 
      ? base64ImageData.split('base64,')[1] 
      : base64ImageData;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inline_data: {
                      mime_type: "image/jpeg",
                      data: base64Data
                    }
                  },
                  {
                    text: `${systemPrompt}\n\n${userPrompt}`
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 1000,
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API error:", errorData);
        return res.status(response.status).json(errorData);
      }

      const data = await response.json();
      const analysisText = data.candidates[0].content.parts[0].text;
      res.json({ text: analysisText });
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
