import { Router } from 'express';
import { MusicController } from '../controllers/MusicController';
import { MusicPlayerFacade } from '../facade/MusicPlayerFacade';
import { upload } from '../middleware/upload';

const router = Router();
const ctrl = new MusicController();

// Seed 6 songs on startup
const seedFacade = new MusicPlayerFacade();
const seedSongs = [
  { title: 'Blinding Lights', artist: 'The Weeknd', duration: 200 },
  { title: 'Shape of You', artist: 'Ed Sheeran', duration: 234 },
  { title: 'Levitating', artist: 'Dua Lipa', duration: 203 },
  { title: 'Stay', artist: 'Kid Laroi', duration: 141 },
  { title: 'Heat Waves', artist: 'Glass Animals', duration: 238 },
  { title: 'As It Was', artist: 'Harry Styles', duration: 167 },
];
seedSongs.forEach(s => { try { seedFacade.addSong(s); } catch (_) {} });
console.log('🎵 Music-San playlist seeded with 6 songs');

// Song management — accepts multipart/form-data with optional audio + cover files
router.post('/song', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), (req, res, next) => ctrl.addSong(req, res, next));
router.put('/song/:id', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), (req, res, next) => ctrl.updateSong(req, res, next));
router.delete('/song/:id', (req, res, next) => ctrl.removeSong(req, res, next));

// Playlist
router.get('/playlist', (req, res, next) => ctrl.getPlaylist(req, res, next));
router.get('/current', (req, res, next) => ctrl.getCurrentSong(req, res, next));
router.post('/current/:id', (req, res, next) => ctrl.setCurrentSong(req, res, next));

// Player controls
router.get('/status', (req, res, next) => ctrl.getStatus(req, res, next));
router.post('/play', (req, res, next) => ctrl.play(req, res, next));
router.post('/pause', (req, res, next) => ctrl.pause(req, res, next));
router.post('/next', (req, res, next) => ctrl.next(req, res, next));
router.post('/previous', (req, res, next) => ctrl.previous(req, res, next));

// History
router.get('/history', (req, res, next) => ctrl.getHistory(req, res, next));

export default router;
