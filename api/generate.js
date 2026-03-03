// api/generate.js
// Vision-fähige Version mit Bildanalyse und OCR

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
      console.error('[ERROR] API-Key fehlt');
      return res.status(500).json({ 
        success: false,
        error: 'API-Key fehlt'
      });
    }

    const { propertyData, photos, energyCertificate, mode } = req.body;
    
    // Mode 1: OCR für Energieausweis
    if (mode === 'ocr' && energyCertificate) {
      return await handleEnergyOCR(apiKey, energyCertificate, res);
    }
    
    // Mode 2: Vollständige Exposé-Generierung
    if (!propertyData) {
      return res.status(400).json({ 
        success: false,
        error: 'Keine propertyData'
      });
    }

    console.log('[OK] PropertyData empfangen');
    console.log('[INFO] Anzahl Fotos:', photos?.length || 0);

    // Erstelle Vision-fähigen Prompt
    const messages = createVisionMessages(propertyData, photos);

    console.log('[START] OpenAI Vision Request...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    console.log('[OK] OpenAI Response Status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[ERROR] OpenAI Error:', errorData);
      
      return res.status(response.status).json({
        success: false,
        error: 'OpenAI API Fehler',
        message: errorData.error?.message || 'Unbekannter Fehler'
      });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      console.error('[ERROR] Kein Text generiert');
      return res.status(500).json({
        success: false,
        error: 'Kein Text generiert'
      });
    }

    console.log('[SUCCESS] Exposé mit Bildanalyse generiert');

    return res.status(200).json({
      success: true,
      text: text,
      usage: data.usage || null,
      analyzedImages: photos?.length || 0
    });

  } catch (error) {
    console.error('[CRITICAL ERROR]', error);
    
    return res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message || 'Unerwarteter Fehler'
    });
  }
}

// Funktion: OCR für Energieausweis
async function handleEnergyOCR(apiKey, imageBas64, res) {
  try {
    console.log('[START] Energieausweis OCR...');
    
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
            content: 'Du bist ein OCR-Spezialist für deutsche Energieausweise. Extrahiere die relevanten Daten und gib sie als JSON zurück.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analysiere diesen deutschen Energieausweis und extrahiere folgende Informationen:

1. Energieeffizienzklasse (A+ bis H)
2. Energiebedarf in kWh/(m²·a)
3. Energieträger (z.B. Gas, Öl, Fernwärme, Strom)
4. Ausweistyp (Bedarfsausweis oder Verbrauchsausweis)

Antworte NUR mit einem JSON-Objekt in diesem Format:
{
  "effizienzklasse": "C",
  "energiebedarf": "85",
  "energietraeger": "Gas",
  "ausweistyp": "Bedarfsausweis"
}

Wenn ein Wert nicht eindeutig lesbar ist, setze null.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBas64,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[ERROR] OCR failed:', errorData);
      return res.status(response.status).json({
        success: false,
        error: 'OCR fehlgeschlagen'
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({
        success: false,
        error: 'Keine OCR-Daten'
      });
    }

    // Parse JSON from response
    let extractedData;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      extractedData = JSON.parse(cleanContent);
    } catch (e) {
      console.error('[ERROR] JSON parse failed:', e);
      return res.status(500).json({
        success: false,
        error: 'OCR-Daten konnten nicht geparst werden',
        rawContent: content
      });
    }

    console.log('[SUCCESS] OCR abgeschlossen:', extractedData);

    return res.status(200).json({
      success: true,
      mode: 'ocr',
      data: extractedData
    });

  } catch (error) {
    console.error('[ERROR] OCR Error:', error);
    return res.status(500).json({
      success: false,
      error: 'OCR Error',
      message: error.message
    });
  }
}

// Funktion: Vision Messages erstellen
function createVisionMessages(propertyData, photos) {
  const hasPhotos = photos && photos.length > 0;
  
  // System Message
  const systemMessage = {
    role: 'system',
    content: `Du bist ein professioneller Immobilienmakler, der verkaufsstarke Exposé-Texte schreibt.

${hasPhotos ? `Du hast Zugriff auf Fotos der Immobilie. Analysiere sie aktiv und beziehe Details ein:
- Materialien und Oberflächen (Parkett, Fliesen, etc.)
- Lichtverhältnisse und Helligkeit
- Raumaufteilung und Größenwirkung
- Ausstattungsqualität
- Besondere architektonische Details
- Zustand und Pflegezustand

WICHTIG: Nutze nur Details, die du auf den Bildern WIRKLICH siehst. Keine Fantasie!` : ''}

KRITISCHE REGEL: Nutze NUR bereitgestellte Informationen!
- Fehlende Daten → Platzhalter: [WERT PRÜFEN]
- Erfinde NICHTS
- Keine Vermutungen

Schreibe verkaufsstark, emotional und professionell auf Deutsch.`
  };

  // User Content (Text + Images)
  const userContent = [];
  
  // Text-Teil
  userContent.push({
    type: 'text',
    text: createDetailedPrompt(propertyData, hasPhotos)
  });

  // Bild-Teile
  if (hasPhotos) {
    photos.forEach((photoBase64, index) => {
      userContent.push({
        type: 'image_url',
        image_url: {
          url: photoBase64,
          detail: 'high'
        }
      });
    });
  }

  return [
    systemMessage,
    {
      role: 'user',
      content: userContent
    }
  ];
}

