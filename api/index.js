export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      reply: "Only POST requests are allowed."
    });
  }

  const body = req.body || {};
  const message = (body.message || "").trim();

  if (!message) {
    return res.status(400).json({
      reply: "कुछ मैसेज लिखो 🙂"
    });
  }

  try {
    /*
      Bablu AI V1.1
      Supports:
      - Normal message
      - Optional chat history
      - OpenRouter free model
    */

    const history = Array.isArray(body.history)
      ? body.history
          .filter(item =>
            item &&
            (item.type === "user" || item.type === "ai") &&
            typeof item.text === "string"
          )
          .slice(-20)
      : [];

    const messages = [
      {
        role: "system",
        content:
          "You are Bablu AI, a helpful, friendly and intelligent AI assistant. Answer clearly and naturally. If the user speaks Hindi, reply in Hindi."
      }
    ];

    for (const item of history) {
      messages.push({
        role: item.type === "user" ? "user" : "assistant",
        content: item.text
      });
    }

    /*
      Make sure the current message is included.
    */
    messages.push({
      role: "user",
      content: message
    });

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
          messages: messages
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter Error:", data);

      return res.status(response.status).json({
        reply:
          data?.error?.message ||
          "OpenRouter से जवाब नहीं मिला।"
      });
    }

    const reply =
      data?.choices?.[0]?.message?.content ||
      "मुझे जवाब नहीं मिला।";

    return res.status(200).json({
      reply: reply
    });

  } catch (error) {
    console.error("Server Error:", error);

    return res.status(500).json({
      reply: "Server से connection नहीं हो पाया।"
    });
  }
  
