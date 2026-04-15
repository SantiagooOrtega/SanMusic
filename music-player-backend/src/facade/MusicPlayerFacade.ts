import { SongService } from '../services/SongService';
import { PlaylistService } from '../services/PlaylistService';
import { PlayerService } from '../services/PlayerService';
import { HistoryService } from '../services/HistoryService';
import { CreateSongDTO } from '../dto/CreateSongDTO';
import { Song } from '../types/Song';
import { PlayerStatus } from '../types/PlayerStatus';

export class MusicPlayerFacade {
  private songService = new SongService();
  private playlistService = new PlaylistService();
  private playerService = new PlayerService();
  private historyService = new HistoryService();

  addSong(dto: CreateSongDTO): Song {
    const song = this.songService.addSong(dto);
    console.log(`[Music-San] Song added. Playlist size: ${this.playlistService.getSize()}`);
    return song;
  }

  updateSong(id: string, dto: Partial<import('../dto/CreateSongDTO').CreateSongDTO>): import('../types/Song').Song {
    return this.songService.updateSong(id, dto);
  }

  removeSong(id: string): boolean {
    const status = this.playerService.getStatus();
    if (status.song?.id === id) this.playerService.stop();
    return this.songService.deleteSong(id);
  }

  play(): { status: PlayerStatus; song: Song | null } {
    const current = this.playlistService.getCurrentSong();
    const result = this.playerService.play(current);
    if (result.song) this.historyService.addToHistory(result.song);
    return result;
  }

  pause(): { status: PlayerStatus; song: Song | null } {
    return this.playerService.pause();
  }

  stop(): { status: PlayerStatus } {
    return this.playerService.stop();
  }

  next(): { status: PlayerStatus; song: Song | null } {
    const song = this.playlistService.nextSong();
    const result = this.playerService.play(song);
    if (result.song) this.historyService.addToHistory(result.song);
    return result;
  }

  previous(): { status: PlayerStatus; song: Song | null } {
    const song = this.playlistService.previousSong();
    const result = this.playerService.play(song);
    if (result.song) this.historyService.addToHistory(result.song);
    return result;
  }

  setCurrentSong(id: string): boolean {
    return this.playlistService.setCurrentSong(id);
  }

  getCurrentSong(): { song: Song | null; status: PlayerStatus } {
    const song = this.playlistService.getCurrentSong();
    const { status } = this.playerService.getStatus();
    return { song, status };
  }

  getPlaylist(): Song[] {
    const songs = this.playlistService.getPlaylist();
    console.log(`[Music-San] Playlist retrieved. Total: ${this.playlistService.getSize()}`);
    return songs;
  }

  getHistory(): Song[] { return this.historyService.getHistory(); }

  getPlayerStatus(): { status: PlayerStatus; song: Song | null } { return this.playerService.getStatus(); }
}
