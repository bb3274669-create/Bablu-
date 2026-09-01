export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      reply: "Only POST requests are allowed."
    });
  }

  const message = (req.body?.message || "").trim();

  if (!message) {
    return res.status(400).json({
      reply: "मुझे कोई message भेजो 😊"
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-5.6-luna",
        input: message
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      return res.status(500).json({
        reply: "AI server se response nahi mila."
      });
    }

    const reply =
      data.output_text ||
      "Mujhe AI se koi jawab nahi mila.";

    return res.status(200).json({ reply });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      reply: "Server se connection nahi ho paya."
    });
  }
      }
