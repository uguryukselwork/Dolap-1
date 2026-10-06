import { GoogleGenAI, Type } from "@google/genai";

export interface BodyLandmarks {
  centerX: number;       // 0-100 horizontal center of torso/hips
  neckY: number;         // 0-100 top of chest / base of neck
  shoulderWidth: number; // 0-100 width of shoulders relative to image width
  waistY: number;        // 0-100 natural waistline Y
  waistWidth: number;    // 0-100 width of waist relative to image width
  hipY: number;          // 0-100 widest part of hips Y
  hipWidth: number;      // 0-100 width of hips relative to image width
  kneeY: number;         // 0-100 knee level Y
  ankleY: number;        // 0-100 ankle/shoe level Y
}

const DEFAULT_LANDMARKS: BodyLandmarks = {
  centerX: 50,
  neckY: 24,
  shoulderWidth: 30,
  waistY: 42,
  waistWidth: 24,
  hipY: 52,
  hipWidth: 30,
  kneeY: 70,
  ankleY: 87,
};

async function resolveImage(input: string): Promise<{ mimeType: string; base64: string }> {
  if (!input) {
    throw new Error("Empty image input");
  }

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
    const resp = await fetch(input);
    if (!resp.ok) {
      throw new Error(`Failed to fetch image URL: ${input} (${resp.status})`);
    }
    const arrayBuffer = await resp.arrayBuffer();
    const contentType = resp.headers.get("content-type") || "image/jpeg";
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    return {
      mimeType: contentType.split(";")[0],
      base64,
    };
  }

  return { mimeType: "image/jpeg", base64: input };
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const {
    avatarImage,
    clothingImages = [],
    waistLevel = 50,
    description = "",
  } = req.body || {};

  if (!avatarImage) {
    return res.status(400).json({ error: "avatarImage is required for virtual try-on." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      success: true,
      imageUrl: avatarImage,
      landmarks: DEFAULT_LANDMARKS,
      fallback: true,
    });
  }

  let parsedAvatar: { mimeType: string; base64: string };
  try {
    parsedAvatar = await resolveImage(avatarImage);
  } catch {
    return res.status(200).json({
      success: true,
      imageUrl: avatarImage,
      landmarks: DEFAULT_LANDMARKS,
      fallback: true,
    });
  }

  const parts: any[] = [
    {
      inlineData: {
        mimeType: parsedAvatar.mimeType,
        data: parsedAvatar.base64,
      },
    },
  ];

  if (Array.isArray(clothingImages)) {
    for (const clothImg of clothingImages) {
      if (clothImg) {
        try {
          const parsedCloth = await resolveImage(clothImg);
          parts.push({
            inlineData: {
              mimeType: parsedCloth.mimeType,
              data: parsedCloth.base64,
            },
          });
        } catch {
          // Ignore individual garment download error
        }
      }
    }
  }

  const promptText = `High fashion photorealistic virtual try-on.
The first image is a full-body person (avatar).
The subsequent images are garments to be dressed on this exact person.
Task: Generate a realistic studio photograph of this EXACT same person wearing these garments: ${description || "selected top and skirt/bottom"}.
Maintain the exact same pose, body proportions, face, hair, and background.
Fit instructions:
- Replace the existing clothes on the person's body with the selected top and skirt/bottom.
- Adjust garments naturally on the body with realistic cloth drape, creases, shadows and lighting.
- The waist level parameter is set to ${waistLevel}/100: where the top ends and bottom waistband begins.
Photorealistic studio lighting, full body shot, high-definition fashion lookbook quality.`;

  parts.push({ text: promptText });

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  const tryImageModel = async (modelName: string): Promise<string> => {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error(`Empty candidates from model ${modelName}`);
    }

    const resParts = candidates[0].content?.parts || [];
    for (const part of resParts) {
      if (part.inlineData && part.inlineData.data) {
        const mime = part.inlineData.mimeType || "image/png";
        return `data:${mime};base64,${part.inlineData.data}`;
      }
    }

    throw new Error(`Model ${modelName} returned text without inline image data.`);
  };

  // Detect exact body landmarks using gemini-3.8-flash so client canvas can warp & fit skirts/tops onto the exact body in the photo
  const detectBodyLandmarks = async (): Promise<BodyLandmarks> => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: parsedAvatar.mimeType,
                data: parsedAvatar.base64,
              },
            },
            {
              text: `Analyze this person's full-body photo for AI virtual clothing fitting (${description}).
Return the exact percentage coordinates (0 to 100 relative to image width and height) of their body parts so we can accurately fit a top, a skirt/pants, and shoes onto their body:
- centerX: horizontal center of their torso/waist (0-100, usually around 50)
- neckY: vertical position of collarbones / base of neck where a top begins (0-100)
- shoulderWidth: width across their shoulders as a percentage of total image width (10-70)
- waistY: vertical position of their natural waistline where a skirt/pants waistband sits (0-100)
- waistWidth: width across their waist as a percentage of total image width (8-60)
- hipY: vertical position of widest part of hips (0-100)
- hipWidth: width across hips as a percentage of total image width (10-65)
- kneeY: vertical position of knees where a mini/midi skirt ends (0-100)
- ankleY: vertical position of ankles/feet (0-100)`,
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              centerX: { type: Type.NUMBER },
              neckY: { type: Type.NUMBER },
              shoulderWidth: { type: Type.NUMBER },
              waistY: { type: Type.NUMBER },
              waistWidth: { type: Type.NUMBER },
              hipY: { type: Type.NUMBER },
              hipWidth: { type: Type.NUMBER },
              kneeY: { type: Type.NUMBER },
              ankleY: { type: Type.NUMBER },
            },
            required: [
              "centerX",
              "neckY",
              "shoulderWidth",
              "waistY",
              "waistWidth",
              "hipY",
              "hipWidth",
              "kneeY",
              "ankleY",
            ],
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return {
          centerX: Math.min(85, Math.max(15, Number(parsed.centerX) || 50)),
          neckY: Math.min(60, Math.max(8, Number(parsed.neckY) || 24)),
          shoulderWidth: Math.min(75, Math.max(12, Number(parsed.shoulderWidth) || 30)),
          waistY: Math.min(75, Math.max(20, Number(parsed.waistY) || 42)),
          waistWidth: Math.min(65, Math.max(10, Number(parsed.waistWidth) || 24)),
          hipY: Math.min(85, Math.max(25, Number(parsed.hipY) || 52)),
          hipWidth: Math.min(75, Math.max(12, Number(parsed.hipWidth) || 30)),
          kneeY: Math.min(95, Math.max(40, Number(parsed.kneeY) || 70)),
          ankleY: Math.min(98, Math.max(55, Number(parsed.ankleY) || 87)),
        };
      }
    } catch {
      // Fallback to default landmarks
    }
    return DEFAULT_LANDMARKS;
  };

  try {
    const imageUrl = await tryImageModel("gemini-3.1-flash-lite-image");
    return res.status(200).json({
      success: true,
      imageUrl,
      modelUsed: "gemini-3.1-flash-lite-image",
    });
  } catch (err1: any) {
    const msg1 = String(err1?.message || "");
    const isFreeTierQuota =
      msg1.includes("429") ||
      msg1.includes("RESOURCE_EXHAUSTED") ||
      msg1.includes("limit: 0");

    if (!isFreeTierQuota) {
      try {
        const imageUrl = await tryImageModel("gemini-3.1-flash-image");
        return res.status(200).json({
          success: true,
          imageUrl,
          modelUsed: "gemini-3.1-flash-image",
          retried: true,
        });
      } catch {
        // Proceed to Gemini 3.8 Flash body landmark detection
      }
    }

    const landmarks = await detectBodyLandmarks();

    return res.status(200).json({
      success: true,
      imageUrl: avatarImage,
      landmarks,
      fallback: true,
      modelUsed: "gemini-3.8-flash-landmarks",
    });
  }
}
