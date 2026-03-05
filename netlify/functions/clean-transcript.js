import { ask, ok, bad, parseBody } from './_shared.js';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return bad('Method Not Allowed', 405);
  try {
    const { transcript } = parseBody(event);
    if (!transcript?.trim()) return bad('transcript is required', 400);

    const result = await ask(
      event.headers,
      `You are a transcript editor. Clean the transcript: remove timestamps, speaker labels, filler words (um, uh, like, you know, ah), stutters, [laughter], [applause], and fix basic punctuation. Keep all meaningful content. Return only the cleaned text, no explanations.`,
      transcript
    );
    return ok({ cleaned: result });
  } catch (err) {
    return bad(err.message);
  }
};
