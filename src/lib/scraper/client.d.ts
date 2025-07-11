import type {
  ClientOptions,
  Playlist,
  PlaylistParseOptions,
  SearchResult,
  SearchType,
  Song,
  SongInfoOptions,
  UserInfo,
  Embed,
} from './types';

declare class Client {
  constructor(apiKey?: string | null, options?: ClientOptions);

  options: ClientOptions;

  apiVersion(force?: boolean): Promise<string | null>;
  createAPIKey(key?: string | null, fetch?: boolean): Promise<void>;
  fetchStreamURL(trackURL: string): Promise<string | null>;
  getEmbed(embedURL: string): Promise<Embed | null>;
  getPlaylist(url: string, options?: PlaylistParseOptions): Promise<Playlist>;
  getSongInfo(url: string, options?: SongInfoOptions): Promise<Song>;
  getUser(username: string): Promise<UserInfo>;
  search(query: string, type?: SearchType): Promise<SearchResult[]>;
}

export default Client;
