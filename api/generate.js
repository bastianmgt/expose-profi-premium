// api/generate.js
// PREMIUM VERSION - Vision mit Foto-Beschriftungen, Silent Expert

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
    
    if (mode === 'ocr' && energyCertificate) {
      return await handleEnergyOCR(apiKey, energyCertificate, res);
    }
    
    if (!propertyData) {
      return res.status(400).json({ 
        success: false,
        error: 'Keine propertyData'
      });
    }

    console.log('[OK] PropertyData empfangen');
    console.log('[INFO] Anzahl Fotos:', photos?.length || 0);

    const messages = createVisionMessages(propertyData, photos);

    console.log('[START] OpenAI Vision Request (Premium)...');
    
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

    console.log('[SUCCESS] Premium Exposé generiert');

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

async function handleEnergyOCR(apiKey, imageBase64, res) {
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
            content: 'Du bist ein OCR-Spezialist für deutsche Energieausweise. Extrahiere die relevanten Daten präzise.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analysiere diesen deutschen Energieausweis und extrahiere:

1. Energieeffizienzklasse (A+ bis H)
2. Energiebedarf in kWh/(m²·a)
3. Energieträger (Gas, Öl, Fernwärme, Strom, etc.)
4. Ausweistyp (Bedarfsausweis oder Verbrauchsausweis)

Antworte NUR mit JSON:
{
  "effizienzklasse": "C",
  "energiebedarf": "85",
  "energietraeger": "Gas",
  "ausweistyp": "Bedarfsausweis"
}

Bei unlesbaren Werten: null`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64,
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

    let extractedData;
    try {
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

function createVisionMessages(propertyData, photos) {
  const hasPhotos = photos && photos.length > 0;
  
  const systemMessage = {
    role: 'system',
    content: `Du bist ein Premium-Immobilienmakler, der exklusive Exposés für High-End-Objekte verfasst.

${hasPhotos ? `FOTO-ANALYSE MIT BESCHRIFTUNGEN:
Du erhältst Fotos mit optionalen Beschriftungen (z.B. "Badezimmer", "Küche").
- Analysiere jedes Foto GENAU
- Wenn beschriftet: Fokussiere auf diese Kategorie (z.B. bei "Badezimmer" → Armaturen, Fliesen, Sanitär)
- Beschreibe nur SICHTBARE Details (Materialien, Licht, Qualität)
- KEINE Fantasie!` : ''}

═══════════════════════════════════════
ABSOLUTE REGELN - "SILENT EXPERT"
═══════════════════════════════════════

1. HALLEUZINATIONS-SPERRE:
   ⚠️ Eigennamen (Orte, Straßen) EXAKT übernehmen
   ⚠️ NIEMALS Ortsnamen verändern oder erfinden
   ⚠️ NIEMALS Straßennamen erfinden
   ⚠️ Bei fehlenden Daten: [WERT PRÜFEN]

2. KEINE STRUKTUR-LABELS IM TEXT:
   ❌ NIEMALS schreiben: "Headline:", "Einleitung:", "Fazit:", "Lage:", etc.
   ✅ Fließender Text OHNE Meta-Bezeichnungen

3. PREMIUM-STIL:
   - Exklusiv, elegant, verkaufsstark
   - Keine Floskeln ("Zögern Sie nicht")
   - Sachlich-emotional balanciert
   - High-End Vokabular

4. EXPOSÉ-STRUKTUR (ohne Labels im Text!):
   
   A) CATCHY HEADLINE (1 Zeile)
      - Emotional, konkret, verkaufsstark
      - Beispiel: "Lichtdurchflutete Designer-Wohnung mit Panoramablick"
   
   B) EMOTIONALE EINLEITUNG (2-3 Sätze)
      - Wohngefühl, Lifestyle
      - Beginne direkt, ohne "Einleitung:"
   
   C) OBJEKTBESCHREIBUNG (4-6 Sätze)
      - Räume, Materialien, Licht
      ${hasPhotos ? '- Konkrete Details von Fotos' : ''}
      - Fließend erzählen
   
   D) LAGEBESCHREIBUNG (3-4 Sätze)
      - EXAKT den angegebenen Ort nutzen
      - Infrastruktur, Anbindung allgemein
      - KEINE erfundenen Straßen!
   
   E) AUSSTATTUNGSTABELLE (formatiert)
      - Nutze strukturierte Aufzählung
      - Format: "✓ Feature"
   
   F) RECHTLICHE HINWEISE
      - Energiepass-Daten sachlich
      - GEG-Konformität

