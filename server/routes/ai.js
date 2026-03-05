import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { YoutubeTranscript } from 'youtube-transcript';

export const router = express.Router();

// Extract the first complete JSON object from any text (handles code fences, preamble, trailing text)
const extractJSON = (text) => {
  const start = text.indexOf('{');
  const end   = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) throw new SyntaxError('No JSON object found in response');
  return JSON.parse(text.slice(start, end + 1));
};

const getClient = (req) => {
  const key = (req?.headers?.['x-api-key']) || process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('No API key configured. Add your Claude API key in Settings.');
  return new Anthropic({ apiKey: key });
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const ask = async (req, system, user, maxTokens = 4096, retries = 3) => {
  const client = getClient(req);
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const msg = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: maxTokens,
        system,
        messages: [{ role: 'user', content: user }],
      });
      return msg.content[0].text;
    } catch (err) {
      const isOverloaded = err.status === 529 || err.message?.includes('overloaded');
      if (isOverloaded && attempt < retries) {
        console.warn(`Claude overloaded — retrying in ${attempt * 3}s (attempt ${attempt}/${retries})`);
        await sleep(attempt * 3000);
        continue;
      }
      if (isOverloaded) throw new Error('Claude API is busy right now. Please wait a moment and try again.');
      throw err;
    }
  }
};

// ─── Test connection ─────────────────────────────────────────────────────────

router.post('/test-connection', async (req, res) => {
  try {
    const client = getClient(req);
    await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 5,
      messages: [{ role: 'user', content: 'Hi' }],
    });
    res.json({ success: true, message: 'Connection successful — API key is valid.' });
  } catch (err) {
    const msg = (err.status === 401 || err.message?.includes('401'))
      ? 'Invalid API key. Check the key and try again.'
      : err.message || 'Connection failed.';
    res.status(400).json({ success: false, message: msg });
  }
});

// ─── Clean transcript ───────────────────────────────────────────────────────

router.post('/clean-transcript', async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript?.trim()) return res.status(400).json({ error: 'transcript is required' });

    const result = await ask(
      req,
      `You are a transcript editor. Clean the transcript: remove timestamps, speaker labels, filler words (um, uh, like, you know, ah), stutters, [laughter], [applause], and fix basic punctuation. Keep all meaningful content. Return only the cleaned text, no explanations.`,
      transcript
    );
    res.json({ cleaned: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Rewrite script ─────────────────────────────────────────────────────────

const STYLE_DESCRIPTIONS = {
  storytelling: 'narrative storytelling with a personal, engaging voice that draws the viewer in',
  dramatic: 'dramatic and intense, with emotional peaks and tension-building language',
  cinematic: 'cinematic and visual, describing scenes as if directing a film',
  educational: 'clear, informative and educational, structured for easy understanding',
  documentary: 'authoritative documentary narration style, objective and compelling',
  motivational: 'high-energy, motivational and inspiring, driving the viewer to action',
  'short-form': 'punchy, fast-paced short-form reel style optimized for quick attention spans',
};

const LENGTH_WORDS = { short: '150–250', medium: '250–450', long: '450–700' };
const ENERGY_DESC = { low: 'calm and measured', medium: 'balanced energy', high: 'high energy and dynamic' };
const HOOK_DESC = { low: 'soft opening', medium: 'solid hook', high: 'powerful attention-grabbing hook' };

router.post('/rewrite-script', async (req, res) => {
  try {
    const { transcript, style = 'storytelling', controls = {}, stylePrompt = '' } = req.body;
    if (!transcript?.trim()) return res.status(400).json({ error: 'transcript is required' });

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

    const result = await ask(req, system, user, 2048);
    res.json({ script: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Generate script from topic / ideas ─────────────────────────────────────

router.post('/generate-from-topic', async (req, res) => {
  try {
    const { topic, ideas = '', platform = 'youtube', wordTarget = 310, style = 'storytelling', stylePrompt = '' } = req.body;
    if (!topic?.trim()) return res.status(400).json({ error: 'topic is required' });

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

    const result = await ask(req, system, user, 2048);
    res.json({ script: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Style preset modifiers ──────────────────────────────────────────────────

const STYLE_MODIFIERS = {
  anime:    'anime style, cel shading, vibrant colors, manga-inspired artwork',
  realism:  'photorealistic, highly detailed, cinematic photography, 8K resolution, professional lighting',
  cartoon:  'cartoon style, bold outlines, flat colors, playful illustration',
  '3d':     '3D rendering, CGI, Pixar-style, volumetric lighting, ray tracing, high-poly models',
  faceless: 'faceless humanoid character, silhouette figure, abstract human form, no visible facial features',
};

const buildBaseContext = (customPrompt = '', stylePreset = null) => {
  const parts = [];
  if (customPrompt?.trim()) parts.push(customPrompt.trim());
  if (stylePreset && STYLE_MODIFIERS[stylePreset]) parts.push(STYLE_MODIFIERS[stylePreset]);
  return parts.join('. ');
};

// ─── Generate scenes ────────────────────────────────────────────────────────

router.post('/generate-scenes', async (req, res) => {
  try {
    const { script, sceneDuration = 6, customPrompt = '', stylePreset = null } = req.body;
    if (!script?.trim()) return res.status(400).json({ error: 'script is required' });

    const baseContext = buildBaseContext(customPrompt, stylePreset);

    const system = `You are a professional video director. Split scripts into scenes and generate production prompts. Respond with ONLY valid JSON — no markdown, no code fences, no explanation.`;

    const wordsPerScene = Math.round((sceneDuration / 60) * 150);

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

    const raw = await ask(req, system, user, 8192);
    const parsed = extractJSON(raw);
    res.json(parsed);
  } catch (err) {
    if (err instanceof SyntaxError) {
      res.status(500).json({ error: 'AI returned invalid JSON. Try again.' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// ─── Regenerate single scene prompts ────────────────────────────────────────

router.post('/regenerate-scene', async (req, res) => {
  try {
    const { sceneText, sceneNumber, customPrompt = '', stylePreset = null } = req.body;
    if (!sceneText?.trim()) return res.status(400).json({ error: 'sceneText is required' });

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

    const raw = await ask(req, system, user, 1024);
    const parsed = extractJSON(raw);
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── YouTube transcript import ───────────────────────────────────────────────

router.post('/import-youtube', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url?.trim()) return res.status(400).json({ error: 'url is required' });

    const transcript = await YoutubeTranscript.fetchTranscript(url);
    const text = transcript.map(item => item.text).join(' ');
    res.json({ transcript: text });
  } catch (err) {
    res.status(500).json({ error: `Could not fetch transcript: ${err.message}` });
  }
});
