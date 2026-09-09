'use strict';

const express = require('express');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  const { text, voiceId } = req.body || {};
  if (!text) return res.status(400).json({ error: 'invalid_input', message: 'text é obrigatório' });

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return res.json({
      demoMode: true,
      message: 'ELEVENLABS_API_KEY não configurada — sem áudio real. Use o assistente de voz Python com TTS local (pyttsx3) para ouvir a resposta.',
    });
  }

  try {
    const voice = voiceId || process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // "Rachel", voz padrão pública da ElevenLabs
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2' }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: 'elevenlabs_error', message: errText });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    res.set('Content-Type', 'audio/mpeg');
    return res.send(buffer);
  } catch (err) {
    return res.status(502).json({ error: 'elevenlabs_error', message: err.message });
  }
});

module.exports = router;
