import m3u8stream, {
  Options as M3U8StreamOptions,
  Stream as M3U8Stream,
} from 'm3u8stream';
import http, { RequestOptions, IncomingMessage } from 'http';
import https from 'https';

class Downloader {
  private constructor() {
    throw new Error(
      `The ${this.constructor.name} class may not be instantiated!`,
    );
  }

  static downloadHLS(
    url: string,
    options: M3U8StreamOptions = {},
  ): Promise<M3U8Stream> {
    return new Promise((resolve, reject) => {
      if (!url || typeof url !== 'string') {
        return reject(new Error(`Expected url, received "${typeof url}"!`));
      }
      const stream = m3u8stream(url, options);
      resolve(stream);
    });
  }

  static downloadProgressive(
    url: string,
    options: RequestOptions = {},
  ): Promise<IncomingMessage> {
    return new Promise((resolve, reject) => {
      if (!url || typeof url !== 'string') {
        return reject(new Error(`Expected url, received "${typeof url}"!`));
      }
      const protocol = url.startsWith('http://') ? http : https;
      protocol.get(url, options, res => resolve(res));
    });
  }
}

export default Downloader;
