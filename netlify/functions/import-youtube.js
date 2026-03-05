const { YoutubeTranscript } = require('youtube-transcript');
const { ok, bad, parseBody } = require('./_shared');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return bad('Method Not Allowed', 405);
  try {
    const { url } = parseBody(event);
    if (!url || !url.trim()) return bad('url is required', 400);

    const transcript = await YoutubeTranscript.fetchTranscript(url);
    const text = transcript.map(item => item.text).join(' ');
    return ok({ transcript: text });
  } catch (err) {
    return bad('Could not fetch transcript: ' + err.message);
  }
};
