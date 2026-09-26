import { Router } from 'express';
import { SpeechController } from '../controllers/speech.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Retrieve available AI Examiner voice profiles
router.get('/voices', authenticate, SpeechController.getVoiceProfiles);

// Synthesize examiner vocal audio (TTS)
router.post('/tts', authenticate, SpeechController.synthesizeSpeech);

// Transcribe candidate microphone audio (STT)
router.post('/stt', authenticate, SpeechController.transcribeSpeech);

export default router;
