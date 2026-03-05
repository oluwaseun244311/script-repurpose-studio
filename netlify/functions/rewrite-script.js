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

const ENERGY_DESC = { low: 'calm and measured', medium: 'balanced energy', high: 'high energy and dynamic' };
const HOOK_DESC   = { low: 'soft opening', medium: 'solid hook', high: 'powerful attention-grabbing hook' };

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return bad('Method Not Allowed', 405);
  try {
    const { transcript, style = 'storytelling', controls = {}, stylePrompt = '' } = parseBody(event);
    if (!transcript?.trim()) return bad('transcript is required', 400);

    const { videoMinutes = 2, videoSeconds = 0, energy = 'medium', hookStrength = 'medium', platform = 'youtube' } = controls;
    const wordTarget  = Math.round(((videoMinutes * 60) + videoSeconds) * 155 / 60) || 310;
    const styleDesc   = STYLE_DESCRIPTIONS[style] || STYLE_DESCRIPTIONS.storytelling;
    const customStyle = stylePrompt?.trim();

    const system = `You are a professional scriptwriter who specializes in video content. Rewrite the provided transcript into a polished script. Return ONLY the rewritten script text with no headings, notes, or explanations.`;

    const user = `${customStyle ? `STYLE INSTRUCTION (follow exactly):\n"""\n${customStyle}\n"""\n\n` : ''}Rewrite this transcript with the following requirements:
${!customStyle ? `- Style: ${styleDesc}\n` : ''}- Length: approximately ${wordTarget} words (${videoMinutes}m ${videoSeconds}s at 155 wpm)
- Energy: ${ENERGY_DESC[energy] || 'balanced'}
- Hook: ${HOOK_DESC[hookStrength] || 'solid hook'} at the very beginning
- Platform: optimized for ${platform}
- No timestamps, no scene labels, no metadata — just clean flowing script text

TRANSCRIPT:
${transcript}`;

    const result = await ask(event.headers, system, user, 2048);
    return ok({ script: result });
  } catch (err) {
    return bad(err.message);
  }
};
