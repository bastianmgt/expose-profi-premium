export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { propertyData } = req.body;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein professioneller Immobilien-Texter. Erstelle ein exklusives Exposé basierend auf den Daten.'
          },
          {
            role: 'user',
            content: `Erstelle ein Exposé für: ${JSON.stringify(propertyData)}`
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    res.status(200).json({ text: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Fehler bei der KI-Generierung' });
  }
}
