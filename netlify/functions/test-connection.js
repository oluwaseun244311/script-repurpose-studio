import Anthropic from '@anthropic-ai/sdk';
import { ok, bad, parseBody } from './_shared.js';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return bad('Method Not Allowed', 405);
  try {
    const key = event.headers['x-anthropic-key'] || process.env.ANTHROPIC_API_KEY;
    if (!key) return bad('No API key configured. Add your Claude API key in Settings.', 400);

    const client = new Anthropic({ apiKey: key });
    await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 5,
      messages: [{ role: 'user', content: 'Hi' }],
    });
    return ok({ success: true, message: 'Connection successful — API key is valid.' });
  } catch (err) {
    const msg = (err.status === 401 || err.message?.includes('401'))
      ? 'Invalid API key. Check the key and try again.'
      : err.message || 'Connection failed.';
    return bad(msg, 400);
  }
};
