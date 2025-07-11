import { RequestOptions, IncomingMessage } from 'http';
import { Options as m3u8Options, Stream as m3u8Stream } from 'm3u8stream';
import { CheerioAPI } from 'cheerio';

type Optional<T> = {
  [P in keyof T]?: T[P];
};

export interface ClientOptions {
  fetchAPIKey?: boolean;
}

export interface CommentAuthor {
  name?: string;
  url?: string;
  username?: string;
}

export interface Comment {
  author: CommentAuthor;
  createdAt: Date;
  text: string;
}

export interface EmbedAuthor {
  name: string;
  url: string;
}

export interface EmbedProvider {
  name: string;
  url: string;
}

export interface BaseUser {
  name: string;
  urn: number;
  username: string;
  verified: boolean;
}

export interface PlaylistAuthor extends BaseUser {
  profile: string;
}

export interface Playlist {
  author: PlaylistAuthor;
  description: string;
  embed: Embed;
  embedURL: string;
  genre: string;
  id: number;
  thumbnail: string;
  title: string;
  trackCount: number;
  tracks: Song[];
  url: string;
}

export interface PlaylistParseOptions {
  fetchEmbed?: boolean;
}

export type SearchResultType = 'track' | 'artist' | 'playlist' | 'unknown';
export type SearchType = 'all' | 'artist' | 'playlist' | 'track';

export interface SearchResult {
  artist: string;
  index: number;
  itemName: string;
  name: string;
  type: SearchResultType;
  url: string;
}

export interface SongAuthor extends BaseUser {
  avatarURL: string;
  followers: number;
  following: number;
  url: string;
}

export interface SongStreams {
  hls: string;
  progressive: string;
}

export interface SongData {
  author: SongAuthor;
  comments: Comment[];
  commentsCount: string;
  description: string;
  duration: number;
  embed: Embed;
  embedURL: string;
  genre: string;
  id: string;
  likes: string;
  playCount: string;
  publishedAt: Date;
  streamURL: string;
  thumbnail: string;
  title: string;
  track: Optional<SongStreams>;
  trackURL: string;
  url: string;
}

export interface UserInfo extends BaseUser {
  avatarURL: string;
  bannerURL: string;
  createdAt: Date;
  followers: number;
  following: number;
  likes: UserLikes[];
  likesCount: number;
  profile: string;
  tracks: UserTracks[];
  tracksCouint: number;
}

export interface UserLikesAuthor {
  name?: string;
  profile?: string;
  username?: string;
}

export interface UserLikes {
  author: UserLikesAuthor;
  publishedAt: Date;
  title: string;
  url: string;
}

export interface UserTracks {
  author: string;
  duration: number;
  genre: string;
  publishedAt: Date;
  title: string;
  url: string;
}

export interface SongInfoOptions {
  fetchComments?: boolean;
  fetchEmbed?: boolean;
  fetchStreamURL?: boolean;
  requestOptions?: RequestInit;
}

export class Client {
  constructor(apiKey?: string, options?: ClientOptions);

  options: ClientOptions;

  apiVersion(force?: boolean): Promise<string | null>;
  createAPIKey(key: string, fetch?: boolean): Promise<void>;
  fetchStreamURL(trackURL: string): Promise<string | null>;
  getEmbed(embedURL: string): Promise<Embed | null>;
  getPlaylist(
    url: string,
    options?: PlaylistParseOptions,
  ): Promise<Playlist | null>;
  getSongInfo(url: string, options?: SongInfoOptions): Promise<Song | null>;
  getUser(username: string): Promise<UserInfo | null>;
  search(query: string, type: SearchType): Promise<SearchResult[] | null>;
}

export class Downloader {
  constructor();

  downloadHLS(url: string, options?: m3u8Options): Promise<m3u8Stream>;
  downloadProgressive(
    url: string,
    options?: RequestOptions,
  ): Promise<IncomingMessage>;
}

export class Embed {
  constructor(data: object, embedURL: string);

  author: EmbedAuthor;
  description: string;
  height: number;
  provider: EmbedProvider;
  thumbnailURL: string;
  title: string;
  type: string;
  url: string;
  version: number;
  visualizer: string;
  width: number;

  toHTML(): string;
  toJSON(): object;
  toString(): string;
}

export class Song {
  constructor(data: object);

  readonly age: number;
  author: SongAuthor;
  comments: Comment[];
  commentsCount: number;
  description: string;
  duration: number;
  embed: Embed;
  embedURL: string;
  genre: string;
  id: string;
  likes: number;
  playCount: number;
  publishedAt: Date;
  readonly publishedTimestamp: number;
  streams: SongStreams;
  streamURL: string;
  thumbnail: string;
  title: string;
  trackURL: string;
  url: string;

  downloadHLS(options?: m3u8Options): Promise<m3u8Stream>;
  downloadProgressive(options?: RequestOptions): Promise<IncomingMessage>;
  toJSON(): SongData;
  toString(): string;
}

export namespace Util {
  export function fetchSongStreamURL(
    songURL: string,
    clientID: string,
  ): Promise<string>;
  export function keygen(force?: boolean): Promise<string>;
  export function last<T>(arr: T[]): T;
  export function loadHTML(html: string): CheerioAPI;
  export function parseComments(commentSection: string): Comment[];
  export function parseDuration(duration: string): number;
  export function parseHTML(
    url: RequestInfo,
    options?: RequestInit,
  ): Promise<string>;
  export function request(
    url: RequestInfo,
    options?: RequestInit,
  ): Promise<Response>;
  export function validateURL(url: string, type?: SearchType): boolean;
}
