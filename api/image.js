export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      reply: "Only POST requests are allowed."
    });
  }

  const prompt = (req.body?.prompt || "").trim();

  if (!prompt) {
    return res.status(400).json({
      reply: "Image prompt खाली है।"
    });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      reply: "OPENROUTER_API_KEY Vercel में सेट नहीं है।"
    });
  }

  console.log("Bablu AI IMAGE API started");
  console.log("Image prompt:", prompt);

  try {

    const response = await fetch(
      "https://openrouter.ai/api/v1/images",
      {
        method: "POST",

        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://bablu-ai.vercel.app",
          "X-Title": "Bablu AI"
        },

        body: JSON.stringify({
          model: "bytedance-seed/seedream-4.5",
          prompt: prompt
        })
      }
    );

    const data = await response.json();

    console.log(
      "OpenRouter Image Status:",
      response.status
    );

    if (!response.ok) {

      console.error(
        "OpenRouter Image Error:",
        data
      );

      return res.status(response.status).json({
        reply:
          data?.error?.message ||
          "Image generate नहीं हो पाई।"
      });
    }

    const image =
      data?.data?.[0]?.b64_json;

    const mimeType =
      data?.data?.[0]?.media_type ||
      "image/png";

    if (!image) {

      console.error(
        "No image data:",
        data
      );

      return res.status(500).json({
        reply:
          "OpenRouter ने image data नहीं भेजा।"
      });
    }

    return res.status(200).json({

      type: "image",

      image: image,

      mimeType: mimeType

    });

  } catch (error) {

    console.error(
      "Image API Error:",
      error
    );

    return res.status(500).json({
      reply:
        "Image server से connection नहीं हो पाया।"
    });
  }
}
