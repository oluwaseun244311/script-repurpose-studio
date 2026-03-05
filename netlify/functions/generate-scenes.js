const { ask, extractJSON, buildBaseContext, ok, bad, parseBody } = require('./_shared');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return bad('Method Not Allowed', 405);
  try {
    const { script, sceneDuration = 6, customPrompt = '', stylePreset = null } = parseBody(event);
    if (!script || !script.trim()) return bad('script is required', 400);

    const baseContext   = buildBaseContext(customPrompt, stylePreset);
    const wordsPerScene = Math.round((sceneDuration / 60) * 150);

    const system = 'You are a video director. Split the script into scenes and output production prompts. Reply with ONLY valid JSON — no markdown, no code fences, no explanation.';

    const user = (baseContext ? `GLOBAL STYLE & WORLD CONTEXT:\n"""\n${baseContext}\n"""\n\n` : '') +
      `Split this script into scenes of ~${wordsPerScene} words each (≈${sceneDuration}s).\n\n` +
      `For each scene return: text, imagePrompt, brollPrompt, soundPrompt, environment, cameraAngle.\n\n` +
      `JSON format:\n{"scenes":[{"number":1,"text":"...","imagePrompt":"...","brollPrompt":"...","soundPrompt":"...","environment":"...","cameraAngle":"..."}]}\n\n` +
      `SCRIPT:\n${script}`;

    const raw    = await ask(event.headers, system, user, 4096);
    const parsed = extractJSON(raw);
    return ok(parsed);
  } catch (err) {
    if (err instanceof SyntaxError) return bad('AI returned invalid JSON. Try again.');
    return bad(err.message);
  }
};
