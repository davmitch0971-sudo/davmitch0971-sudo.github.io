const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post("/api/adcreator", async (req, res) => {
  try {
    const {
      product,
      audience,
      platform,
      tone,
      pain,
      promise,
      offer,
    } = req.body || {};

    if (!product || !audience || !pain || !promise) {
      return res.status(400).json({
        error: "Missing required fields: product, audience, pain, promise",
      });
    }

    const systemPrompt = `
You are AdCreator AI, a senior direct-response strategist.
Return ONLY JSON:
{
  "variants": [
    { "headline": "", "body": "", "cta": "", "angle": "" }
  ]
}
    `.trim();

    const userPrompt = `
Product: ${product}
Audience: ${audience}
Platform: ${platform}
Tone: ${tone}
Pain: ${pain}
Promise: ${promise}
Offer: ${offer || "Not provided"}
    `.trim();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      return res.status(500).json({
        error: "Failed to parse AI response",
        raw,
      });
    }

    return res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`AdCreator backend running on port ${PORT}`);
});
