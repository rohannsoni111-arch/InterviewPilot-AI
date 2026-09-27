import { Router } from 'express';
import { PeerRoomController } from '../controllers/peerRoom.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Create a new room (auth optional / supported)
router.post('/', authenticate, PeerRoomController.createRoom);

// Get room details by room code
router.get('/:roomCode', PeerRoomController.getRoom);

// Join room
router.post('/:roomCode/join', authenticate, PeerRoomController.joinRoom);

// Switch role (interviewer vs candidate)
router.post('/:roomCode/role', authenticate, PeerRoomController.switchRole);

// Sync code state
router.post('/:roomCode/sync-code', authenticate, PeerRoomController.syncCode);

// Update evaluator rubric notes & ratings
router.post('/:roomCode/notes', authenticate, PeerRoomController.updateNotes);

// Submit final evaluation
router.post('/:roomCode/evaluate', authenticate, PeerRoomController.submitEvaluation);

export default router;
