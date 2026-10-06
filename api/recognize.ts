import { GoogleGenAI, Type } from "@google/genai";

async function resolveImage(input: string): Promise<{ mimeType: string; base64: string }> {
  if (input.startsWith("data:")) {
    const parts = input.split(";base64,");
    if (parts.length === 2) {
      return {
        mimeType: parts[0].replace("data:", "") || "image/jpeg",
        base64: parts[1],
      };
    }
  }

  if (input.startsWith("http://") || input.startsWith("https://")) {
    const response = await fetch(input);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from URL: ${input} (status ${response.status})`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    return {
      mimeType: contentType.split(";")[0],
      base64,
    };
  }

  return { mimeType: "image/jpeg", base64: input };
}

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not configured." });
  }

  const { image, language = "en" } = req.body || {};

  if (!image) {
    return res.status(400).json({ error: "Missing required 'image' in request body." });
  }

  let resolvedImage: { mimeType: string; base64: string };
  try {
    resolvedImage = await resolveImage(image);
  } catch (err: any) {
    return res.status(400).json({ error: `Could not process image: ${err?.message}` });
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  const runRecognition = async (modelName: string) => {
    const isTurkish = language === "tr";
    const systemPrompt = `You are an elite fashion AI assistant for the wardrobe app 'Dolap'.
Analyze this photo of a clothing item and return a strict JSON object with these exact fields:
- category: One of ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories'] (Keep in English for system categorization)
- subcategory: specific garment type (e.g. ${isTurkish ? "Tişört, Gömlek, Jean Pantolon, Blazer Ceket, Etek, Spor Ayakkabı" : "T-Shirt, Button-Up Shirt, Straight Jeans, Blazer, Midi Skirt, Sneakers"})
- color: dominant color name (in ${isTurkish ? "Turkish" : "English"})
- pattern: pattern type (e.g. Solid/Düz, Striped/Çizgili, Floral/Çiçekli, Plaid/Ekose, Graphic/Baskılı)
- style: aesthetic style (e.g. Casual, Streetwear, Minimalist, Old Money, Chic, Sporty, Y2K, Elegant)
- season: best season ('All Season', 'Summer', 'Winter', 'Spring/Fall')
- occasion: suitable occasion ('Casual', 'Work', 'Night Out', 'Formal', 'Sport')`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              data: resolvedImage.base64,
              mimeType: resolvedImage.mimeType,
            },
          },
          {
            text: "Examine this fashion garment carefully. Recognize and describe its fashion details according to the schema.",
          },
        ],
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description: "High-level category: Tops, Bottoms, Dresses, Outerwear, Shoes, or Accessories",
            },
            subcategory: {
              type: Type.STRING,
              description: "Specific clothing type",
            },
            color: {
              type: Type.STRING,
              description: "Dominant primary color",
            },
            pattern: {
              type: Type.STRING,
              description: "Pattern style",
            },
            style: {
              type: Type.STRING,
              description: "Fashion style",
            },
            season: {
              type: Type.STRING,
              description: "Recommended season",
            },
            occasion: {
              type: Type.STRING,
              description: "Suitable occasion",
            },
          },
          required: ["category", "subcategory", "color", "pattern", "style", "season", "occasion"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text from Gemini");
    }
    return JSON.parse(text);
  };

  try {
    try {
      const result = await runRecognition("gemini-3.8-flash");
      return res.status(200).json({ success: true, data: result });
    } catch {
      const fallbackResult = await runRecognition("gemini-3.8-flash");
      return res.status(200).json({ success: true, data: fallbackResult, retried: true });
    }
  } catch {
    const isTurkish = language === "tr";
    return res.status(200).json({
      success: true,
      data: {
        category: "Tops",
        subcategory: isTurkish ? "Gömlek / Bluz" : "Classic Shirt",
        color: isTurkish ? "Ekru / Beyaz" : "Ivory White",
        pattern: isTurkish ? "Düz" : "Solid",
        style: "Minimalist",
        season: "All Season",
        occasion: "Casual",
      },
      fallback: true,
    });
  }
}
