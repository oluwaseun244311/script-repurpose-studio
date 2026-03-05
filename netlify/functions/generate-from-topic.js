import { ask, ok, bad, parseBody } from './_shared.js';

const STYLE_DESCRIPTIONS = {
  storytelling: 'narrative storytelling with a personal, engaging voice that draws the viewer in',
  dramatic:     'dramatic and intense, with emotional peaks and tension-building language',
  cinematic:    'cinematic and visual, describing scenes as if directing a film',
  educational:  'clear, informative and educational, structured for easy understanding',
  documentary:  'authoritative documentary narration style, objective and compelling',
  motivational: 'high-energy, motivational and inspiring, driving the viewer to action',
  'short-form': 'punchy, fast-paced short-form reel style optimized for quick attention spans',
};

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return bad('Method Not Allowed', 405);
  try {
    const { topic, ideas = '', platform = 'youtube', wordTarget = 310, style = 'storytelling', stylePrompt = '' } = parseBody(event);
    if (!topic?.trim()) return bad('topic is required', 400);

    const styleDesc   = STYLE_DESCRIPTIONS[style] || STYLE_DESCRIPTIONS.storytelling;
    const customStyle = stylePrompt?.trim();

    const system = `You are a professional scriptwriter who specialises in video content. Write complete, engaging video scripts from scratch. Return ONLY the script text — no headings, no scene labels, no notes, no explanations.`;

    const user = `${customStyle ? `STYLE INSTRUCTION (follow exactly):\n"""\n${customStyle}\n"""\n\n` : ''}Write a video script about: "${topic}"
${ideas.trim() ? `\nKey ideas, angles, and points to cover:\n${ideas.trim()}\n` : ''}
Requirements:
${!customStyle ? `- Style: ${styleDesc}\n` : ''}- Length: approximately ${wordTarget} words
- Platform: optimised for ${platform}
- Start with a powerful hook that grabs attention immediately
- No timestamps, no scene numbers — clean, flowing script text only`;

    const result = await ask(event.headers, system, user, 2048);
    return ok({ script: result });
  } catch (err) {
    return bad(err.message);
  }
};