// Funktion: Detaillierter Prompt
function createDetailedPrompt(data, hasPhotos) {
  const objekttyp = data.objekttyp || '[OBJEKTTYP PRÜFEN]';
  const vermarktungsart = data.vermarktungsart || '[VERMARKTUNG PRÜFEN]';
  const wohnflaeche = data.wohnflaeche || '[FLÄCHE PRÜFEN]';
  const zimmer = data.zimmer || '[ZIMMER PRÜFEN]';
  const baujahr = data.baujahr || '[BAUJAHR PRÜFEN]';
  const zustand = data.zustand || '[ZUSTAND PRÜFEN]';
  const preis = data.preis || '[PREIS PRÜFEN]';
  const plz = data.plz || '';
  const ort = data.ort || '';
  
  let lageInfo = '';
  if (plz && ort) {
    lageInfo = `PLZ ${plz} in ${ort}`;
  } else if (ort) {
    lageInfo = `in ${ort}`;
  } else if (plz) {
    lageInfo = `PLZ ${plz}`;
  } else {
    lageInfo = '[LAGE PRÜFEN]';
  }

  const features = [
    ...data.aussenbereich || [],
    ...data.innenraum || [],
    ...data.parkenKeller || [],
    ...data.technikKomfort || []
  ];
  
  const ausstattungText = features.length > 0 
    ? features.map(f => `- ${f}`).join('\n')
    : '[AUSSTATTUNG PRÜFEN]';

  const energieInfo = data.effizienzklasse 
    ? `Energieeffizienzklasse: ${data.effizienzklasse}\nEnergiebedarf: ${data.energiebedarf || '[WERT PRÜFEN]'} kWh/(m²·a)\nEnergieträger: ${data.energietraeger || '[TRÄGER PRÜFEN]'}`
    : '[ENERGIEAUSWEIS PRÜFEN - GEG-PFLICHT!]';

  return `${hasPhotos ? '🖼️ ICH HABE DIR FOTOS DER IMMOBILIE MITGESCHICKT - ANALYSIERE SIE GENAU!\n\n' : ''}Erstelle ein professionelles Immobilien-Exposé mit folgenden EXAKTEN Daten:

═══════════════════════════════════════
OBJEKTDATEN
═══════════════════════════════════════

Objekttyp: ${objekttyp}
Vermarktungsart: ${vermarktungsart}
Wohnfläche: ${wohnflaeche} m²
Zimmer: ${zimmer}
Baujahr: ${baujahr}
Zustand: ${zustand}
${vermarktungsart === 'Verkauf' ? 'Kaufpreis' : 'Kaltmiete'}: ${preis}${preis !== '[PREIS PRÜFEN]' ? ' €' : ''}

LAGE:
${lageInfo}

AUSSTATTUNG:
${ausstattungText}

ENERGETISCHE DATEN:
${energieInfo}

${data.weiteresBesonderheiten ? `WEITERE BESONDERHEITEN:\n${data.weiteresBesonderheiten}` : ''}

${hasPhotos ? `═══════════════════════════════════════
📸 BILDANALYSE-AUFGABE
═══════════════════════════════════════

Du hast ${data.uploadedPhotosCount || 'mehrere'} Foto(s) erhalten.

ANALYSIERE AKTIV:
1. Materialien (Parkett, Fliesen, Marmor, etc.)
2. Lichteinfall und Helligkeit
3. Raumwirkung und Größe
4. Ausstattungsqualität
5. Besondere Details (Stuck, Balken, etc.)
6. Modernisierungsgrad
7. Pflegezustand

INTEGRIERE diese Beobachtungen natürlich in den Text!
Beispiel: "Die hochwertigen Eichenparkett-Böden..." oder "Durch die bodentiefen Fenster..."

WICHTIG: Nur Details nutzen, die du WIRKLICH auf den Bildern siehst!

` : ''}═══════════════════════════════════════
AUFGABE
═══════════════════════════════════════

Schreibe ein verkaufsstarkes Exposé mit dieser STRUKTUR:

1. ÜBERSCHRIFT (1 Zeile)
   - Attraktiv und konkret

2. EINLEITUNG (2-3 Sätze)
   - Emotional ansprechend
   ${hasPhotos ? '- Beziehe Bildeindrücke ein!' : ''}

3. OBJEKTBESCHREIBUNG (4-5 Sätze)
   ${hasPhotos ? '- Beschreibe was du auf den Bildern siehst\n   - Materialien, Licht, Raumwirkung konkret benennen' : '- Beschreibe Räume und Wohngefühl'}

4. LAGE (3-4 Sätze)
   ${lageInfo !== '[LAGE PRÜFEN]' 
     ? `- Beschreibe konkret ${ort || 'diese Lage'}` 
     : '- Schreibe: "Lage auf Anfrage [LAGE PRÜFEN]"'}

5. AUSSTATTUNG & HIGHLIGHTS
   - Liste die angegebenen Features
   - Nutze ✓ Zeichen
   ${hasPhotos ? '- Ergänze sichtbare Details von den Fotos' : ''}

6. ENERGETISCHE DATEN
   - Exakt wie angegeben
   - Bei fehlenden Daten: Platzhalter

7. PREIS & KONDITIONEN
   - Preis wie angegeben

8. FAZIT & CALL-TO-ACTION (2 Sätze)

═══════════════════════════════════════
REGELN
═══════════════════════════════════════

✓ Nutze NUR bereitgestellte Daten + Bildinhalte
✓ Platzhalter für fehlende Infos
✓ Keine Fantasie-Details
✓ Professionell und verkaufsstark
✓ Ca. 400-500 Wörter

Beginne jetzt:`;
}
