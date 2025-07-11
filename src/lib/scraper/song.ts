import Util from './util';
import Downloader from './downloader';
import Store from './store';
import { Options as M3U8StreamOptions, Stream as M3U8Stream } from 'm3u8stream';
import { RequestOptions, IncomingMessage } from 'http';

interface SongStreams {
  hls: string | null;
  progressive: string | null;
}

interface SongData {
  id: string | null;
  streamURL?: string | null;
  title: string | null;
  track: {
    hls?: string | null;
    progressive?: string | null;
  };
  trackURL: string | null;
  url: string | null;
}

export default class Song {
  id: string | null = null;
  title: string | null = null;
  url: string | null = null;
  streams!: SongStreams;
  trackURL: string | null = null;
  streamURL: string | null = null;

  private readonly _raw!: SongData;

  constructor(data: SongData) {
    this._patch(data);
    Object.defineProperty(this, '_raw', { value: data });
  }

  private _patch(data: SongData): void {
    if (!data) return;

    this.id = data.id || null;
    this.title = data.title || null;
    this.url = data.url || null;
    this.streams = {
      hls: data.track?.hls || null,
      progressive: data.track?.progressive || null,
    };
    this.trackURL = data.trackURL || null;
    this.streamURL = data.streamURL || null;
  }

  async downloadHLS(options: M3U8StreamOptions = {}): Promise<M3U8Stream> {
    if (!this.streams.hls) throw new Error();

    const url = await Util.fetchSongStreamURL(
      this.streams.hls,
      Store.get('SOUNDCLOUD_API_KEY'),
    );

    const streamURL = typeof url === 'string' ? url : null;
    if (!streamURL) throw new Error("Couldn't parse stream url");

    return Downloader.downloadHLS(streamURL, options);
  }

  async downloadProgressive(
    options: RequestOptions = {},
  ): Promise<IncomingMessage> {
    const url = this.streamURL ?? this.streams.progressive;

    if (!url) throw new Error();

    const resolvedURL = await Util.fetchSongStreamURL(
      url,
      Store.get('SOUNDCLOUD_API_KEY'),
    );

    const streamURL = typeof resolvedURL === 'string' ? resolvedURL : null;
    if (!streamURL) throw new Error("Couldn't parse stream url");

    return Downloader.downloadProgressive(streamURL, options);
  }

  toString(): string {
    return this.title || '';
  }

  toJSON(): SongData {
    return this._raw;
  }
}
