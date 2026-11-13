/* ============================================================
   MID DEV — Proxy Gemini untuk Konsultan AI (Vercel Serverless)
   ------------------------------------------------------------
   API key Gemini disimpan di environment variable GEMINI_API_KEY
   (Settings → Environment Variables di Vercel), TIDAK di dalam
   HTML. Frontend memanggil POST /api/gemini dan proxy ini
   meneruskan permintaan ke Google Gemini.

   Cara pakai di Vercel:
   1. Upload project ini (folder `api/` ikut ter-deploy)
   2. Settings → Environment Variables → add:
        GEMINI_API_KEY = <api key anda>
   3. Deploy. Frontend otomatis memakai /api/gemini.
   ============================================================ */

const MODELS = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-3-flash-preview'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY belum diatur di environment variable Vercel.'
    });
  }

  const { systemInstruction, contents, generationConfig } = req.body || {};

  const body = JSON.stringify({
    systemInstruction: systemInstruction || undefined,
    contents: contents || [],
    generationConfig: generationConfig || { temperature: 0.75, maxOutputTokens: 440, topP: 0.9 }
  });

  let lastStatus = 0;
  let lastBody = '';

  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
    try {
      const upstream = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      });

      const text = await upstream.text();

      if (!upstream.ok) {
        lastStatus = upstream.status;
        lastBody = text;
        // 404 = model deprecated, 429 = kuota habis, 503 = sibuk → coba model berikutnya
        if (upstream.status === 404 || upstream.status === 429 || upstream.status === 503) continue;
        return res.status(upstream.status).json({ error: text.slice(0, 500), model });
      }

      const data = JSON.parse(text);
      const parts = data?.candidates?.[0]?.content?.parts;
      let out = parts && parts.length ? parts[0].text : '';
      // buang blok <think> dari model 3.x
      out = String(out).replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      if (!out) {
        lastStatus = 502;
        continue;
      }

      return res.status(200).json({ reply: out, model });
    } catch (e) {
      lastStatus = 503;
      lastBody = String(e && e.message || e);
      continue;
    }
  }

  return res.status(lastStatus || 503).json({
    error: 'Semua model Gemini gagal.',
    status: lastStatus,
    detail: lastBody.slice(0, 400)
  });
}
