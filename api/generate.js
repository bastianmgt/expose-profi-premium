// api/generate.js
// Ultra-robuste Version mit maximalem Error-Handling

export default async function handler(req, res) {
  // CORS
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
    // 1. API-Key prüfen
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('[ERROR] API-Key fehlt');
      return res.status(500).json({ 
        success: false,
        error: 'API-Key fehlt',
        message: 'OPENAI_API_KEY nicht in Vercel Environment Variables gesetzt'
      });
    }

    console.log('[OK] API-Key gefunden:', apiKey.substring(0, 10) + '...');

    // 2. Request Body prüfen
    let propertyData;
    
    try {
      propertyData = req.body?.propertyData;
    } catch (e) {
      console.error('[ERROR] Body parsing fehler:', e);
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        message: 'Konnte propertyData nicht lesen'
      });
    }
    
    if (!propertyData) {
      console.error('[ERROR] propertyData fehlt');
      return res.status(400).json({ 
        success: false,
        error: 'Keine propertyData',
        message: 'propertyData fehlt im Request Body'
      });
    }

    console.log('[OK] PropertyData:', {
      wohnflaeche: propertyData.wohnflaeche,
      zimmer: propertyData.zimmer
    });

    // 3. Prompt erstellen
    const prompt = `Erstelle ein professionelles Immobilien-Exposé für eine ${propertyData.zimmer || '3'}-Zimmer-Wohnung mit ${propertyData.wohnflaeche || '85'} m² Wohnfläche.

Schreibe einen verkaufsstarken Text mit ca. 250 Wörtern.

Struktur:
1. Einleitung (emotional, ansprechend)
2. Objektbeschreibung (Räume, Wohngefühl)
3. Ausstattung
4. Fazit mit Call-to-Action

Schreibe auf Deutsch, professionell und verkaufsstark.`;

    console.log('[OK] Prompt erstellt');

    // 4. OpenAI API aufrufen
    console.log('[START] OpenAI Request...');
    
    let response;
    
    try {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { 
              role: 'system', 
              content: 'Du bist ein professioneller Immobilienmakler. Schreibe verkaufsstarke Exposé-Texte auf Deutsch.' 
            },
            { 
              role: 'user', 
              content: prompt 
            }
          ],
          max_tokens: 1500,
          temperature: 0.7
        })
      });
    } catch (fetchError) {
      console.error('[ERROR] Fetch failed:', fetchError);
      return res.status(500).json({
        success: false,
        error: 'OpenAI Verbindung fehlgeschlagen',
        message: fetchError.message
      });
    }

    console.log('[OK] OpenAI Response Status:', response.status);

    // 5. Response prüfen
    if (!response.ok) {
      let errorData;
      
      try {
        errorData = await response.json();
      } catch (e) {
        const text = await response.text();
        console.error('[ERROR] OpenAI Error (non-JSON):', text);
        return res.status(response.status).json({
          success: false,
          error: 'OpenAI Fehler',
          message: `Status ${response.status}: ${text}`
        });
      }

      console.error('[ERROR] OpenAI Error:', errorData);
      
      return res.status(response.status).json({
        success: false,
        error: 'OpenAI API Fehler',
        message: errorData.error?.message || 'Unbekannter Fehler',
        details: errorData
      });
    }

    // 6. Response parsen
    let data;
    
    try {
      data = await response.json();
    } catch (e) {
      console.error('[ERROR] JSON parse failed:', e);
      const text = await response.text();
      return res.status(500).json({
        success: false,
        error: 'Response Parse Fehler',
        message: 'Konnte OpenAI Response nicht parsen',
        rawResponse: text.substring(0, 200)
      });
    }

    // 7. Text extrahieren
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      console.error('[ERROR] Kein Text in Response:', data);
      return res.status(500).json({
        success: false,
        error: 'Kein Text generiert',
        message: 'OpenAI hat keinen Text zurückgegeben',
        data: data
      });
    }

    console.log('[SUCCESS] Text generiert:', text.substring(0, 100) + '...');

    // 8. Erfolgreiche Response
    return res.status(200).json({
      success: true,
      text: text,
      usage: data.usage || null
    });

  } catch (error) {
    // Catch-all für unerwartete Fehler
    console.error('[CRITICAL ERROR]', error);
    
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message || 'Ein unerwarteter Fehler ist aufgetreten',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
