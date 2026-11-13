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

   ---------------------------------------------------------
   PENTING — kenapa jawaban pernah "terpotong"? (v42)
   ---------------------------------------------------------
   Model Gemini 3.x memakai THINKING BLOCK yang ikut memakai
   budget maxOutputTokens. Dengan maxOutputTokens=440, thinking
   saja menghabiskan ~420 token sehingga finishReason=MAX_TOKENS
   dan jawaban terpotong di tengah kalimat (hanya 15 token sisa).

   Solusi berlapis di file ini:
   1. Budget dasar 2000 token (bukan 440).
   2. Deteksi finishReason === 'MAX_TOKENS' → ulangi permintaan
      dengan budget 2x (2000 → 4000 → 8000), maksimal 2x percobaan.
   3. Upstream fetch diberi timeout 45 detik supaya tidak menggantung.
   4. thinkingConfig dipakai untuk memangkas thinking (lebih cepat &
      hemat token). Bila API menolak (HTTP 400), proxy otomatis
      mencoba lagi TANPA thinkingConfig — jadi tidak pernah mematikan
      layanan.
   ============================================================ */

const MODELS = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-3-flash-preview'];
const BASE_BUDGET = 2000;
const MAX_BUDGET = 8000;
const UPSTREAM_TIMEOUT = 30000;
/* Batas total waktu fungsi. Vercel membatasi durasi serverless function,
   jadi kita berhenti mencoba sebelum fungsi dibunuh. */
const TOTAL_DEADLINE = 50000;

/* apakah server mendukung AbortSignal.timeout (Node 18+) */
function timeoutSignal(ms) {
  try {
    if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
      return AbortSignal.timeout(ms);
    }
  } catch (e) {}
  return undefined;
}

/* ambil teks jawaban + finishReason dari respons Gemini */
function readAnswer(data) {
  const cand = data && data.candidates && data.candidates[0];
  const parts = cand && cand.content && cand.content && cand.content.parts;
  let out = parts && parts.length ? (parts[0].text || '') : '';
  /* buang blok <think> dari model 3.x */
  out = String(out).replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  return { text: out, finish: (cand && cand.finishReason) || '' };
}

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
  const baseCfg = Object.assign(
    { temperature: 0.75, maxOutputTokens: BASE_BUDGET, topP: 0.9 },
    generationConfig || {}
  );
  let budget = Math.max(Number(baseCfg.maxOutputTokens) || BASE_BUDGET, 1000);
  /* thinkingConfig di-flag: kalau API menolak (400), ulangi tanpa thinking */
  let useThinking = true;

  let lastStatus = 0;
  let lastBody = '';
  /* jawaban terbaik sejauh ini — dipakai kalau batas waktu tercapai */
  let bestReply = '';
  let bestModel = '';
  const deadline = Date.now() + TOTAL_DEADLINE;

  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
    let attempt = 0;

    while (attempt < 3) {
      /* sudah melewati batas waktu? jangan coba lagi */
      if (Date.now() > deadline) break;
      const cfg = Object.assign({}, baseCfg, { maxOutputTokens: budget });
      if (useThinking) {
        /* thinkingBudget 0 = matikan reasoning; kalau diabaikan API, tetap aman */
        cfg.thinkingConfig = { thinkingBudget: 0 };
      }
      const body = JSON.stringify({
        systemInstruction: systemInstruction || undefined,
        contents: contents || [],
        generationConfig: cfg
      });

      try {
        const upstream = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          signal: timeoutSignal(UPSTREAM_TIMEOUT)
        });

        const text = await upstream.text();

        if (!upstream.ok) {
          /* 400 = parameter tidak dikenali (mis. thinkingConfig) -> coba tanpa thinking */
          if (upstream.status === 400 && useThinking) {
            useThinking = false;
            continue;
          }
          lastStatus = upstream.status;
          lastBody = text;
          /* 404 = model deprecated, 429 = kuota habis, 503 = sibuk → coba model berikutnya */
          if (upstream.status === 404 || upstream.status === 429 || upstream.status === 503) break;
          return res.status(upstream.status).json({ error: text.slice(0, 500), model });
        }

        const data = JSON.parse(text);
        const { text: out, finish } = readAnswer(data);

        if (!out) {
          /* jawaban kosong: bisa jadi karena thinkingConfig -> coba tanpa thinking */
          if (useThinking) {
            useThinking = false;
            attempt++;
            continue;
          }
          lastStatus = 502;
          break;
        }

        /* jawaban terpotong karena budget habis → ulangi dengan budget 2x */
        if (finish === 'MAX_TOKENS' && budget < MAX_BUDGET && attempt < 2) {
          if (!bestReply) { bestReply = out; bestModel = model; }
          budget = Math.min(budget * 2, MAX_BUDGET);
          attempt++;
          continue;
        }

        return res.status(200).json({
          reply: out,
          model,
          finishReason: finish || 'STOP',
          truncated: finish === 'MAX_TOKENS',
          budget
        });
      } catch (e) {
        lastStatus = 503;
        lastBody = String((e && e.message) || e);
        break;
      }
    }
  }

  /* Batas waktu tercapai → lebih baik kirim jawaban terpotong daripada error */
  if (bestReply) {
    return res.status(200).json({
      reply: bestReply,
      model: bestModel,
      finishReason: 'MAX_TOKENS',
      truncated: true,
      budget
    });
  }

  return res.status(lastStatus || 503).json({
    error: 'Semua model Gemini gagal.',
    status: lastStatus,
    detail: lastBody.slice(0, 400)
  });
}