Schreibe ein FLÜSSIGES, labelfreies Exposé!`
  };

  const userContent = [];
  
  userContent.push({
    type: 'text',
    text: createPremiumPrompt(propertyData, hasPhotos)
  });

  if (hasPhotos) {
    photos.forEach((photo) => {
      userContent.push({
        type: 'image_url',
        image_url: {
          url: photo.base64,
          detail: 'high'
        }
      });
      
      // Foto-Beschriftung als Kontext
      if (photo.label) {
        userContent.push({
          type: 'text',
          text: `📸 Dieses Foto zeigt: ${photo.label}`
        });
      }
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

function createPremiumPrompt(data, hasPhotos) {
  // EXAKTE Übernahme aller Daten
  const objekttyp = data.objekttyp || '[OBJEKTTYP PRÜFEN]';
  const vermarktungsart = data.vermarktungsart || '[VERMARKTUNG PRÜFEN]';
  const wohnflaeche = data.wohnflaeche || '[WOHNFLÄCHE PRÜFEN]';
  const nutzflaeche = data.nutzflaeche || '';
  const grundstueck = data.grundstueck || '';
  const zimmer = data.zimmer || '[ZIMMER PRÜFEN]';
  const schlafzimmer = data.schlafzimmer || '';
  const baeder = data.baeder || '';
  const balkone = data.balkone || '';
  const baujahr = data.baujahr || '[BAUJAHR PRÜFEN]';
  const sanierung = data.sanierung || '';
  const heizung = data.heizung || '';
  const keller = data.keller || '';
  const stellplaetze = data.stellplaetze || '';
  const zustand = data.zustand || '[ZUSTAND PRÜFEN]';
  const preis = data.preis || '[PREIS PRÜFEN]';
  const plz = data.plz || '';
  const ort = data.ort || '';
  const umgebung = data.umgebung || '';
  
  // EXAKTE Lage
  let lageInfo = '';
  if (plz && ort) {
    lageInfo = `${ort} (PLZ ${plz})`;
  } else if (ort) {
    lageInfo = ort;
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

  return `${hasPhotos ? '🖼️ FOTOS MITGESCHICKT - ANALYSIERE JEDES EINZELN!\n\n' : ''}Erstelle ein PREMIUM-EXPOSÉ für dieses exklusive Objekt:

═══════════════════════════════════════
OBJEKTDATEN (EXAKT ÜBERNEHMEN!)
═══════════════════════════════════════

BASISDATEN:
Objekttyp: ${objekttyp}
Vermarktungsart: ${vermarktungsart}
${vermarktungsart === 'Verkauf' ? 'Kaufpreis' : 'Kaltmiete'}: ${preis}${preis !== '[PREIS PRÜFEN]' ? ' €' : ''}

LAGE (EXAKT SO!):
${lageInfo}
${umgebung ? `Umgebung: ${umgebung}` : ''}
⚠️ Nutze NUR: "${lageInfo}" - keine Fantasie-Straßen!

FLÄCHEN:
Wohnfläche: ${wohnflaeche} m²${nutzflaeche ? `\nNutzfläche: ${nutzflaeche} m²` : ''}${grundstueck ? `\nGrundstück: ${grundstueck} m²` : ''}

RÄUME:
Zimmer: ${zimmer}${schlafzimmer ? `\nSchlafzimmer: ${schlafzimmer}` : ''}${baeder ? `\nBäder: ${baeder}` : ''}${balkone ? `\nBalkone: ${balkone}` : ''}

ZUSTAND & TECHNIK:
Baujahr: ${baujahr}${sanierung ? `\nLetzte Sanierung: ${sanierung}` : ''}
Zustand: ${zustand}${heizung ? `\nHeizung: ${heizung}` : ''}${keller ? `\nKeller: ${keller}` : ''}${stellplaetze ? `\nStellplätze: ${stellplaetze}` : ''}

AUSSTATTUNG:
${ausstattungText}

ENERGIE:
${energieInfo}

${data.weiteresBesonderheiten ? `BESONDERHEITEN:\n${data.weiteresBesonderheiten}` : ''}

${hasPhotos ? `═══════════════════════════════════════
📸 FOTO-ANALYSE
═══════════════════════════════════════

Du hast ${data.uploadedPhotosCount || 'mehrere'} Foto(s).

ANALYSIERE JEDES FOTO:
- Materialien (Parkett, Fliesen, Marmor, etc.)
- Lichtverhältnisse
- Raumwirkung
- Ausstattungsqualität
- Besondere Details

BESCHRIFTETE FOTOS:
Falls ein Foto beschriftet ist (z.B. "Badezimmer"):
→ Fokussiere auf diese Kategorie
→ Beschreibe spezifische Details (Armaturen, Fliesen, etc.)

WICHTIG: Nur SICHTBARE Details!

` : ''}═══════════════════════════════════════
AUFGABE - PREMIUM-EXPOSÉ
═══════════════════════════════════════

Erstelle ein fließendes Exposé MIT DIESER STRUKTUR (aber OHNE Labels im Text!):

1. CATCHY HEADLINE
   - Eine emotionale, verkaufsstarke Zeile
   - Direkt beginnen, ohne "Headline:"

2. EMOTIONALE EINLEITUNG
   - Lifestyle, Wohngefühl
   - 2-3 Sätze, fließend

3. OBJEKTBESCHREIBUNG
   - Räume, Materialien
   ${hasPhotos ? '- Details von Fotos' : ''}
   - 4-6 Sätze, elegant

4. LAGE
   - Nutze EXAKT: "${lageInfo}"
   ${umgebung ? `- Erwähne: ${umgebung}` : ''}
   - Allgemeine Vorzüge
   - 3-4 Sätze

5. AUSSTATTUNG
   - Formatierte Liste mit ✓
   - Features klar aufzählen

6. ENERGIE & RECHTLICHES
   - Energiepass sachlich
   - GEG-Hinweis

7. KONTAKT-EINLADUNG
   - Elegant, ohne Floskeln
   - 1-2 Sätze

═══════════════════════════════════════
ABSOLUTE VERBOTE
═══════════════════════════════════════

❌ Labels: "Headline:", "Fazit:", "Einleitung:"
❌ Floskeln: "Zögern Sie nicht"
❌ Ortsnamen verändern
❌ Straßennamen erfinden

✓ Fließendes Premium-Exposé
✓ 500-700 Wörter
✓ EXAKTE Datennutzung

BEGINNE JETZT mit dem fertigen Exposé (OHNE Meta-Labels!):`;
}
