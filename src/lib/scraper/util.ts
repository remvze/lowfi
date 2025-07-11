import fetch, { RequestInfo, RequestInit, Response } from 'node-fetch';
import Constants from './constants';
import { load, CheerioAPI } from 'cheerio';
import Store from './store';

interface StreamResponse {
  url?: string;
}

export default class Util {
  private constructor() {
    throw new Error(
      `The ${this.constructor.name} class may not be instantiated!`,
    );
  }

  static validateURL(
    url: string | null = null,
    type: 'all' | 'track' | 'playlist' | 'artist' = 'all',
  ): boolean {
    if (typeof url !== 'string') return false;

    const lastSegment = url.split('/').pop();

    switch (type) {
      case 'artist':
        return Constants.REGEX_ARTIST.test(url);
      case 'playlist':
        return (
          Constants.REGEX_SET.test(url) ||
          (url.includes('soundcloud.app.goo.gl') &&
            lastSegment !== undefined &&
            lastSegment.length === 5)
        );
      case 'track':
        return (
          Constants.REGEX_TRACK.test(url) ||
          (url.includes('soundcloud.app.goo.gl') &&
            lastSegment !== undefined &&
            lastSegment.length > 5)
        );
      default:
        return (
          Constants.SOUNDCLOUD_URL_REGEX.test(url) ||
          /soundcloud\.app\.goo\.gl/.test(url)
        );
    }
  }

  static request(
    url: RequestInfo,
    options: RequestInit = {},
  ): Promise<Response> {
    return fetch(url, options);
  }

  static async parseHTML(
    url: RequestInfo,
    options: RequestInit = {},
  ): Promise<string> {
    try {
      const res = await Util.request(url, { redirect: 'follow', ...options });
      return await res.text();
    } catch {
      return '';
    }
  }

  static loadHTML(html: string | null): CheerioAPI {
    if (!html) throw new Error('No data to load');
    return load(html);
  }

  static async fetchSongStreamURL(
    songURL: string,
    clientID?: string,
  ): Promise<string> {
    if (!songURL) throw new Error('ERROR_NO_URL');

    if (!clientID && Store.has('SOUNDCLOUD_API_KEY')) {
      clientID = Store.get('SOUNDCLOUD_API_KEY');
    }

    const CLIENT_ID = clientID ?? (await Util.keygen());
    if (!CLIENT_ID) throw new Error('Client id not found');

    const res = await Util.request(`${songURL}?client_id=${CLIENT_ID}`, {
      headers: Constants.STREAM_FETCH_HEADERS,
      redirect: 'manual',
    });

    if (res.status !== 200) {
      const errMsg =
        Constants.STREAM_ERRORS[
          `${res.status as keyof typeof Constants.STREAM_ERRORS}`
        ];
      throw new Error(`[Code: ${res.status}] ${errMsg || 'Unknown error'}`);
    }

    const data = (await res.json()) as StreamResponse;
    if (!data.url) throw new Error("Couldn't find stream url");

    return data.url;
  }

  static async keygen(force = false): Promise<string | null> {
    if (Store.has('SOUNDCLOUD_API_KEY') && !force) {
      return Store.get('SOUNDCLOUD_API_KEY');
    }

    try {
      const html = await Util.parseHTML(Constants.SOUNDCLOUD_BASE_URL);
      const scripts = html.split('<script crossorigin src="');
      const urls: string[] = [];

      for (const u of scripts) {
        const chunk = u.replace('"></script>', '').split('\n')[0];
        if (Constants.SOUNDCLOUD_KEYGEN_URL_REGEX.test(chunk)) {
          urls.push(chunk);
        }
      }

      for (let index = 0; index < urls.length; index++) {
        const url = urls[index];
        if (Constants.SOUNDCLOUD_API_KEY_REGEX.test(url)) {
          const scriptHTML = await Util.parseHTML(url);
          if (scriptHTML.includes(',client_id:"')) {
            const key = scriptHTML.split(',client_id:"')[1].split('"')[0];
            Store.set('SOUNDCLOUD_API_KEY', key);
            return key;
          }
        }
      }
    } catch (e) {
      console.error(e);
    }

    return null;
  }
}
