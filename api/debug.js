// api/debug.js
export default async function handler(req, res) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: {
      vercelEnv: process.env.VERCEL_ENV,
      nodeVersion: process.version
    },
    apiKey: {
      exists: !!apiKey,
      length: apiKey ? apiKey.length : 0,
      prefix: apiKey ? apiKey.substring(0, 10) + '...' : 'FEHLT',
      startsWithSk: apiKey ? apiKey.startsWith('sk-') : false
    },
    openaiTest: null
  };

  if (apiKey) {
    try {
      const testResponse = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });

      debugInfo.openaiTest = {
        status: testResponse.status,
        ok: testResponse.ok
      };

      if (!testResponse.ok) {
        const errorData = await testResponse.json();
        debugInfo.openaiTest.error = errorData.error;
      }
    } catch (error) {
      debugInfo.openaiTest = { error: error.message };
    }
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Debug - Exposé-Profi</title>
  <style>
    body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #0f0; }
    .box { background: #2a2a2a; padding: 20px; margin: 10px 0; border-radius: 8px; }
    .success { color: #0f0; }
    .error { color: #f00; }
    h1 { color: #0ff; }
    pre { background: #000; padding: 10px; overflow: auto; }
  </style>
</head>
<body>
  <h1>🔍 DEBUG INFO</h1>
  
  <div class="box">
    <h2>API Key:</h2>
    <p class="${debugInfo.apiKey.exists ? 'success' : 'error'}">
      Vorhanden: ${debugInfo.apiKey.exists ? '✅ JA' : '❌ NEIN'}
    </p>
    ${debugInfo.apiKey.exists ? `
      <p>Länge: ${debugInfo.apiKey.length} Zeichen</p>
      <p>Prefix: ${debugInfo.apiKey.prefix}</p>
      <p class="${debugInfo.apiKey.startsWithSk ? 'success' : 'error'}">
        Format: ${debugInfo.apiKey.startsWithSk ? '✅ Korrekt' : '❌ Falsch'}
      </p>
    ` : '<p class="error">KEY FEHLT!</p>'}
  </div>

  ${debugInfo.openaiTest ? `
    <div class="box">
      <h2>OpenAI Test:</h2>
      <p class="${debugInfo.openaiTest.ok ? 'success' : 'error'}">
        Status: ${debugInfo.openaiTest.status} ${debugInfo.openaiTest.ok ? '✅' : '❌'}
      </p>
      ${debugInfo.openaiTest.error ? `
        <p class="error">Fehler: ${JSON.stringify(debugInfo.openaiTest.error)}</p>
      ` : '<p class="success">✅ Verbindung OK!</p>'}
    </div>
  ` : ''}

  <div class="box">
    <h2>JSON:</h2>
    <pre>${JSON.stringify(debugInfo, null, 2)}</pre>
  </div>

  <button onclick="location.reload()" style="padding:10px; background:#0f0; color:#000; border:none; cursor:pointer; font-weight:bold;">
    🔄 Neu laden
  </button>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
```

### **SCHRITT 6: Speichern**

1. Scrollen Sie nach unten
2. Bei "Commit message" steht schon was → Lassen Sie es so
3. Klicken Sie den grünen Button: **"Commit new file"**

---

## ⏰ **WARTEN**

Warten Sie **30 Sekunden** bis Vercel das neue Deployment fertig hat.

---

## 🌐 **AUFRUFEN**

Öffnen Sie:
```
https://expose-profi.de/api/debug
