import { Request, Response, NextFunction } from 'express';
import { MusicPlayerFacade } from '../facade/MusicPlayerFacade';
import { ApiResponse } from '../dto/ApiResponse';
import { Song } from '../types/Song';

const facade = new MusicPlayerFacade();

export class MusicController {
  addSong(req: Request, res: Response, next: NextFunction): void {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const coverFile = files?.cover?.[0];
      const audioFile = files?.audio?.[0];

      const duration = parseFloat(req.body.duration);

      const song = facade.addSong({
        ...req.body,
        duration,
        coverUrl: coverFile ? `/uploads/${coverFile.filename}` : undefined,
        audioUrl: audioFile ? `/uploads/${audioFile.filename}` : undefined,
      });

      const response: ApiResponse<Song> = { success: true, data: song, message: 'Song added successfully' };
      res.status(201).json(response);
    } catch (err) { next(err); }
  }

  updateSong(req: Request, res: Response, next: NextFunction): void {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const coverFile = files?.cover?.[0];
      const audioFile = files?.audio?.[0];
      const duration = parseFloat(req.body.duration);

      const song = facade.updateSong(req.params.id, {
        ...req.body,
        duration,
        ...(coverFile && { coverUrl: `/uploads/${coverFile.filename}` }),
        ...(audioFile && { audioUrl: `/uploads/${audioFile.filename}` }),
      });

      res.status(200).json({ success: true, data: song, message: 'Song updated successfully' });
    } catch (err) { next(err); }
  }

  removeSong(req: Request, res: Response, next: NextFunction): void {
    try {
      facade.removeSong(req.params.id);
      res.status(200).json({ success: true, message: 'Song removed successfully' });
    } catch (err) { next(err); }
  }

  getPlaylist(req: Request, res: Response, next: NextFunction): void {
    try {
      res.status(200).json({ success: true, data: facade.getPlaylist() });
    } catch (err) { next(err); }
  }

  getCurrentSong(req: Request, res: Response, next: NextFunction): void {
    try {
      res.status(200).json({ success: true, data: facade.getCurrentSong() });
    } catch (err) { next(err); }
  }

  play(req: Request, res: Response, next: NextFunction): void {
    try {
      res.status(200).json({ success: true, data: facade.play() });
    } catch (err) { next(err); }
  }

  pause(req: Request, res: Response, next: NextFunction): void {
    try {
      res.status(200).json({ success: true, data: facade.pause() });
    } catch (err) { next(err); }
  }

  next(req: Request, res: Response, next: NextFunction): void {
    try {
      res.status(200).json({ success: true, data: facade.next() });
    } catch (err) { next(err); }
  }

  previous(req: Request, res: Response, next: NextFunction): void {
    try {
      res.status(200).json({ success: true, data: facade.previous() });
    } catch (err) { next(err); }
  }

  getStatus(req: Request, res: Response, next: NextFunction): void {
    try {
      res.status(200).json({ success: true, data: facade.getPlayerStatus() });
    } catch (err) { next(err); }
  }

  getHistory(req: Request, res: Response, next: NextFunction): void {
    try {
      res.status(200).json({ success: true, data: facade.getHistory() });
    } catch (err) { next(err); }
  }

  // Set current song by id (for clicking a song in the playlist)
  setCurrentSong(req: Request, res: Response, next: NextFunction): void {
    try {
      const result = facade.setCurrentSong(req.params.id);
      if (!result) throw new Error('Song not found');
      res.status(200).json({ success: true, data: facade.getCurrentSong() });
    } catch (err) { next(err); }
  }
}
