// api/generate.js
import OpenAI from 'openai';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Nur POST-Requests erlaubt' });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'API-Key fehlt in Vercel' });
    }

    const openai = new OpenAI({ apiKey });
    const { propertyData: data } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Du bist ein Immobilien-Experte. Erstelle ein exklusives Exposé." },
        { role: "user", content: `Erstelle ein Exposé für: ${JSON.stringify(data)}` }
      ],
      temperature: 0.7,
    });

    res.status(200).json({ 
      text: completion.choices[0].message.content,
      usage: completion.usage 
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(error.status || 500).json({ 
      message: error.message,
      details: error.code 
    });
  }
}
