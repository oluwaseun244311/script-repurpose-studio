const { ask, extractJSON, buildBaseContext, ok, bad, parseBody } = require('./_shared');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return bad('Method Not Allowed', 405);
  try {
    const { sceneText, sceneNumber, customPrompt = '', stylePreset = null } = parseBody(event);
    if (!sceneText || !sceneText.trim()) return bad('sceneText is required', 400);

    const baseContext = buildBaseContext(customPrompt, stylePreset);

    const system = 'You are a video director. Generate production prompts for a single scene. Reply with ONLY valid JSON — no markdown, no code fences.';

    const user = (baseContext ? `GLOBAL STYLE & WORLD CONTEXT:\n"""\n${baseContext}\n"""\n\n` : '') +
      `Generate fresh prompts for Scene ${sceneNumber}:\n` +
      `Scene text: "${sceneText}"\n\n` +
      `Return exactly: {"imagePrompt":"...","brollPrompt":"...","soundPrompt":"...","environment":"...","cameraAngle":"..."}`;

    const raw    = await ask(event.headers, system, user, 1024);
    const parsed = extractJSON(raw);
    return ok(parsed);
  } catch (err) {
    return bad(err.message);
  }
};
