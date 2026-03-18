const SYSTEM = `You are the world's best COD Mobile Multiplayer coach. You give elite, optimized, personalized advice.

RULES:
- Always adapt to player profile
- Be specific, not generic
- Explain WHY
- Use exact numbers

ALWAYS return JSON:

type "chat": { "type":"chat", "text":"" }
type "loadout": { "type":"loadout", "text":"" }
type "sensitivity": { "type":"sensitivity", "text":"" }
`;

function detectProfile(input) {
  const text = (input || "").toLowerCase();
  const updates = {};

  if (text.includes("aggressive")) updates.playstyle = "aggressive";
  if (text.includes("sniper")) updates.playstyle = "sniper";
  if (text.includes("passive")) updates.playstyle = "passive";

  if (text.includes("ipad")) updates.device = "ipad";
  if (text.includes("phone")) updates.device = "phone";

  if (text.includes("4 finger")) updates.fingers = 4;

  if (text.includes("legendary")) updates.rank = "legendary";

  return updates;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { messages, profile } = req.body;

  const profileBlock =
    profile && Object.keys(profile).length > 0
      ? `\n\nPLAYER PROFILE:\n${JSON.stringify(profile)}`
      : "";

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: SYSTEM + profileBlock,
        messages,
      }),
    });

    const data = await response.json();

    console.log("CLAUDE RAW:", JSON.stringify(data, null, 2));

    let text = "";

    if (data?.content && Array.isArray(data.content)) {
      text = data.content.map((b) => b.text || "").join("");
    }

    if (!text) {
      text = '{"type":"chat","text":"AI returned empty."}';
    }

    try {
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      return res.status(200).json({
        ...parsed,
        detectedProfile: detectProfile(
          messages[messages.length - 1]?.content
        ),
      });
    } catch {
      return res.status(200).json({
        type: "chat",
        text,
      });
    }
  } catch (err) {
    return res.status(500).json({
      type: "chat",
      text: "Server error. Check API key.",
    });
  }
}