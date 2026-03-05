import { ask, extractJSON, buildBaseContext, ok, bad, parseBody } from './_shared.js';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return bad('Method Not Allowed', 405);
  try {
    const { sceneText, sceneNumber, customPrompt = '', stylePreset = null } = parseBody(event);
    if (!sceneText?.trim()) return bad('sceneText is required', 400);

    const baseContext = buildBaseContext(customPrompt, stylePreset);

    const system = `You are a professional video director. Generate production prompts for a single scene. Respond with ONLY valid JSON — no markdown, no code fences.`;

    const user = `${baseContext ? `GLOBAL STYLE & WORLD CONTEXT (apply to every prompt field):\n"""\n${baseContext}\n"""\n\n` : ''}Generate fresh, detailed production prompts for Scene ${sceneNumber}:

Scene text: "${sceneText}"

Return exactly this JSON:
{
  "imagePrompt": "...",
  "brollPrompt": "...",
  "soundPrompt": "...",
  "environment": "...",
  "cameraAngle": "..."
}`;

    const raw    = await ask(event.headers, system, user, 1024);
    const parsed = extractJSON(raw);
    return ok(parsed);
  } catch (err) {
    return bad(err.message);
  }
};
