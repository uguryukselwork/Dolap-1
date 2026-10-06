import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  // CORS headers
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

  const { items = [], styles = [], occasion = "Casual", language = "en" } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Wardrobe items array is empty." });
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  const runSuggestion = async (modelName: string) => {
    const isTurkish = language === "tr";
    const systemPrompt = `You are a world-class personal stylist for the app 'Dolap'.
Your mission: Select an outfit combination from the user's wardrobe items that matches their preferred style aesthetic and the selected occasion.
Rules:
1. Choose matching item IDs from the provided wardrobe (e.g. 1 top + 1 bottom, or 1 dress, optionally outerwear/shoes).
2. The reason MUST be a single, catchy, encouraging sentence in ${isTurkish ? "Turkish (Türkçe)" : "English"}, highlighting why this combination works together for this occasion.
3. Only pick item IDs that actually exist in the provided wardrobe list.`;

    const wardrobeContext = items.map((i: any) => ({
      id: i.id,
      category: i.category,
      subcategory: i.subcategory,
      color: i.color,
      pattern: i.pattern,
      style: i.style,
      season: i.season,
      occasion: i.occasion,
    }));

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          text: `User Preferred Styles: ${styles.join(", ") || "Casual, Chic"}
Occasion: ${occasion}
Language: ${isTurkish ? "Turkish" : "English"}

Wardrobe Items:
${JSON.stringify(wardrobeContext, null, 2)}

Pick the best outfit for today's look, return the selected item IDs and a one-line stylist reasoning.`,
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            itemIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of chosen item IDs from the wardrobe",
            },
            reason: {
              type: Type.STRING,
              description: `One-line stylist reason in ${isTurkish ? "Turkish" : "English"}`,
            },
          },
          required: ["itemIds", "reason"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response text from Gemini");
    return JSON.parse(text);
  };

  try {
    try {
      const result = await runSuggestion("gemini-3.8-flash");
      return res.status(200).json({ success: true, data: result });
    } catch {
      const fallbackResult = await runSuggestion("gemini-3.8-flash");
      return res.status(200).json({ success: true, data: fallbackResult, retried: true });
    }
  } catch {
    const isTurkish = language === "tr";
    const defaultIds = items.slice(0, 2).map((i: any) => i.id);
    return res.status(200).json({
      success: true,
      data: {
        itemIds: defaultIds,
        reason: isTurkish
          ? "Renk uyumu ve modern kesimleriyle günün her anına zahmetsiz şıklık katan dengeli bir kombin."
          : "A balanced combination pairing harmonious tones with effortless modern proportions.",
      },
      fallback: true,
    });
  }
}
