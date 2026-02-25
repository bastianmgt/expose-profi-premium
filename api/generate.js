// api/generate.js
// Verbesserte Version mit detailliertem Logging

export default async function handler(req, res) {
  console.log('🚀 API Route /api/generate wurde aufgerufen');
  console.log('📊 Request Method:', req.method);
  
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    console.log('✅ OPTIONS Request - CORS Preflight');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log('❌ Falscher Request Method:', req.method);
    return res.status(405).json({ 
      error: 'Method Not Allowed',
      message: 'Diese API akzeptiert nur POST-Requests'
    });
  }

  try {
    console.log('🔍 Prüfe Environment Variables...');
    
    // 1. API-Key prüfen
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('🔑 API-Key vorhanden:', !!apiKey);
    console.log('🔑 API-Key Länge:', apiKey ? apiKey.length : 0);
    console.log('🔑 API-Key Prefix:', apiKey ? apiKey.substring(0, 7) : 'NICHT GESETZT');
    
    if (!apiKey) {
      console.error('❌ CRITICAL: OPENAI_API_KEY ist nicht in Environment Variables gesetzt!');
      console.error('📝 Verfügbare Env Keys:', Object.keys(process.env).filter(k => k.includes('OPENAI')));
      
      return res.status(500).json({ 
        error: 'Configuration Error',
        message: 'API-Key fehlt in Vercel. Bitte setzen Sie OPENAI_API_KEY in den Vercel Environment Variables.',
        debug: {
          keyExists: false,
          availableOpenAIKeys: Object.keys(process.env).filter(k => k.includes('OPENAI')),
          vercelEnv: process.env.VERCEL_ENV
        }
      });
    }

    // 2. Request Body validieren
    console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));
    const { propertyData } = req.body;
    
    if (!propertyData) {
      console.error('❌ propertyData fehlt im Request Body');
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'propertyData fehlt im Request-Body',
        receivedBody: req.body
      });
    }

    console.log('✅ propertyData erhalten:', {
      wohnflaeche: propertyData.wohnflaeche,
      zimmer: propertyData.zimmer,
      baujahr: propertyData.baujahr
    });

    // 3. OpenAI importieren (dynamisch)
    console.log('📚 Importiere OpenAI SDK...');
    let OpenAI;
    try {
      const openAIModule = await import('openai');
      OpenAI = openAIModule.default;
      console.log('✅ OpenAI SDK erfolgreich importiert');
    } catch (importError) {
      console.error('❌ OpenAI SDK Import Fehler:', importError);
      return res.status(500).json({
        error: 'Dependency Error',
        message: 'OpenAI SDK konnte nicht geladen werden. Bitte installieren Sie "npm install openai"',
        details: importError.message
      });
    }

    // 4. OpenAI Client initialisieren
    console.log('🤖 Initialisiere OpenAI Client...');
    const openai = new OpenAI({
      apiKey: apiKey
    });
    console.log('✅ OpenAI Client initialisiert');

    // 5. Prompt erstellen
    const prompt = createExposePrompt(propertyData);
    console.log('📝 Prompt erstellt (Länge: ' + prompt.length + ' Zeichen)');

    // 6. OpenAI API aufrufen
    console.log('🌐 Starte OpenAI API Request...');
    console.log('🔧 Model: gpt-4o');
    console.log('🔧 Max Tokens: 1500');
    
    const startTime = Date.now();
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Du bist ein professioneller Immobilienmakler, der verkaufsstarke Exposé-Texte schreibt. Deine Texte sind emotional, ansprechend und fokussieren sich auf die Vorteile für potenzielle Käufer. Schreibe immer auf Deutsch.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const duration = Date.now() - startTime;
    console.log(`✅ OpenAI Response erhalten in ${duration}ms`);

    // 7. Response validieren
    const generatedText = completion.choices[0]?.message?.content;
    
    if (!generatedText) {
      console.error('❌ OpenAI hat keinen Text zurückgegeben');
      console.error('📊 Completion:', JSON.stringify(completion, null, 2));
      
      return res.status(500).json({ 
        error: 'OpenAI Error',
        message: 'OpenAI hat keinen Text generiert',
        completion: completion
      });
    }

    console.log('✅ Text erfolgreich generiert (Länge: ' + generatedText.length + ' Zeichen)');
    console.log('📊 Token Usage:', completion.usage);

    // 8. Erfolgreiche Response
    return res.status(200).json({
      success: true,
      text: generatedText,
      usage: {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens
      },
      meta: {
        duration: duration,
        model: 'gpt-4o',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌❌❌ FEHLER in /api/generate:');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error Status:', error.status);
    console.error('Full Error:', error);
    
    // OpenAI-spezifische Fehler
    if (error.code === 'insufficient_quota') {
      console.error('💰 QUOTA EXCEEDED - Guthaben aufgebraucht!');
      return res.status(402).json({
        error: 'Quota Exceeded',
        message: 'OpenAI API-Guthaben aufgebraucht. Bitte laden Sie Guthaben auf bei platform.openai.com',
        details: error.message
      });
    }

    if (error.code === 'invalid_api_key' || error.status === 401) {
      console.error('🔑 INVALID API KEY!');
      return res.status(401).json({
        error: 'Invalid API Key',
        message: 'Der OpenAI API-Key ist ungültig. Bitte prüfen Sie den Key in Vercel Environment Variables.',
        details: error.message
      });
    }

    if (error.status === 429) {
      console.error('⏱️ RATE LIMIT!');
      return res.status(429).json({
        error: 'Rate Limit',
        message: 'Zu viele Anfragen. Bitte warten Sie einen Moment.',
        details: error.message
      });
    }

    // Generischer Fehler
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Ein unerwarteter Fehler ist aufgetreten',
      details: error.message,
      errorType: error.name,
      errorCode: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Hilfsfunktion: Prompt erstellen
function createExposePrompt(data) {
  const features = [
    ...data.aussenbereich || [],
    ...data.innenraum || [],
    ...data.parkenKeller || [],
    ...data.technikKomfort || []
  ];

  return `Erstelle ein professionelles Immobilien-Exposé für folgende Immobilie:

ECKDATEN:
- Wohnfläche: ${data.wohnflaeche || 'nicht angegeben'} m²
- Zimmer: ${data.zimmer || 'nicht angegeben'}
- Baujahr: ${data.baujahr || 'nicht angegeben'}

AUSSTATTUNG:
${features.length > 0 ? features.map(f => `- ${f}`).join('\n') : '- Keine besonderen Ausstattungsmerkmale angegeben'}

ENERGETISCHE DATEN:
- Energieeffizienzklasse: ${data.effizienzklasse || 'nicht angegeben'}
- Energiebedarf: ${data.energiebedarf || 'nicht angegeben'} kWh/(m²·a)
- Energieträger: ${data.energietraeger || 'nicht angegeben'}
- Ausweistyp: ${data.ausweistyp || 'nicht angegeben'}

${data.weiteresBesonderheiten ? `WEITERE BESONDERHEITEN:\n${data.weiteresBesonderheiten}` : ''}

AUFGABE:
Schreibe einen verkaufsstarken Exposé-Text mit folgender Struktur:

1. EINLEITUNG (2-3 Sätze)
   - Emotional ansprechend
   - Fokus auf Wohnqualität und Lifestyle
   
2. OBJEKTBESCHREIBUNG (3-4 Sätze)
   - Beschreibe die Räume und das Wohngefühl
   - Betone die Vorteile für die Bewohner
   
3. AUSSTATTUNG & HIGHLIGHTS
   - Liste die wichtigsten Ausstattungsmerkmale auf (mit ✓ Zeichen)
   - Hebe Besonderheiten hervor
   
4. ENERGETISCHE DATEN
   - Präsentiere die Energiedaten übersichtlich
   
5. FAZIT (1-2 Sätze)
   - Call-to-Action: Besichtigung vereinbaren

WICHTIG:
- Schreibe verkaufsstark und emotional
- Nutze keine Übertreibungen oder Superlative ohne Substanz
- Der Text muss rechtlich einwandfrei sein (keine falschen Versprechen)
- Formatiere übersichtlich mit Absätzen
- Länge: ca. 250-350 Wörter`;
}
