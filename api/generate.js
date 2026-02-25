export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'API-Key fehlt',
        message: 'Bitte OPENAI_API_KEY in Vercel Environment Variables setzen'
      });
    }

    const { propertyData } = req.body || {};
    
    if (!propertyData) {
      return res.status(400).json({ error: 'Keine propertyData' });
    }

    const prompt = `Erstelle ein Immobilien-Exposé für eine ${propertyData.zimmer}-Zimmer-Wohnung mit ${propertyData.wohnflaeche} m². Schreibe professionell und verkaufsstark (ca. 250 Wörter).`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'Du bist ein Immobilienmakler. Schreibe auf Deutsch.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({
        error: 'OpenAI Error',
        details: error
      });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      return res.status(500).json({ error: 'Kein Text generiert' });
    }

    return res.status(200).json({
      success: true,
      text: text
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Server Error',
      message: error.message
    });
  }
}
```

5. **Commit changes**

---

## ⏰ **WARTEN**

Warten Sie **60 Sekunden** bis Vercel neu deployed hat.

---

## 🧪 **TESTEN:**

### **Test 1: Status-Seite**
```
https://expose-profi.de/api/status
