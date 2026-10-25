import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import {
  ArchiveDoc, ArchiveFile, ArchiveMetadataResponse, ArchiveScrapeResponse, ArchiveSearchResponse,
} from '../models/archive.model';
import { Song } from '../models/song.model';
import { cleanName, firstValue, parseLength } from '../utils/text.utils';

/** Songs shorter than this are clips; longer ones are nonstop mixes. Both are skipped. */
const MIN_SONG_SECONDS = 45;
const MAX_SONG_SECONDS = 25 * 60;
/** Most songs taken from a single album, so one album can't fill a playlist. */
const MAX_SONGS_PER_ITEM = 40;

/**
 * Talks to the Internet Archive (archive.org). No API key needed.
 *  - search():   find albums matching a query, most downloaded first
 *  - getSongs(): list the playable MP3 songs inside one album
 */
@Injectable({ providedIn: 'root' })
export class ArchiveService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://archive.org';

  /** Albums matching `query`, or null if archive.org couldn't be reached. */
  async search(query: string, rows = 36): Promise<ArchiveDoc[] | null> {
    const q = `mediatype:audio AND (${query})`;

    try {
      const params = new HttpParams()
        .set('q', q)
        .append('fl[]', 'identifier').append('fl[]', 'title').append('fl[]', 'creator').append('fl[]', 'downloads')
        .set('sort[]', 'downloads desc')
        .set('rows', rows)
        .set('page', 1)
        .set('output', 'json');
      const res = await firstValueFrom(this.http.get<ArchiveSearchResponse>(`${this.baseUrl}/advancedsearch.php`, { params }));
      if (res.response?.docs) return res.response.docs;
    } catch {
      /* try the backup endpoint below */
    }

    try {
      const params = new HttpParams()
        .set('q', q)
        .set('fields', 'identifier,title,creator,downloads')
        .set('sorts', 'downloads desc')
        .set('count', 100);
      const res = await firstValueFrom(this.http.get<ArchiveScrapeResponse>(`${this.baseUrl}/services/search/v1/scrape`, { params }));
      if (res.items) return res.items.slice(0, rows);
    } catch {
      /* archive.org unreachable */
    }
    return null;
  }

  /** Playable songs in one album, in track order. Empty if the album is gone or restricted. */
  async getSongs(itemId: string): Promise<Song[]> {
    try {
      const res = await firstValueFrom(
        this.http.get<ArchiveMetadataResponse>(`${this.baseUrl}/metadata/${encodeURIComponent(itemId)}`));
      if (!res || !Array.isArray(res.files) || res.is_dark) return [];

      const meta = res.metadata ?? {};
      if (String(meta['access-restricted-item']) === 'true') return [];

      const album = cleanName(firstValue(meta.title)) || itemId;
      const albumArtist = firstValue(meta.creator);

      // Originals first, so the de-duplication below keeps them over lower-quality copies.
      const mp3s = res.files
        .filter(f => /\.mp3$/i.test(f.name) && String(f.private) !== 'true' && !/(_sample|_preview|_spectrogram)/i.test(f.name))
        .sort((a, b) => (a.source === 'original' ? 0 : 1) - (b.source === 'original' ? 0 : 1));

      const seen = new Set<string>();
      const songs: Array<Song & { track: number }> = [];
      for (const file of mp3s) {
        const seconds = parseLength(file.length);
        if (seconds && (seconds < MIN_SONG_SECONDS || seconds > MAX_SONG_SECONDS)) continue;

        // "song.mp3" and its "song_64kb.mp3" copy are the same song
        const base = file.name.replace(/(_64kb|_128kb|_vbr)?\.mp3$/i, '').toLowerCase();
        if (seen.has(base)) continue;
        seen.add(base);

        songs.push({ ...this.describe(file, albumArtist, album), itemId, file: file.name, album, track: parseInt(file.track ?? '', 10) || 999 });
      }

      return songs
        .sort((a, b) => a.track - b.track || a.file.localeCompare(b.file))
        .slice(0, MAX_SONGS_PER_ITEM)
        .map(({ track, ...song }) => song);
    } catch {
      return [];
    }
  }

  /** Direct MP3 link for the audio player. */
  songUrl(song: Song): string {
    const path = song.file.split('/').map(encodeURIComponent).join('/');
    return `${this.baseUrl}/download/${encodeURIComponent(song.itemId)}/${path}`;
  }

  /** Album cover (archive.org picks the item's main image). */
  thumbnailUrl(itemId: string): string {
    return `${this.baseUrl}/services/img/${encodeURIComponent(itemId)}`;
  }

  /** Title and artist from the file's tags, falling back to its file name. */
  private describe(file: ArchiveFile, albumArtist: string, album: string): { title: string; artist: string } {
    let title = cleanName(file.title) || cleanName(file.name.split('/').pop());
    let artist = cleanName(firstValue(file.artist) || firstValue(file.creator) || albumArtist);

    // File names like "Tujhe Dekha To - Kumar Sanu" when there are no tags
    if (!file.title && !artist) {
      const parts = title.split(/\s[-–—|]\s/);
      if (parts.length === 2) [title, artist] = parts;
    }
    if (artist.length > 60) artist = artist.slice(0, 57) + '…';
    return { title: title || 'Untitled', artist: artist || album };
  }
}
