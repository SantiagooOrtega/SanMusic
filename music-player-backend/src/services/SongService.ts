import { v4 as uuidv4 } from 'uuid';
import { Song } from '../types/Song';
import { CreateSongDTO } from '../dto/CreateSongDTO';
import { sharedPlaylist } from './sharedPlaylist';

export class SongService {
  addSong(dto: CreateSongDTO): Song {
    if (!dto.title?.trim()) throw new Error('Title is required');
    if (!dto.artist?.trim()) throw new Error('Artist is required');
    if (!dto.duration || dto.duration <= 0) throw new Error('Duration must be a positive number');
    if (sharedPlaylist.hasDuplicate(dto.title, dto.artist)) {
      throw new Error('Duplicate song: this title and artist already exist');
    }

    const song: Song = {
      id: uuidv4(),
      title: dto.title.trim(),
      artist: dto.artist.trim(),
      duration: dto.duration,
      ...(dto.coverUrl && { coverUrl: dto.coverUrl }),
      ...(dto.audioUrl && { audioUrl: dto.audioUrl }),
    };

    if (dto.position === 0) {
      sharedPlaylist.addFirst(song);
    } else if (dto.position === undefined || dto.position >= sharedPlaylist.getSize()) {
      sharedPlaylist.addLast(song);
    } else {
      sharedPlaylist.insertAt(song, dto.position);
    }

    return song;
  }

  updateSong(id: string, dto: Partial<CreateSongDTO>): Song {
    const existing = sharedPlaylist.findById(id);
    if (!existing) throw new Error('Song not found');

    // Apply updates in place on the node
    if (dto.title?.trim()) existing.title = dto.title.trim();
    if (dto.artist?.trim()) existing.artist = dto.artist.trim();
    if (dto.duration && dto.duration > 0) existing.duration = dto.duration;
    if (dto.coverUrl) existing.coverUrl = dto.coverUrl;
    if (dto.audioUrl) existing.audioUrl = dto.audioUrl;

    return { ...existing };
  }

  deleteSong(id: string): boolean {
    if (!id?.trim()) throw new Error('ID is required');
    const deleted = sharedPlaylist.deleteById(id);
    if (!deleted) throw new Error('Song not found');
    return true;
  }

  getAllSongs(): Song[] { return sharedPlaylist.getAll(); }

  findById(id: string): Song | null { return sharedPlaylist.findById(id); }
}
