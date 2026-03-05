const { ask, ok, bad, parseBody } = require('./_shared');

const STYLE_DESCRIPTIONS = {
  storytelling: 'narrative storytelling with a personal, engaging voice that draws the viewer in',
  dramatic:     'dramatic and intense, with emotional peaks and tension-building language',
  cinematic:    'cinematic and visual, describing scenes as if directing a film',
  educational:  'clear, informative and educational, structured for easy understanding',
  documentary:  'authoritative documentary narration style, objective and compelling',
  motivational: 'high-energy, motivational and inspiring, driving the viewer to action',
  'short-form': 'punchy, fast-paced short-form reel style optimized for quick attention spans',
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return bad('Method Not Allowed', 405);
  try {
    const { topic, ideas = '', platform = 'youtube', wordTarget = 310, style = 'storytelling', stylePrompt = '' } = parseBody(event);
    if (!topic || !topic.trim()) return bad('topic is required', 400);

    const styleDesc   = STYLE_DESCRIPTIONS[style] || STYLE_DESCRIPTIONS.storytelling;
    const customStyle = stylePrompt ? stylePrompt.trim() : '';

    const system = 'You are a professional scriptwriter who specialises in video content. Write complete, engaging video scripts from scratch. Return ONLY the script text — no headings, no scene labels, no notes, no explanations.';

    const user = (customStyle ? `STYLE INSTRUCTION (follow exactly):\n"""\n${customStyle}\n"""\n\n` : '') +
      `Write a video script about: "${topic}"\n` +
      (ideas && ideas.trim() ? `\nKey ideas, angles, and points to cover:\n${ideas.trim()}\n` : '') +
      `\nRequirements:\n` +
      (!customStyle ? `- Style: ${styleDesc}\n` : '') +
      `- Length: approximately ${wordTarget} words\n` +
      `- Platform: optimised for ${platform}\n` +
      `- Start with a powerful hook that grabs attention immediately\n` +
      `- No timestamps, no scene numbers — clean, flowing script text only`;

    const result = await ask(event.headers, system, user, 2048);
    return ok({ script: result });
  } catch (err) {
    return bad(err.message);
  }
};
