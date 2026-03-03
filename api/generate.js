// api/generate.js
// KORRIGIERTE VERSION - Keine Fantasie, keine Labels, strikte Datennutzung

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
    content: `Du bist ein professioneller Immobilienmakler, der verkaufsstarke Exposé-Texte schreibt.

${hasPhotos ? `Du hast Zugriff auf Fotos der Immobilie. Analysiere sie aktiv und beziehe Details ein:
- Materialien und Oberflächen (Parkett, Fliesen, etc.)
- Lichtverhältnisse und Helligkeit
- Raumaufteilung und Größenwirkung
- Ausstattungsqualität
- Besondere architektonische Details

WICHTIG: Nutze nur Details, die du auf den Bildern WIRKLICH siehst. Keine Fantasie!` : ''}

ABSOLUTE REGELN - NIEMALS VERLETZEN:

1. STRIKTE DATENNUTZUNG:
   - Nutze Ort und PLZ EXAKT wie angegeben
   - Verändere KEINEN Buchstaben an Eigennamen
   - Erfinde KEINE Straßennamen oder Stadtteilnamen
   - Bei fehlenden Daten: Platzhalter [WERT PRÜFEN]

2. KEINE STRUKTUR-LABELS IM TEXT:
   - Schreibe NIEMALS Wörter wie: "Überschrift:", "Einleitung:", "Fazit:", "Call-to-Action:", "Lage:", "Ausstattung:" etc.
   - Der Text muss ein FLÜSSIGES Exposé sein, OHNE Meta-Bezeichnungen
   - Beginne direkt mit dem Inhalt, nicht mit Labels

3. STIL - SACHLICH-ELEGANT:
   - Keine Floskeln wie "Zögern Sie nicht länger", "Lassen Sie sich diese Gelegenheit nicht entgehen"
   - Keine übertriebenen Superlativen
   - Sachlich, präzise, verkaufsstark
   - Professionell ohne Marktschreier-Ton

4. STRUKTUR (OHNE LABELS):
   - Eröffnungssatz (direkt, ohne "Einleitung:")
   - Objektbeschreibung (fließend)
   - Lagebeschreibung (fließend)
   - Ausstattungsdetails (natürlich integriert)
   - Abschlusssatz mit Kontaktmöglichkeit (ohne "Fazit:")

BEISPIEL RICHTIG:
"Diese moderne 3-Zimmer-Wohnung in Müllheim überzeugt durch ihre hochwertige Ausstattung und zentrale Lage. Die 85 m² Wohnfläche verteilen sich..."

BEISPIEL FALSCH:
"Überschrift: Moderne Wohnung in Müllheim
Einleitung: Diese Wohnung...
Fazit: Kontaktieren Sie uns..."

Schreibe NUR den fertigen Text, OHNE Meta-Struktur!`
  };

  const userContent = [];
  
  userContent.push({
    type: 'text',
    text: createDetailedPrompt(propertyData, hasPhotos)
  });

  if (hasPhotos) {
    photos.forEach((photoBase64) => {
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
  
  // EXAKTE Übernahme von PLZ und Ort
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

  return `${hasPhotos ? '🖼️ ICH HABE DIR FOTOS MITGESCHICKT - ANALYSIERE SIE GENAU!\n\n' : ''}Erstelle ein professionelles Immobilien-Exposé mit folgenden EXAKTEN Daten:

═══════════════════════════════════════
OBJEKTDATEN (EXAKT ÜBERNEHMEN!)
═══════════════════════════════════════

Objekttyp: ${objekttyp}
Vermarktungsart: ${vermarktungsart}
Wohnfläche: ${wohnflaeche} m²
Zimmer: ${zimmer}
Baujahr: ${baujahr}
Zustand: ${zustand}
${vermarktungsart === 'Verkauf' ? 'Kaufpreis' : 'Kaltmiete'}: ${preis}${preis !== '[PREIS PRÜFEN]' ? ' €' : ''}

LAGE (EXAKT SO VERWENDEN!):
${lageInfo}
⚠️ WICHTIG: Verändere KEINEN Buchstaben am Ortsnamen!
⚠️ Erfinde KEINE Straßennamen oder Stadtteilnamen!
⚠️ Nutze nur: "${lageInfo}" - sonst nichts!

AUSSTATTUNG:
${ausstattungText}

ENERGETISCHE DATEN:
${energieInfo}

${data.weiteresBesonderheiten ? `WEITERE BESONDERHEITEN:\n${data.weiteresBesonderheiten}` : ''}

${hasPhotos ? `═══════════════════════════════════════
📸 BILDANALYSE
═══════════════════════════════════════

Du hast ${data.uploadedPhotosCount || 'mehrere'} Foto(s).

ANALYSIERE: Materialien, Licht, Raumwirkung, Ausstattung, besondere Details.
INTEGRIERE diese Beobachtungen NATÜRLICH in den Text!

` : ''}═══════════════════════════════════════
AUFGABE - FLÜSSIGES EXPOSÉ SCHREIBEN
═══════════════════════════════════════

Schreibe ein verkaufsstarkes Exposé MIT DIESER STRUKTUR (aber OHNE die Labels im Text!):

1. Eröffnungssatz
   - Beginne direkt, sachlich-elegant
   - Erwähne Objekttyp, Lage (EXAKT: "${lageInfo}"), Größe

2. Objektbeschreibung
   - Räume, Wohngefühl
   ${hasPhotos ? '- Beschreibe was du auf Bildern siehst (Materialien, Licht)' : ''}
   - Fließend, ohne "Objektbeschreibung:" zu schreiben!

3. Lage-Information
   - Nutze NUR: "${lageInfo}"
   - Beschreibe Vorzüge allgemein (Infrastruktur, Anbindung)
   - KEINE erfundenen Straßennamen!

4. Ausstattung
   - Integriere Features natürlich
   - Keine Aufzählungen mit "Ausstattung:" davor!

5. Energiedaten
   - Erwähne Werte sachlich
   - Ohne "Energiedaten:" Label!

6. Preis & Kontakt
   - Preis nennen
   - Einladung zur Besichtigung
   - OHNE "Fazit:" oder "Call-to-Action:" Label!

═══════════════════════════════════════
ABSOLUTE VERBOTE
═══════════════════════════════════════

❌ NIEMALS schreiben: "Überschrift:", "Einleitung:", "Fazit:", "Call-to-Action:", "Lage:", "Ausstattung:"
❌ NIEMALS Floskeln: "Zögern Sie nicht", "Lassen Sie sich diese Gelegenheit nicht entgehen"
❌ NIEMALS Ortsnamen verändern oder erfinden
❌ NIEMALS Straßennamen oder Stadtteile erfinden

✓ Schreibe ein FLÜSSIGES, elegantes Exposé
✓ Sachlich-verkaufsstark, ohne Marktschreier-Ton
✓ EXAKTE Datennutzung
✓ Ca. 400-500 Wörter

Beginne JETZT mit dem fertigen Exposé-Text (OHNE Meta-Labels!):`;
}
