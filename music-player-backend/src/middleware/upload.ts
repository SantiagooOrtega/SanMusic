import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

function fileFilter(_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const audioTypes = /mp3|wav|ogg|flac|aac|m4a/;
  const imageTypes = /jpeg|jpg|png|webp|gif/;
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  if (audioTypes.test(ext) || imageTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only audio (mp3, wav, ogg, flac, aac, m4a) and image files are allowed'));
  }
}

export const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });
