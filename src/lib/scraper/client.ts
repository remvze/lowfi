import Util from './util';
import Store from './store';
import Song from './song';

interface ClientOptions {
  fetchAPIKey?: boolean;
}

interface Playlist {
  id: number;
  title: string;
  trackCount: number;
  tracks: Song[];
  url: string;
}

interface SoundCloudTrack {
  id: number;
  media: {
    transcodings: {
      format: {
        protocol: string;
      };
      url: string;
    }[];
  };
  permalink_url?: string;
  title?: string;
}

interface SoundCloudPlaylistResponse {
  id: number;
  kind: string;
  permalink_url: string;
  title: string;
  track_count: number;
  tracks: SoundCloudTrack[];
}

export default class Client {
  private API_KEY: string | null = null;
  private options: ClientOptions;

  constructor(
    API_KEY: string | null = null,
    ClientOptions: ClientOptions = { fetchAPIKey: true },
  ) {
    Object.defineProperty(this, 'API_KEY', {
      value: null,
      writable: true,
    });

    this.options = ClientOptions;
    this.createAPIKey(API_KEY, !!this.options.fetchAPIKey);
  }

  async getPlaylist(url: string): Promise<Playlist> {
    if (!url || typeof url !== 'string') {
      throw new Error(`URL must be a string, received "${typeof url}"!`);
    }

    await this.createAPIKey();

    const apiUrl = `https://api-v2.soundcloud.com/resolve?client_id=${Store.get('SOUNDCLOUD_API_KEY')}&url=${url}`;
    const res = await Util.request(apiUrl);
    const data = (await res.json()) as SoundCloudPlaylistResponse;

    if (data.kind !== 'playlist') {
      throw new Error('Not a playlist');
    }

    const tracks = data.tracks;
    const otherTrackIds = tracks.filter(t => t.id && !t.title).map(t => t.id);

    const chunkSize = 30;
    const chunks: number[][] = [];
    for (let i = 0; i < otherTrackIds.length; i += chunkSize) {
      chunks.push(otherTrackIds.slice(i, i + chunkSize));
    }

    const fetch = async (url: string): Promise<SoundCloudTrack[]> => {
      const res = await Util.request(url);
      const data = (await res.json()) as SoundCloudTrack[];
      return data;
    };

    const work = chunks.map(chunk => {
      const ids = chunk.join(',');
      const chunkUrl = `https://api-v2.soundcloud.com/tracks?client_id=${Store.get('SOUNDCLOUD_API_KEY')}&ids=${ids}`;
      return fetch(chunkUrl);
    });

    const otherTracks = (await Promise.all(work)).flat();

    const allTracks = tracks.concat(otherTracks).filter(t => t.id && t.title);

    const getMedia = (
      m: SoundCloudTrack,
      protocol: string,
    ): { url: string } | undefined => {
      return m.media.transcodings.find(x => x.format.protocol === protocol);
    };

    return {
      id: data.id,
      title: data.title,
      trackCount: data.track_count || 0,
      tracks: allTracks.map(m => {
        const progressive = getMedia(m, 'progressive');
        const hls = getMedia(m, 'hls');

        return new Song({
          id: String(m.id),
          streamURL: null,
          title: m.title || '',
          track: {
            hls: hls?.url ?? null,
            progressive: progressive?.url ?? null,
          },
          trackURL: progressive?.url ?? null,
          url: m.permalink_url || '',
        });
      }),
      url: data.permalink_url,
    };
  }

  async createAPIKey(
    KEY: string | null = null,
    fetch: boolean = true,
  ): Promise<void> {
    if (!KEY && 'SOUNDCLOUD_API_KEY' in process.env) {
      KEY = process.env['SOUNDCLOUD_API_KEY']!;
    }

    if (!KEY && fetch) {
      const key = await Util.keygen();

      this.API_KEY = typeof key === 'string' ? key : null;
    } else if (KEY) {
      this.API_KEY = KEY;

      Store.set('SOUNDCLOUD_API_KEY', this.API_KEY);
    } else {
      this.API_KEY = null;
    }
  }
}
