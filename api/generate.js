// api/generate.js
// Finale Version mit strikter Datennutzung und Platzhaltern

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
        error: 'API-Key fehlt',
        message: 'OPENAI_API_KEY nicht in Vercel Environment Variables gesetzt'
      });
    }

    console.log('[OK] API-Key gefunden');

    const { propertyData } = req.body;
    
    if (!propertyData) {
      console.error('[ERROR] propertyData fehlt');
      return res.status(400).json({ 
        success: false,
        error: 'Keine propertyData'
      });
    }

    console.log('[OK] PropertyData empfangen');

    // Prompt mit strikten Anweisungen
    const prompt = createStrictPrompt(propertyData);

    console.log('[START] OpenAI Request...');
    
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
            content: `Du bist ein professioneller Immobilienmakler, der Exposé-Texte schreibt.

KRITISCHE REGEL: Nutze NUR die bereitgestellten Informationen!

Wenn eine Information fehlt oder nicht angegeben ist:
- Setze einen Platzhalter in eckigen Klammern: [BAUJAHR PRÜFEN], [ENERGIEDATEN EINTRAGEN], etc.
- Erfinde NIEMALS Daten oder Details
- Schreibe keine Vermutungen oder Annahmen

Wenn PLZ und Ort angegeben sind:
- Integriere sie aktiv in die Lagebeschreibung
- Beschreibe die Lage konkret für diesen Ort

Schreibe verkaufsstark, emotional und professionell auf Deutsch.` 
          },
          { 
            role: 'user', 
            content: prompt 
          }
        ],
        max_tokens: 1800,
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

    console.log('[SUCCESS] Text generiert');

    return res.status(200).json({
      success: true,
      text: text,
      usage: data.usage || null
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

// Hilfsfunktion: Strikter Prompt mit Platzhaltern
function createStrictPrompt(data) {
  // Basis-Informationen
  const objekttyp = data.objekttyp || '[OBJEKTTYP PRÜFEN]';
  const vermarktungsart = data.vermarktungsart || '[VERMARKTUNG PRÜFEN]';
  const wohnflaeche = data.wohnflaeche || '[FLÄCHE PRÜFEN]';
  const zimmer = data.zimmer || '[ZIMMER PRÜFEN]';
  const baujahr = data.baujahr || '[BAUJAHR PRÜFEN]';
  const zustand = data.zustand || '[ZUSTAND PRÜFEN]';
  const preis = data.preis || '[PREIS PRÜFEN]';
  const plz = data.plz || '';
  const ort = data.ort || '';
  
  // Lage
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

  // Ausstattung
  const features = [
    ...data.aussenbereich || [],
    ...data.innenraum || [],
    ...data.parkenKeller || [],
    ...data.technikKomfort || []
  ];
  
  const ausstattungText = features.length > 0 
    ? features.map(f => `- ${f}`).join('\n')
    : '[AUSSTATTUNG PRÜFEN]';

  // Energiedaten
  const energieInfo = data.effizienzklasse 
    ? `Energieeffizienzklasse: ${data.effizienzklasse}\nEnergiebedarf: ${data.energiebedarf || '[WERT PRÜFEN]'} kWh/(m²·a)\nEnergieträger: ${data.energietraeger || '[TRÄGER PRÜFEN]'}`
    : '[ENERGIEAUSWEIS PRÜFEN - GEG-PFLICHT!]';

  return `Erstelle ein professionelles Immobilien-Exposé mit folgenden EXAKTEN Daten:

═══════════════════════════════════════
OBJEKTDATEN (NUR DIESE NUTZEN!)
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

═══════════════════════════════════════
AUFGABE
═══════════════════════════════════════

Schreibe ein verkaufsstarkes Exposé mit dieser STRUKTUR:

1. ÜBERSCHRIFT (1 Zeile)
   - Attraktiv und konkret
   - Nutze Objekttyp und Lage

2. EINLEITUNG (2-3 Sätze)
   - Emotional ansprechend
   - Fokus auf Wohnqualität

3. OBJEKTBESCHREIBUNG (4-5 Sätze)
   - Beschreibe Räume und Wohngefühl
   - Nutze nur die angegebenen Daten
   - Bei fehlenden Infos: Platzhalter setzen

4. LAGE${lageInfo !== '[LAGE PRÜFEN]' ? ` (${lageInfo})` : ''} (3-4 Sätze)
   ${lageInfo !== '[LAGE PRÜFEN]' 
     ? `- Beschreibe konkret die Vorzüge von ${ort || 'dieser Lage'}\n   - Infrastruktur, Anbindung, Lebensqualität` 
     : '- Schreibe: "Die genaue Lage entnehmen Sie bitte den Unterlagen [LAGE PRÜFEN]"'}

5. AUSSTATTUNG & HIGHLIGHTS
   - Liste nur die angegebenen Ausstattungsmerkmale
   - Nutze ✓ Zeichen
   - Keine erfundenen Features!

6. ENERGETISCHE DATEN
   - Exakt die angegebenen Werte
   - Wenn Daten fehlen: Platzhalter wie oben

7. PREIS & KONDITIONEN
   - Nenne den Preis wie angegeben
   - Wenn [PREIS PRÜFEN]: "Preis auf Anfrage"

8. FAZIT & CALL-TO-ACTION (2 Sätze)
   - Einladung zur Besichtigung

═══════════════════════════════════════
WICHTIGE REGELN
═══════════════════════════════════════

✓ Nutze NUR die bereitgestellten Daten
✓ Setze Platzhalter für fehlende Infos: [TEXT PRÜFEN]
✓ Keine Fantasie-Details erfinden
✓ Keine Vermutungen über Lage/Ausstattung
✓ Professionell und verkaufsstark schreiben
✓ Ca. 350-450 Wörter

Beginne jetzt mit dem Exposé-Text:`;
}
