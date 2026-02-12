export default async function handler(req, res) {
  // === Set CORS headers on EVERY response ===
  res.setHeader('Access-Control-Allow-Origin', '*'); // or 'https://kaleidoscopic-malabi-28790f.netlify.app' for stricter
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours

  // Handle preflight OPTIONS request (this is what the browser sends first)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST after preflight
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, profileSummary } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer gsk_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`, // YOUR GROQ KEY
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are my AI reflection in a cozy coffee shop conversation. Here is my full profile:\n${profileSummary}\nRespond naturally in first person as if you are me. Keep it warm, thoughtful, and conversational.`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.75,
        max_tokens: 350,
        top_p: 0.95,
        stream: false
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
