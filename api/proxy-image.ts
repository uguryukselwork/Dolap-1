export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const url = req.method === "POST" ? req.body?.url : req.query?.url;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing image url parameter." });
  }

  if (url.startsWith("data:")) {
    return res.status(200).json({ success: true, dataUrl: url });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      return res
        .status(400)
        .json({ error: `Resim indirilemedi (HTTP ${response.status})` });
    }

    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const mime = contentType.split(";")[0].trim();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:${mime};base64,${base64}`;

    return res.status(200).json({ success: true, dataUrl });
  } catch (err: any) {
    return res.status(500).json({
      error: err?.message || "Resim bağlantısı yüklenemedi.",
    });
  }
}
