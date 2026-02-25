export default function handler(req, res) {
  const key = process.env.OPENAI_API_KEY;
  
  res.status(200).json({
    keyExists: !!key,
    keyLength: key ? key.length : 0,
    keyStart: key ? key.substring(0, 7) : 'FEHLT',
    timestamp: new Date().toISOString()
  });
}
