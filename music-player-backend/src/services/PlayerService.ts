import { Song } from '../types/Song';
import { PlayerStatus } from '../types/PlayerStatus';

export class PlayerService {
  private status: PlayerStatus = 'STOPPED';
  private currentSong: Song | null = null;

  play(song: Song | null): { status: PlayerStatus; song: Song | null } {
    if (!song) throw new Error('No song selected to play');
    this.currentSong = song;
    this.status = 'PLAYING';
    return { status: this.status, song: this.currentSong };
  }

  pause(): { status: PlayerStatus; song: Song | null } {
    if (this.status !== 'PLAYING') throw new Error('Player is not currently playing');
    this.status = 'PAUSED';
    return { status: this.status, song: this.currentSong };
  }

  stop(): { status: PlayerStatus } {
    this.status = 'STOPPED';
    this.currentSong = null;
    return { status: this.status };
  }

  getStatus(): { status: PlayerStatus; song: Song | null } {
    return { status: this.status, song: this.currentSong };
  }
}
