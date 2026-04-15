import express from 'express';
import cors from 'cors';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';
import musicRoutes from './routes/musicRoutes';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// Serve uploaded files (covers and audio)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/music', musicRoutes);
app.use(errorHandler as any);

export default app;
