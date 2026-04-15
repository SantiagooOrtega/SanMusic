import { Song, PlayerState, ApiResponse } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';
const BASE = `${BASE_URL}/api/music`;

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error || 'Request failed');
  return json.data as T;
}

export const api = {
  getPlaylist: () => request<Song[]>(`${BASE}/playlist`),
  getStatus: () => request<PlayerState>(`${BASE}/status`),
  getCurrent: () => request<{ song: Song | null; status: string }>(`${BASE}/current`),
  getHistory: () => request<Song[]>(`${BASE}/history`),
  play: () => request<PlayerState>(`${BASE}/play`, { method: 'POST' }),
  pause: () => request<PlayerState>(`${BASE}/pause`, { method: 'POST' }),
  next: () => request<PlayerState>(`${BASE}/next`, { method: 'POST' }),
  previous: () => request<PlayerState>(`${BASE}/previous`, { method: 'POST' }),
  setCurrent: (id: string) =>
    request<{ song: Song | null; status: string }>(`${BASE}/current/${id}`, { method: 'POST' }),
  deleteSong: (id: string) =>
    request<null>(`${BASE}/song/${id}`, { method: 'DELETE' }),

  // Uses FormData to support optional audio + cover file uploads
  addSong: (data: { title: string; artist: string; duration: number; audio?: File; cover?: File }) => {
    const form = new FormData();
    form.append('title', data.title);
    form.append('artist', data.artist);
    form.append('duration', String(data.duration));
    if (data.audio) form.append('audio', data.audio);
    if (data.cover) form.append('cover', data.cover);
    return request<Song>(`${BASE}/song`, { method: 'POST', body: form });
  },

  updateSong: (id: string, data: { title: string; artist: string; duration: number; audio?: File; cover?: File }) => {
    const form = new FormData();
    form.append('title', data.title);
    form.append('artist', data.artist);
    form.append('duration', String(data.duration));
    if (data.audio) form.append('audio', data.audio);
    if (data.cover) form.append('cover', data.cover);
    return request<Song>(`${BASE}/song/${id}`, { method: 'PUT', body: form });
  },
};
