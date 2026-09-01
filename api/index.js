export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      reply: "Only POST requests are allowed."
    });
  }

  const message = (req.body?.message || "").trim();

  if (!message) {
    return res.status(400).json({
      reply: "कुछ मैसेज लिखो 🙂"
    });
  }

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [
            {
              role: "user",
              content: message
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter Error:", data);

      return res.status(response.status).json({
        reply: data?.error?.message || "OpenRouter से जवाब नहीं मिला।"
      });
    }

    const reply =
      data?.choices?.[0]?.message?.content ||
      "मुझे जवाब नहीं मिला।";

    return res.status(200).json({ reply });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      reply: "Server से connection नहीं हो पाया।"
    });
  }
      }
