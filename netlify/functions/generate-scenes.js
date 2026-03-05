import { ask, extractJSON, buildBaseContext, ok, bad, parseBody } from './_shared.js';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return bad('Method Not Allowed', 405);
  try {
    const { script, sceneDuration = 6, customPrompt = '', stylePreset = null } = parseBody(event);
    if (!script?.trim()) return bad('script is required', 400);

    const baseContext   = buildBaseContext(customPrompt, stylePreset);
    const wordsPerScene = Math.round((sceneDuration / 60) * 150);

    const system = `You are a professional video director. Split scripts into scenes and generate production prompts. Respond with ONLY valid JSON — no markdown, no code fences, no explanation.`;

    const user = `${baseContext ? `GLOBAL STYLE & WORLD CONTEXT (apply to every prompt field):\n"""\n${baseContext}\n"""\n\n` : ''}Split this script into scenes of approximately ${wordsPerScene} words each (≈${sceneDuration} seconds at 150wpm).

For each scene produce:
- text: exact words from the script for this scene
- imagePrompt: vivid AI image generation prompt (lighting, mood, style, subject)
- brollPrompt: specific B-roll / hero footage description
- soundPrompt: ambient sound and music atmosphere
- environment: physical setting, time of day, lighting conditions
- cameraAngle: shot type and camera movement

Return this exact JSON structure:
{
  "scenes": [
    {
      "number": 1,
      "text": "...",
      "imagePrompt": "...",
      "brollPrompt": "...",
      "soundPrompt": "...",
      "environment": "...",
      "cameraAngle": "..."
    }
  ]
}

SCRIPT:
${script}`;

    const raw    = await ask(event.headers, system, user, 8192);
    const parsed = extractJSON(raw);
    return ok(parsed);
  } catch (err) {
    if (err instanceof SyntaxError) return bad('AI returned invalid JSON. Try again.');
    return bad(err.message);
  }
};
