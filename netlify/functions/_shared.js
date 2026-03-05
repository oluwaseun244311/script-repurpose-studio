import Anthropic from '@anthropic-ai/sdk';

// ── JSON extraction ──────────────────────────────────────────────────────────
export const extractJSON = (text) => {
  const start = text.indexOf('{');
  const end   = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start)
    throw new SyntaxError('No JSON object found in response');
  return JSON.parse(text.slice(start, end + 1));
};

// ── Anthropic client ─────────────────────────────────────────────────────────
export const getClient = (headers) => {
  const key = headers['x-anthropic-key'] || process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('No API key configured. Add your Claude API key in Settings.');
  return new Anthropic({ apiKey: key });
};

// ── Retry-aware Claude call ──────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export const ask = async (headers, system, user, maxTokens = 4096, retries = 3) => {
  const client = getClient(headers);
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const msg = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: maxTokens,
        system,
        messages: [{ role: 'user', content: user }],
      });
      return msg.content[0].text;
    } catch (err) {
      const isOverloaded = err.status === 529 || err.message?.includes('overloaded');
      if (isOverloaded && attempt < retries) {
        console.warn(`Claude overloaded — retrying in ${attempt * 3}s (attempt ${attempt}/${retries})`);
        await sleep(attempt * 3000);
        continue;
      }
      if (isOverloaded) throw new Error('Claude API is busy right now. Please wait a moment and try again.');
      throw err;
    }
  }
};

// ── Style preset modifiers ───────────────────────────────────────────────────
export const STYLE_MODIFIERS = {
  anime:    'anime style, cel shading, vibrant colors, manga-inspired artwork',
  realism:  'photorealistic, highly detailed, cinematic photography, 8K resolution, professional lighting',
  cartoon:  'cartoon style, bold outlines, flat colors, playful illustration',
  '3d':     '3D rendering, CGI, Pixar-style, volumetric lighting, ray tracing, high-poly models',
  faceless: 'faceless humanoid character, silhouette figure, abstract human form, no visible facial features',
};

export const buildBaseContext = (customPrompt = '', stylePreset = null) => {
  const parts = [];
  if (customPrompt?.trim()) parts.push(customPrompt.trim());
  if (stylePreset && STYLE_MODIFIERS[stylePreset]) parts.push(STYLE_MODIFIERS[stylePreset]);
  return parts.join('. ');
};

// ── Response helpers ─────────────────────────────────────────────────────────
const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export const ok  = (body)           => ({ statusCode: 200, headers: CORS, body: JSON.stringify(body) });
export const bad = (msg, status=500) => ({ statusCode: status, headers: CORS, body: JSON.stringify({ error: msg }) });

export const parseBody = (event) => {
  try { return JSON.parse(event.body || '{}'); } catch { return {}; }
};
