const Anthropic = require('@anthropic-ai/sdk');

const extractJSON = (text) => {
  const start = text.indexOf('{');
  const end   = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start)
    throw new SyntaxError('No JSON object found in response');
  return JSON.parse(text.slice(start, end + 1));
};

const getClient = (headers) => {
  const key = headers['x-anthropic-key'] || process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('No API key configured. Add your Claude API key in Settings.');
  return new Anthropic({ apiKey: key });
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const ask = async (headers, system, user, maxTokens = 2048, retries = 2) => {
  const client = getClient(headers);
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const msg = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: maxTokens,
        system,
        messages: [{ role: 'user', content: user }],
      });
      return msg.content[0].text;
    } catch (err) {
      const isOverloaded = err.status === 529 || (err.message && err.message.includes('overloaded'));
      if (isOverloaded && attempt < retries) {
        await sleep(attempt * 2000);
        continue;
      }
      if (isOverloaded) throw new Error('Claude API is busy right now. Please wait a moment and try again.');
      throw err;
    }
  }
};

const STYLE_MODIFIERS = {
  anime:    'anime style, cel shading, vibrant colors, manga-inspired artwork',
  realism:  'photorealistic, highly detailed, cinematic photography, 8K resolution, professional lighting',
  cartoon:  'cartoon style, bold outlines, flat colors, playful illustration',
  '3d':     '3D rendering, CGI, Pixar-style, volumetric lighting, ray tracing, high-poly models',
  faceless: 'faceless humanoid character, silhouette figure, abstract human form, no visible facial features',
};

const buildBaseContext = (customPrompt, stylePreset) => {
  const parts = [];
  if (customPrompt && customPrompt.trim()) parts.push(customPrompt.trim());
  if (stylePreset && STYLE_MODIFIERS[stylePreset]) parts.push(STYLE_MODIFIERS[stylePreset]);
  return parts.join('. ');
};

const CORS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

const ok  = (body)            => ({ statusCode: 200, headers: CORS, body: JSON.stringify(body) });
const bad = (msg, status=500) => ({ statusCode: status, headers: CORS, body: JSON.stringify({ error: msg }) });
const parseBody = (event) => { try { return JSON.parse(event.body || '{}'); } catch(e) { return {}; } };

module.exports = { extractJSON, getClient, ask, STYLE_MODIFIERS, buildBaseContext, ok, bad, parseBody };
