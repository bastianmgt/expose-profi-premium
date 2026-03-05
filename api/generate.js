// api/generate.js
// MONUMENT VERSION - KI recherchiert Lage selbst, Premium-Stil

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('[ERROR] API-Key fehlt');
      return res.status(500).json({ success: false, error: 'API-Key fehlt' });
    }

    const { propertyData, photos, energyCertificate, mode } = req.body;
    
    if (mode === 'ocr' && energyCertificate) {
      return await handleEnergyOCR(apiKey, energyCertificate, res);
    }
    
    if (!propertyData) {
      return res.status(400).json({ success: false, error: 'Keine propertyData' });
    }

    console.log('[MONUMENT] PropertyData empfangen');
    console.log('[MONUMENT] Fotos:', photos?.length || 0);

    const messages = createMonumentMessages(propertyData, photos);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 2500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[ERROR] OpenAI:', errorData);
      return res.status(response.status).json({
        success: false,
        error: 'OpenAI API Fehler',
        message: errorData.error?.message || 'Unbekannter Fehler'
      });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      return res.status(500).json({ success: false, error: 'Kein Text generiert' });
    }

    console.log('[SUCCESS] Monument Exposé generiert');

    return res.status(200).json({
      success: true,
      text: text,
      usage: data.usage || null,
      analyzedImages: photos?.length || 0
    });

  } catch (error) {
    console.error('[CRITICAL]', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
}

async function handleEnergyOCR(apiKey, imageBase64, res) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'OCR-Spezialist für deutsche Energieausweise.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extrahiere aus diesem Energieausweis:
1. Energieeffizienzklasse (A+ bis H)
2. Energiebedarf kWh/(m²·a)
3. Energieträger
4. Ausweistyp

JSON-Format:
{"effizienzklasse": "C", "energiebedarf": "85", "energietraeger": "Gas", "ausweistyp": "Bedarfsausweis"}`
              },
              { type: 'image_url', image_url: { url: imageBase64, detail: 'high' } }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: 'OCR fehlgeschlagen' });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let extractedData;
    try {
      const clean = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      extractedData = JSON.parse(clean);
    } catch (e) {
      return res.status(500).json({ success: false, error: 'Parse-Fehler' });
    }

    return res.status(200).json({
      success: true,
      mode: 'ocr',
      data: extractedData
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: 'OCR Error' });
  }
}

function createMonumentMessages(propertyData, photos) {
  const hasPhotos = photos && photos.length > 0;
  
  const systemMessage = {
    role: 'system',
    content: `Du bist ein Elite-Immobilienmakler für Luxus-Objekte.

${hasPhotos ? `FOTO-ANALYSE:
- Analysiere jedes Foto mit Label präzise
- Nur SICHTBARE Details
- KEINE Fantasie` : ''}

MONUMENT RULES:

1. LAGE-INTELLIGENZ:
   ⚠️ Nutzer gibt NUR PLZ und Ort
   ✅ DU generierst die Umgebungsbeschreibung
   ✅ Nutze allgemeines Wissen über die Region
   ✅ Infrastruktur, Anbindung, Charakter
   ✅ KEINE Fantasie-Straßen
   
2. EIGENNAMEN:
   ⚠️ PLZ und Ort EXAKT übernehmen
   
3. KEINE LABELS:
   ❌ NIEMALS: "Headline:", "Fazit:", "Einleitung:"
   ✅ Fließender Premium-Text

4. STRUKTUR (ohne Labels!):
   1. HEADLINE (1 Zeile, emotional)
   2. EINLEITUNG (2-3 Sätze)
   3. OBJEKT (4-6 Sätze)
   4. LAGE (3-4 Sätze - RECHERCHIERE!)
   5. AUSSTATTUNG (✓ Liste)
   6. ENERGIE
   7. KONTAKT (1-2 Sätze)

Premium-Stil: Exklusiv, elegant, verkaufsstark!`
  };

  const userContent = [{
    type: 'text',
    text: createMonumentPrompt(propertyData, hasPhotos)
  }];

  if (hasPhotos) {
    photos.forEach((photo) => {
      userContent.push({ type: 'image_url', image_url: { url: photo.base64, detail: 'high' } });
      if (photo.label) {
        userContent.push({ type: 'text', text: `📸 ${photo.label}` });
      }
    });
  }

  return [systemMessage, { role: 'user', content: userContent }];
}

function createMonumentPrompt(data, hasPhotos) {
  const plz = data.plz || '';
  const ort = data.ort || '';
  const lageInfo = (plz && ort) ? `${ort} (PLZ ${plz})` : (ort || plz || '[LAGE PRÜFEN]');

  const features = [
    ...data.aussenbereich || [],
    ...data.innenraum || [],
    ...data.parkenKeller || [],
    ...data.technikKomfort || []
  ];

  return `${hasPhotos ? '🖼️ FOTOS ERHALTEN\n\n' : ''}MONUMENT-EXPOSÉ erstellen:

OBJEKT:
${data.objekttyp || '[TYP]'} | ${data.vermarktungsart || '[ART]'} | ${data.preis ? data.preis + ' €' : '[PREIS]'}

LAGE (RECHERCHIERE!):
${lageInfo}
⚠️ Generiere Umgebungsbeschreibung basierend auf "${lageInfo}"
${data.weiteresBesonderheiten ? `Besonderheiten: ${data.weiteresBesonderheiten}` : ''}

FLÄCHEN:
Wohnen: ${data.wohnflaeche || '[?]'} m²${data.nutzflaeche ? ` | Nutzen: ${data.nutzflaeche} m²` : ''}${data.grundstueck ? ` | Grundstück: ${data.grundstueck} m²` : ''}

RÄUME:
${data.zimmer || '[?]'} Zi${data.schlafzimmer ? ` | ${data.schlafzimmer} Schlafz` : ''}${data.baeder ? ` | ${data.baeder} Bäder` : ''}${data.balkone ? ` | ${data.balkone} Balkone` : ''}

ZUSTAND:
Bj: ${data.baujahr || '[?]'}${data.sanierung ? ` | San: ${data.sanierung}` : ''} | ${data.zustand || '[?]'}${data.heizung ? ` | ${data.heizung}` : ''}${data.keller ? ` | Keller: ${data.keller}` : ''}${data.stellplaetze ? ` | ${data.stellplaetze} Stellpl` : ''}

AUSSTATTUNG:
${features.length > 0 ? features.map(f => `- ${f}`).join('\n') : '[KEINE]'}

ENERGIE:
${data.effizienzklasse ? `${data.effizienzklasse} | ${data.energiebedarf || '?'} kWh/(m²·a) | ${data.energietraeger || '?'}` : '[GEG-PFLICHT!]'}

${hasPhotos ? `📸 ${data.uploadedPhotosCount || '?'} Foto(s)\n` : ''}
Schreibe Monument-Exposé (500-700 Wörter):
1. Headline, 2. Einleitung, 3. Objekt, 4. LAGE (recherchiere!), 5. Ausstattung ✓, 6. Energie, 7. Kontakt

❌ Keine Labels! ✅ Premium-Stil!`;
}
