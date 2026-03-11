// api/generate.js
// ULTIMATE VERSION - Mit Rate Limiting & besserem Error Handling

// Simple in-memory rate limiting (für Vercel Serverless)
const requestCounts = new Map();

function rateLimit(ip) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 Minuten
  const maxRequests = 10;

  // Cleanup alte Einträge
  for (const [key, value] of requestCounts.entries()) {
    if (now - value.timestamp > windowMs) {
      requestCounts.delete(key);
    }
  }

  const record = requestCounts.get(ip) || { count: 0, timestamp: now };

  // Reset wenn Fenster abgelaufen
  if (now - record.timestamp > windowMs) {
    record.count = 0;
    record.timestamp = now;
  }

  record.count++;
  requestCounts.set(ip, record);

  return {
    allowed: record.count <= maxRequests,
    remaining: Math.max(0, maxRequests - record.count),
    resetTime: record.timestamp + windowMs
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Rate Limiting
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const rateCheck = rateLimit(ip);

  if (!rateCheck.allowed) {
    const resetDate = new Date(rateCheck.resetTime);
    return res.status(429).json({
      success: false,
      error: 'Zu viele Anfragen',
      message: `Bitte warten Sie bis ${resetDate.toLocaleTimeString('de-DE')}. Limit: 10 Anfragen pro 15 Minuten.`,
      retryAfter: Math.ceil((rateCheck.resetTime - Date.now()) / 1000)
    });
  }

  // Rate Limit Headers
  res.setHeader('X-RateLimit-Limit', '10');
  res.setHeader('X-RateLimit-Remaining', rateCheck.remaining.toString());
  res.setHeader('X-RateLimit-Reset', new Date(rateCheck.resetTime).toISOString());

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('[ERROR] API-Key fehlt');
      return res.status(500).json({ 
        success: false, 
        error: 'Konfigurationsfehler',
        message: 'Der Server ist nicht korrekt konfiguriert. Bitte kontaktieren Sie den Support.'
      });
    }

    const { propertyData, photos, energyCertificate, mode, tonality } = req.body;
    
    if (mode === 'ocr' && energyCertificate) {
      return await handleEnergyOCR(apiKey, energyCertificate, res);
    }
    
    if (!propertyData) {
      return res.status(400).json({ 
        success: false, 
        error: 'Fehlende Daten',
        message: 'Bitte füllen Sie die Pflichtfelder aus.'
      });
    }

    console.log('[ULTIMATE] PropertyData empfangen');
    console.log('[ULTIMATE] Objekttyp:', propertyData.objekttyp);
    console.log('[ULTIMATE] Fotos:', photos?.length || 0);
    console.log('[ULTIMATE] Tonalität:', tonality || 'professional');

    const messages = createUltimateMessages(propertyData, photos, tonality);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 3000,
        temperature: tonality === 'emotional' ? 0.8 : tonality === 'luxury' ? 0.9 : 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[ERROR] OpenAI:', errorData);
      
      // Bessere Error Messages
      let userMessage = 'Die KI-Generierung ist fehlgeschlagen.';
      if (errorData.error?.code === 'insufficient_quota') {
        userMessage = 'Das API-Kontingent ist aufgebraucht. Bitte versuchen Sie es später erneut.';
      } else if (errorData.error?.code === 'rate_limit_exceeded') {
        userMessage = 'Zu viele Anfragen an die KI. Bitte warten Sie einen Moment.';
      }
      
      return res.status(response.status).json({
        success: false,
        error: 'KI-Fehler',
        message: userMessage,
        details: errorData.error?.message
      });
    }

    const data = await response.json();
    let text = data.choices?.[0]?.message?.content;

    if (!text) {
      return res.status(500).json({ 
        success: false, 
        error: 'Keine Antwort',
        message: 'Die KI hat keinen Text generiert. Bitte versuchen Sie es erneut.'
      });
    }

    // LaTeX-Zeichen entfernen (KRITISCH!)
    text = text.replace(/\$m\^2\$/g, 'm²');
    text = text.replace(/\$m²\$/g, 'm²');
    text = text.replace(/m\^2/g, 'm²');
    text = text.replace(/\bm2\b/g, 'm²');
    text = text.replace(/\bqm\b/gi, 'm²');

    console.log('[SUCCESS] Ultimate Exposé generiert');

    return res.status(200).json({
      success: true,
      text: text,
      tonality: tonality || 'professional',
      usage: data.usage || null,
      analyzedImages: photos?.length || 0,
      rateLimit: {
        remaining: rateCheck.remaining,
        resetTime: new Date(rateCheck.resetTime).toISOString()
      }
    });

  } catch (error) {
    console.error('[CRITICAL]', error);
    return res.status(500).json({
      success: false,
      error: 'Server-Fehler',
      message: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
      details: error.message
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
      return res.status(response.status).json({ 
        success: false, 
        error: 'OCR fehlgeschlagen',
        message: 'Die Energieausweis-Erkennung ist fehlgeschlagen. Bitte geben Sie die Daten manuell ein.'
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let extractedData;
    try {
      const clean = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      extractedData = JSON.parse(clean);
    } catch (e) {
      return res.status(500).json({ 
        success: false, 
        error: 'Parse-Fehler',
        message: 'Die erkannten Daten konnten nicht verarbeitet werden.'
      });
    }

    return res.status(200).json({
      success: true,
      mode: 'ocr',
      data: extractedData
    });

  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: 'OCR Error',
      message: 'Ein Fehler ist bei der Energieausweis-Erkennung aufgetreten.'
    });
  }
}

function getObjekttypSpezifika(objekttyp) {
  const spezifika = {
    'Einfamilienhaus (freistehend)': 'WICHTIG: Komplett freistehend auf allen Seiten. Betone maximale Privatsphäre, Gartennutzung rundherum möglich, keine Nachbarn direkt angrenzend. Unabhängigkeit und Freiraum sind Schlüsselargumente.',
    'Doppelhaushälfte': 'WICHTIG: Eine gemeinsame Wand mit den Nachbarn, ansonsten freistehend. Betone die Balance zwischen Gemeinschaft und Privatsphäre. Drei freie Seiten ermöglichen Gartennutzung. Oft günstiger als Einfamilienhaus bei ähnlichem Platz.',
    'Reihenhaus (Mittelhaus)': 'WICHTIG: Dies ist ein Reihenmittelhaus mit Nachbarn auf beiden Seiten. Betone die nachbarschaftliche Gemeinschaft, die ruhige Wohnlage im gewachsenen Quartier. Grenzabstände sind nicht relevant. Fokus auf Effizienz und gute Nachbarschaft.',
    'Reihenhaus (Endhaus)': 'WICHTIG: Dies ist ein Reiheneckhaus mit Nachbarn nur auf EINER Seite - die andere Seite ist komplett frei. Betone den deutlich höheren Lichteinfall durch die freie Seite, mehr Privatsphäre als Mittelhaus, oft größere Gartenfläche.',
    'Bungalow': 'WICHTIG: Ebenerdig ohne Treppen, barrierefrei. Betone den Komfort für alle Altersgruppen, altersgerechtes Wohnen, Barrierefreiheit als Zukunftssicherheit. Ideal für Familien mit kleinen Kindern und Senioren.',
    'Villa': 'WICHTIG: Repräsentatives, großzügiges Anwesen mit exklusivem Charakter. Betone die architektonische Qualität, die Grundstücksgröße, hochwertige Materialität, Status-Symbol. Oft in bevorzugter Lage mit besonderem Ambiente.',
    'Stadthaus': 'WICHTIG: Urbanes Wohnen mit mehreren Etagen, oft modern. Betone zentrale Lage, urbanen Lifestyle, kurze Wege. Architektonisch oft anspruchsvoll gestaltet.',
    'Mehrfamilienhaus': 'WICHTIG: Rendite-Immobilie mit mehreren Wohneinheiten. Betone die Mieteinnahmen, Kapitalanlage-Potenzial, aktuelle Vermietungssituation. Erwähne Leerstandsquote nur wenn niedrig. Fokus auf Rendite und Wertstabilität.',
    'Zweifamilienhaus': 'WICHTIG: Zwei separate Wohneinheiten. Betone Mehrgenerationenwohnen, Mieteinnahmen durch zweite Einheit, Flexibilität in der Nutzung (Eigennutzung + Vermietung oder zwei Generationen).',
    'Wohnung': 'WICHTIG: Eigentumswohnung in Mehrparteienhaus. Betone Lage, Infrastruktur, Hausverwaltung. Bei gutem Hausgeld erwähnen, bei hohem verschweigen oder begründen (z.B. Fahrstuhl, Hausmeister).',
    'Maisonette': 'WICHTIG: Wohnung über zwei Etagen mit interner Treppe. Betone das besondere Raumgefühl wie in einem kleinen Haus, die Trennung von Wohn- und Schlafbereich über Etagen, oft hohe Decken und lichtdurchflutet.',
    'Penthouse': 'WICHTIG: Exklusive Wohnung in der obersten Etage, oft mit Dachterrasse. Betone den spektakulären Ausblick, maximalen Lichteinfall, Exklusivität, Ruhe (keine Nachbarn über dir), besondere Lage innerhalb des Hauses.',
    'Dachgeschosswohnung': 'WICHTIG: Wohnung unterm Dach, oft mit Dachschrägen. Betone das besondere Wohngefühl, Gemütlichkeit, oft Dachterrasse oder Balkon. Bei guter Dämmung erwähnen (Sommer/Winter-Komfort).',
    'Souterrain': 'WICHTIG: Wohnung im Untergeschoss oder Erdgeschoss mit Lichtschächten. Betone kühlere Raumtemperatur im Sommer, oft günstigerer Preis bei guter Ausstattung. NIEMALS negativ formulieren - fokussiere auf Vorteile wie Ruhe.',
    'Loft': 'WICHTIG: Offene, oft industrielle Raumstruktur, meist umgebautes Gewerbe. Betone die hohen Decken (oft 3-4m), Industrial-Charakter, flexible Raumnutzung, urbanes Wohnen, oft einzigartige Architektur.',
    'Apartment': 'WICHTIG: Kompakte, effiziente Wohneinheit, oft für Singles oder Paare. Betone Funktionalität, zentrale Lage, niedrige Nebenkosten, perfekt für urbanen Lifestyle.',
    'Bürogebäude': 'WICHTIG: Gewerbeimmobilie für Büronutzung. Betone Lage, Verkehrsanbindung, Parkplätze, Infrastruktur, Mieterpotenzial, ggf. Rendite.',
    'Ladenlokal': 'WICHTIG: Gewerbefläche für Einzelhandel. Betone Laufkundschaft, Sichtbarkeit, Schaufenster, Größe der Verkaufsfläche, Parkplätze.',
    'Gastronomiebetrieb': 'WICHTIG: Gastronomie-Immobilie. Betone bestehende Ausstattung (Küche), Genehmigungen, Außenbereich/Terrasse, Laufkundschaft, ggf. übernehmbarer Betrieb.',
    'Halle/Lager': 'WICHTIG: Logistik-/Produktionsimmobilie. Betone Deckenhöhe, Tore, Andockstellen, Bodenbeschaffenheit, Verkehrsanbindung (Autobahn), Fläche.',
    'Praxisfläche': 'WICHTIG: Gewerbefläche für Arzt, Anwalt, etc. Betone ruhige Lage, Barrierefreiheit, Parkplätze, Wartebereich, separate Räume.',
    'Werkstatt': 'WICHTIG: Gewerbefläche für Handwerk. Betone Stromanschlüsse, Tore, Deckenhöhe, Belüftung, ggf. Grube, Ausstattung.',
    'Hotel/Pension': 'WICHTIG: Beherbergungsbetrieb. Betone Zimmeranzahl, Ausstattungsstandard, Lage (Tourismusgebiet), ggf. Gastronomie, Rendite, bestehender Betrieb.',
    'Baugrundstück': 'WICHTIG: Unbebautes Grundstück. Betone Bebaubarkeit, Erschließungsgrad (voll erschlossen?), Bebauungsplan (GRZ, GFZ), mögliche Kubatur, Lage, Ausrichtung.',
    'Gewerbegrundstück': 'WICHTIG: Grundstück für gewerbliche Nutzung. Betone Gewerbegebiet-Status, Emissionsmöglichkeiten, Verkehrsanbindung, Größe, Bebauungsplan.',
    'Resthof': 'WICHTIG: Ehemaliger Bauernhof mit Wohnhaus und Nebengebäuden. Betone Potenzial der Nebengebäude (Umbau, Werkstatt), großes Grundstück, ländliche Idylle, Ruhe.',
    'Bauernhof': 'WICHTIG: Aktiver oder ehemaliger landwirtschaftlicher Betrieb. Betone Wirtschaftsgebäude, Ackerflächen, ggf. Tierhaltung, Potenzial für Landwirtschaft oder Umnutzung.',
    'Wohn- und Geschäftshaus': 'WICHTIG: Kombinierte Nutzung Wohnen + Gewerbe. Betone Mischnutzung, Renditepotenzial durch Gewerbe, separate Eingänge, zentrale Lage.',
    'Atelierwohnung': 'WICHTIG: Wohnung mit besonderem Raumgefühl, oft hohe Decken, große Fenster. Betone Lichteinfall, kreative Atmosphäre, oft offene Grundrisse.',
    'Apartment-Haus': 'WICHTIG: Gebäude mit mehreren kleinen Apartments. Betone Rendite bei Vermietung, oft möbliert vermietbar, zentrale Lage, Studenten/Pendler als Zielgruppe.'
  };

  return spezifika[objekttyp] || '';
}

function getTonalityInstructions(tonality) {
  const instructions = {
    professional: `PROFESSIONELLE TONALITÄT:
- Sachlich, präzise, vertrauenswürdig
- Fokus auf Fakten und Daten
- Klar strukturiert
- Für Investoren und Käufer mit rationaler Entscheidung`,

    emotional: `EMOTIONALE TONALITÄT:
- Wärmend, einladend, persönlich
- Male Lebensgefühle aus
- "Stellen Sie sich vor..." Szenarien
- Für Familien und Eigennutzer mit emotionaler Bindung
- Beschreibe Momente: "Morgens beim Kaffee auf der Terrasse..."`,

    luxury: `LUXUS-TONALITÄT:
- Exklusiv, prestigeträchtig, anspruchsvoll
- Fokus auf Einzigartigkeit und Status
- Hochwertige Sprache, edle Begriffe
- Für High-End-Käufer mit Anspruch auf Distinktion
- "Residenz", "Refugium", "Domizil" statt "Wohnung"`
  };

  return instructions[tonality] || instructions.professional;
}

function createUltimateMessages(propertyData, photos, tonality = 'professional') {
  const hasPhotos = photos && photos.length > 0;
  const objekttypHints = getObjekttypSpezifika(propertyData.objekttyp);
  const tonalityInstructions = getTonalityInstructions(tonality);
  
  const systemMessage = {
    role: 'system',
    content: `Du bist ein Elite-Immobilienmakler für den deutschen Markt mit Expertise in Premium-Architektur-Magazinen.

${objekttypHints ? `═══════════════════════════════════════
OBJEKTTYP-SPEZIFIKA (ZWINGEND BEACHTEN!)
═══════════════════════════════════════

${objekttypHints}

Du MUSST diese Objekttyp-spezifischen Hinweise in deiner Beschreibung verarbeiten!

` : ''}═══════════════════════════════════════
TONALITÄT (ZWINGEND!)
═══════════════════════════════════════

${tonalityInstructions}

Du MUSST diese Tonalität durchgehend verwenden!

${hasPhotos ? `═══════════════════════════════════════
FOTO-INTEGRATION
═══════════════════════════════════════

- Du erhältst Fotos mit Labels (z.B. "Kaminzimmer", "Küche")
- INTEGRIERE diese Labels aktiv in den Text
- Beispiel: "Wie der elegante Kamin auf den Aufnahmen zeigt..."
- Nutze Labels als Beweis für Qualität

` : ''}═══════════════════════════════════════
MARKER-SYSTEM (ZWINGEND!)
═══════════════════════════════════════

Du MUSST diese exakten Marker verwenden:

[HEADLINE]
Eine emotionale, verkaufsstarke Überschrift (1 Zeile)
→ Berücksichtige Objekttyp und Tonalität!

[EINLEITUNG]
Lifestyle-Hook, 2-3 Sätze

[OBJEKT]
Detaillierte Objektbeschreibung, 5-8 Sätze
${objekttypHints ? '→ INTEGRIERE Objekttyp-Spezifika HIER!' : ''}
${hasPhotos ? '→ INTEGRIERE Foto-Labels hier!' : ''}

[LAGE]
Lage-Recherche basierend auf PLZ/Ort, 4-5 Sätze

[AUSSTATTUNG]
Formatierte Liste mit ✓

[ENERGIE]
GEG-konforme Energiedaten

[KONTAKT]
Einladung zur Besichtigung, 1-2 Sätze

═══════════════════════════════════════
KRITISCHE REGELN
═══════════════════════════════════════

1. LAGE-INTELLIGENZ:
   ⚠️ PLZ und Ort sind UNANTASTBAR
   ✅ Nutze allgemeines Wissen über die Region
   ✅ KEINE erfundenen Straßennamen
   
2. LATEX-VERBOT (ABSOLUT!):
   ❌ NIEMALS $m^2$ oder $m²$ oder m^2 schreiben!
   ✅ Immer nur: m² (Unicode-Zeichen)
   ❌ NIEMALS "qm" oder "m2"
   ✅ Immer nur: m²

3. PREMIUM-TONALITÄT:
   ✅ Stil: ${tonality === 'luxury' ? 'Luxus-Magazin' : tonality === 'emotional' ? 'Lifestyle-Magazin' : 'Premium-Architektur-Magazin'}
   ✅ Objekttyp-spezifische Formulierungen!

4. ZUSATZINFORMATIONEN:
   ✅ Wenn Denkmalschutz=Ja: Erwähne Steuervorteile
   ✅ Wenn Einliegerwohnung=Ja: Erwähne Mietpotenzial
   ✅ Wenn Erbpacht=Ja: Erwähne transparent aber positiv

Schreibe jetzt das perfekte, objekttyp-spezifische Exposé in der gewählten Tonalität!`
  };

  const userContent = [{
    type: 'text',
    text: createUltimatePrompt(propertyData, hasPhotos, tonality)
  }];

  if (hasPhotos) {
    photos.forEach((photo) => {
      userContent.push({ type: 'image_url', image_url: { url: photo.base64, detail: 'high' } });
      if (photo.label) {
        userContent.push({ type: 'text', text: `📸 FOTO-LABEL: "${photo.label}"` });
      }
    });
  }

  return [systemMessage, { role: 'user', content: userContent }];
}

function createUltimatePrompt(data, hasPhotos, tonality) {
  const plz = data.plz || '';
  const ort = data.ort || '';
  const lageInfo = (plz && ort) ? `${ort} (PLZ ${plz})` : (ort || plz || '[LAGE PRÜFEN]');

  const features = [
    ...data.aussenbereich || [],
    ...data.innenraum || [],
    ...data.parkenKeller || [],
    ...data.technikKomfort || []
  ];

  let zusatzfelder = '';
  if (data.denkmalschutz === 'Ja') zusatzfelder += '\n⚠️ DENKMALSCHUTZ: Ja (Steuervorteile erwähnen!)';
  if (data.einliegerwohnung === 'Ja') zusatzfelder += '\n✅ EINLIEGERWOHNUNG: Ja (Mietpotenzial/Mehrgenerationen!)';
  if (data.erbpacht === 'Ja') zusatzfelder += '\n⚠️ ERBPACHT: Ja (transparent aber positiv erwähnen!)';
  if (data.hausgeld) zusatzfelder += `\n💰 HAUSGELD: ${data.hausgeld} €/Monat (im Kontext einordnen)`;
  if (data.verfuegbarAb) zusatzfelder += `\n📅 VERFÜGBAR AB: ${data.verfuegbarAb}`;
  if (data.provision) zusatzfelder += `\n💼 PROVISION: ${data.provision}`;

  const tonalityNote = tonality === 'emotional' 
    ? '🎭 EMOTIONAL schreiben - Male Lebensgefühle aus!'
    : tonality === 'luxury' 
    ? '👑 LUXURIÖS schreiben - Exklusiv und prestigeträchtig!'
    : '💼 PROFESSIONELL schreiben - Sachlich und vertrauenswürdig!';

  return `${hasPhotos ? '🖼️ FOTOS MIT LABELS ERHALTEN\n\n' : ''}${tonalityNote}

ULTIMATE EXPOSÉ MIT MARKERN erstellen:

═══════════════════════════════════════
OBJEKTDATEN
═══════════════════════════════════════

BASISDATEN:
${data.objekttyp || '[TYP]'} | ${data.vermarktungsart || '[ART]'} | ${data.preis ? data.preis + ' €' : '[PREIS]'}

LAGE (RECHERCHIERE!):
${lageInfo}
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
${data.effizienzklasse ? `${data.effizienzklasse} | ${data.energiebedarf || '?'} kWh/(m²·a) | ${data.energietraeger || '?'}` : '[GEG-PFLICHT!]'}${zusatzfelder}

${hasPhotos ? `═══════════════════════════════════════
📸 FOTO-LABELS
═══════════════════════════════════════

Du hast ${data.uploadedPhotosCount || '?'} Foto(s) mit Labels.
INTEGRIERE die Labels aktiv in [OBJEKT]:
"Wie die Aufnahmen des [LABEL] zeigen..."

` : ''}═══════════════════════════════════════
AUFGABE
═══════════════════════════════════════

Schreibe ${tonality === 'emotional' ? 'EMOTIONALES' : tonality === 'luxury' ? 'LUXURIÖSES' : 'PROFESSIONELLES'} Exposé (600-800 Wörter) mit EXAKTEN MARKERN:

[HEADLINE]
Objekttyp-spezifisch, ${tonality}-Tonalität

[EINLEITUNG]
Lifestyle-Hook

[OBJEKT]
Detailliert, OBJEKTTYP-SPEZIFIKA EINBAUEN!${hasPhotos ? ', FOTO-LABELS EINBAUEN!' : ''}

[LAGE]
Recherchiere "${lageInfo}"

[AUSSTATTUNG]
✓ Liste

[ENERGIE]
GEG-konform

[KONTAKT]
Elegant

✅ ${tonalityNote}
✅ Marker EXAKT verwenden!
✅ NIEMALS $m^2$ - nur m²!
${hasPhotos ? '✅ Foto-Labels AKTIV einbauen!' : ''}
✅ Objekttyp-Spezifika ZWINGEND beachten!
✅ Zusatzfelder berücksichtigen!`;
}
