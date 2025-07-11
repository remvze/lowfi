import Util from './util';
import Constants from './constants';
import Store from './store';
import Embed from './embed';
import Song from './song';

export default class Client {
  /**
   * SoundCloud client options
   * @typedef {object} ClientOptions
   * @property {boolean} [fetchAPIKey=true] If it should fetch api key on startup
   */

  /**
   * SoundCloud Scraper
   * @param {?string} [API_KEY=null] Existing API key (if any). Else SoundCloud scraper will try to fetch one for you :)
   * @param {?ClientOptions} [ClientOptions] SoundCloud client options
   */
  constructor(API_KEY = null, ClientOptions = { fetchAPIKey: true }) {
    /**
     * Default api key
     * @type {string}
     */
    Object.defineProperty(this, 'API_KEY', {
      value: null,
      writable: true,
    });

    /**
     * Client options
     * @type {object}
     */
    this.options = ClientOptions;

    /**
     * Update api key
     */
    this.createAPIKey(API_KEY, !!this.options.fetchAPIKey);
  }

  /**
   * Returns API version
   * @param {boolean} [force=false] IF it should forcefully parse version
   * @returns {Promise<?string>}
   */
  apiVersion(force = false) {
    return new Promise(resolve => {
      const existing = Store.get('SOUNDCLOUD_API_VERSION');
      if (existing && !force) return resolve(existing);

      Util.parseHTML(
        `${Constants.SOUNDCLOUD_BASE_URL}${Constants.SOUNDCLOUD_API_VERSION}`,
      )
        .then(version => {
          Store.set('SOUNDCLOUD_API_VERSION', version);
          resolve(version);
        })
        .catch(() => {
          resolve(null);
        });
    });
  }

  /**
   * Returns soundcloud song info
   * @param {string} url Soundcloud song URL
   * @param {object} options SoundCloud song info options
   * @param {boolean} [options.fetchEmbed=false] If it should fetch embed
   * @param {boolean} [options.fetchComments=false] If it should fetch comments
   * @param {boolean} [options.fetchStreamURL=false] If it should fetch stream url
   * @param {RequestInit} [options.requestOptions={}] The request options
   * @returns {Promise<Song>}
   */
  getSongInfo(
    url,
    options = {
      fetchComments: false,
      fetchEmbed: false,
      fetchStreamURL: false,
      requestOptions: {},
    },
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        if (typeof url !== 'string')
          return reject(
            new TypeError(
              `URL type must be a string, received "${typeof url}"!`,
            ),
          );
        if (!Util.validateURL(url, 'track'))
          return reject(new TypeError('Invalid song url!'));
        const raw = await Util.parseHTML(url, options.requestOptions || {});
        if (!raw) return reject(new Error("Couldn't parse html!"));
        const $ = Util.loadHTML(raw);

        const duration =
          raw.split('<meta itemprop="duration" content="') &&
          raw.split('<meta itemprop="duration" content="')[1] &&
          raw.split('<meta itemprop="duration" content="')[1].split('" />')[0];
        const name =
          raw.split('<h1 itemprop="name">') &&
          raw.split('<h1 itemprop="name">')[1].split('by <a')[1] &&
          raw
            .split('<h1 itemprop="name">')[1]
            .split('by <a')[1]
            .split('>')[1] &&
          raw
            .split('<h1 itemprop="name">')[1]
            .split('by <a')[1]
            .split('>')[1]
            .split('</a>')[0]
            .replace('</a', '');
        const trackURLBase = raw.split('},{"url":"')[1];
        let trackURL = null;
        if (trackURLBase) trackURL = trackURLBase.split('","')[0];
        const commentSection =
          raw.split('<section class="comments">') &&
          raw.split('<section class="comments">')[1]
            ? raw.split('<section class="comments">')[1].split('</section>')[0]
            : null;

        const obj = {
          author: {
            avatarURL:
              (raw.split('"avatar_url":"') &&
                raw
                  .split('"avatar_url":"')
                  [raw.split('"avatar_url":"').length - 1].split('"')[0]) ||
              null,
            followers:
              parseInt(
                raw.split(',"followers_count":') &&
                  raw.split(',"followers_count":')[1].split(',')[0],
              ) || 0,
            following:
              parseInt(
                raw.split(',"followings_count":') &&
                  raw.split(',"followings_count":')[1].split(',')[0],
              ) || 0,
            name: name || null,
            url: $('meta[property="soundcloud:user"]').attr('content'),
            urn:
              parseInt(Constants.USER_URN_PATTERN.exec(raw).groups.urn) || null,
            username: $('meta[property="soundcloud:user"]')
              .attr('content')
              .replace('https://soundcloud.com/', ''),
            verified: !raw.includes('","verified":false,"visuals"'),
          },
          comments:
            !!options.fetchComments && !!commentSection
              ? Util.parseComments(commentSection)
              : [],
          commentsCount: $('meta[property="soundcloud:comments_count"]').attr(
            'content',
          ),
          description: $('meta[property="og:description"]').attr('content'),
          duration: duration ? Util.parseDuration(duration) : 0,
          embed: options.fetchEmbed
            ? await this.getEmbed(
                $('link[type="text/json+oembed"]').attr('href'),
              )
            : null,
          embedURL: $('link[type="text/json+oembed"]').attr('href'),
          genre:
            raw.split(',"genre":"')[1] &&
            raw
              .split(',"genre":"')[1]
              .split('","')[0]
              .replace(/\\u0026/g, '&'),
          id: $('meta[property="al:ios:url"]').attr('content').split(':').pop(),
          likes: $('meta[property="soundcloud:like_count"]').attr('content'),
          playCount: $('meta[property="soundcloud:play_count"]').attr(
            'content',
          ),
          publishedAt:
            new Date(
              raw.split('<time pubdate>')[1] &&
                raw.split('<time pubdate>')[1].split('</time>')[0],
            ) || null,
          thumbnail: $('meta[property="og:image"]').attr('content'),
          title: $('meta[property="og:title"]').attr('content'),
          track: {
            hls: trackURL ? trackURL.replace('/progressive', '/hls') : null,
            progressive: trackURL || null,
          },
          trackURL: trackURL || null,
          url: $('link[rel="canonical"]').attr('href'),
        };

        if (options.fetchStreamURL) {
          const url = await this.fetchStreamURL(obj.trackURL);
          obj.streamURL = url || '';
        } else obj.streamURL = '';

        return resolve(new Song(obj));
      } catch (e) {
        return reject(e);
      }
    });
  }

  /**
   * The playlist object
   * @typedef {object} Playlist
   * @property {number} id Playlist id
   * @property {string} title Playlist title
   * @property {string} url Playlist url
   * @property {string} description Playlist description
   * @property {string} thumbnail Playlist thumbnail
   * @property {object} author Playlist author
   * @property {string} author.name Author name
   * @property {string} author.username Author username
   * @property {number} author.urn Author urn
   * @property {string} author.profile Author profile url
   * @property {boolean} author.verified If the author is verified
   * @property {string} embedURL Embed url
   * @property {?Embed} embed Embed
   * @property {string} genre Playlist genre
   * @property {number} trackCount Total tracks available
   * @property {Song[]} tracks Tracks object
   */

  /**
   * @typedef {object} PlaylistParseOptions
   * @property {boolean} [fetchEmbed=false] If it should fetch embed
   */

  /**
   * Returns playlist info
   * @param {string} url Playlist url to parse
   * @param {PlaylistParseOptions} options Playlist parser options
   * @returns {Promise<Playlist>}
   */
  getPlaylist(url, options = { fetchEmbed: false }) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!url || typeof url !== 'string')
          return reject(
            new Error(`URL must be a string, received "${typeof url}"!`),
          );
        if (!Util.validateURL(url, 'playlist'))
          return reject(new TypeError('Invalid url!'));

        const raw = await Util.parseHTML(url);
        if (!raw) return reject(new Error("Couldn't parse html!"));
        const $ = Util.loadHTML(raw);

        let section;
        try {
          section = JSON.parse(
            raw.split('window.__sc_hydration = ')[1].split(';</script>')[0],
          );
        } catch (e) {
          throw new Error(`Could not parse playlist:\n${e.message}`);
        }

        const data = Util.last(section).data;

        const otherTrackIds = data.tracks
          .filter(data => data.id && !data.title)
          .map(e => e.id);

        await this.createAPIKey();

        const work = [];

        const fetch = async url => {
          const res = await Util.request(url);
          const json = await res.json();

          return json;
        };

        const chunks = [];
        const chunkSize = 30;

        for (let i = 0; i < otherTrackIds.length; i += chunkSize) {
          const chunk = otherTrackIds.slice(i, i + chunkSize);

          chunks.push(chunk);
        }

        chunks.forEach(chunk => {
          const apiUrl =
            'https://api-v2.soundcloud.com/tracks?client_id=' +
            Store.get('SOUNDCLOUD_API_KEY') +
            '&ids=' +
            chunk.join(',');

          work.push(fetch(apiUrl));
        });

        const otherTracks = (await Promise.all(work)).flat();

        data.tracks = data.tracks
          .concat(otherTracks)
          .filter(data => data.id && data.title);
        const getMedia = (m, a) =>
          m.media.transcodings.find(x => x.format.protocol === a);

        const info = {
          author: {
            name: data.user.username,
            profile: data.user.permalink_url,
            urn: data.user.id,
            username: data.user.permalink,
            verified: Boolean(data.user.verified),
          },
          description: $('meta[property="og:description"]').attr('content'),
          embed:
            options && !!options.fetchEmbed
              ? await this.getEmbed(
                  $('link[type="text/json+oembed"]').attr('href'),
                )
              : null,
          embedURL: $('link[type="text/json+oembed"]').attr('href'),
          genre: `${raw.split(',"genre":"')[1].split('"')[0]}`.replace(
            /\\u0026/g,
            '&',
          ),
          id: data.id,
          thumbnail: data.artwork_url,
          title: data.title,
          trackCount: data.track_count || 0,
          tracks: data.tracks.map(
            m =>
              new Song({
                author: {
                  avatarURL: m.user.avatar_url,
                  followers: m.user.followers_count,
                  following: 0,
                  name: m.user.username,
                  url: m.user.permalink_url,
                  urn: m.user.id,
                  username: m.user.permalink,
                  verified: !!m.user.badges?.verified,
                },
                comments: [],
                commentsCount: m.comment_count,
                description: m.description,
                duration: m.full_duration || m.duration,
                embed: null,
                embedURL: null,
                genre: m.genre,
                id: m.id,
                likes: m.likes_count,
                playCount: m.playback_count,
                publishedAt: new Date(m.created_at) || null,
                thumbnail: m.artwork_url,
                title: m.title,
                track: {
                  hls: getMedia(m, 'hls') ? getMedia(m, 'hls').url : null,
                  progressive: getMedia(m, 'progressive')
                    ? getMedia(m, 'progressive').url
                    : null,
                },
                trackURL: getMedia(m, 'progressive')
                  ? getMedia(m, 'progressive').url
                  : null,
                url: m.permalink_url,
              }),
          ),
          url: data.permalink_url,
        };

        return resolve(info);
      } catch (e) {
        return reject(e);
      }
    });
  }

  /**
   * @typedef {object} SearchResult
   * @property {number} index Index number
   * @property {?string} artist Artist name (if any)
   * @property {string} url Item url
   * @property {string} itemName Item name
   * @property {string} name Artist name/Title of the result
   * @property {"track"|"artist"|"playlist"|"unknown"} type Result type
   */

  /**
   * Search for `track`/`artist`/`playlist`/`all`.
   * @param {string} query Search query
   * @param {"all"|"artist"|"playlist"|"track"} [type="all"] Search type
   * @returns {Promise<SearchResult[]>}
   */
  search(query, type = 'all') {
    return new Promise(async (resolve, reject) => {
      try {
        if (!query || typeof query !== 'string')
          return reject(
            new Error(
              `Expected search query to be a string, received "${typeof query}"!`,
            ),
          );
        const validType = ['all', 'artist', 'playlist', 'track'];
        if (!validType.includes(type))
          throw new Error(
            `Search type expected to be one of ${validType.map(m => `"${m}"`).join(', ')} but received "${type}"!`,
          );

        let searchPath;

        switch (type) {
          case 'artist':
            searchPath = '/search/people?q=';
            break;
          case 'playlist':
            searchPath = '/search/sets?q=';
            break;
          case 'track':
            searchPath = '/search/sounds?q=';
            break;
          default:
            searchPath = '/search?q=';
        }

        const raw = await Util.parseHTML(
          `${Constants.SOUNDCLOUD_BASE_URL}${searchPath}${encodeURIComponent(query)}`,
        );
        const html = raw
          .split('<noscript><ul>')[1]
          .split('</ul>')[1]
          .split('</noscript>')[0];
        const $ = Util.loadHTML(html);
        const arr = [];
        if ($('li').length < 1) return resolve(arr);

        $('li').each(i => {
          const ref = $('a').eq(i).attr('href');
          const c = ref.split('/').filter(x => !!x);
          let t;

          switch (c.length) {
            case 2:
              t = 'track';
              break;
            case 1:
              t = 'artist';
              break;
            case 3:
              if (c.includes('sets')) t = 'playlist';
              else t = 'unknown';
              break;
            default:
              t = 'unknown';
          }

          arr.push({
            artist: c[0] || null,
            index: i,
            itemName: c.length === 1 ? null : c.pop(),
            name: $('a').eq(i).text(),
            type: t,
            url: `${Constants.SOUNDCLOUD_BASE_URL}${ref}`,
          });
        });

        return resolve(arr);
      } catch (e) {
        return reject(e);
      }
    });
  }

  /**
   * @typedef {object} UserTracks
   * @property {string} title Track title
   * @property {string} url Track url
   * @property {Date} publishedAt Track published timestamp
   * @property {string} genre Track genre
   * @property {string} author Track author
   * @property {number} duration Track duration
   */

  /**
   * @typedef {object} UserLikes
   * @property {string} title Track title
   * @property {string} url Track url
   * @property {Date} publishedAt Track published timestamp
   * @property {object} author Track author
   * @property {string} [author.name] Author name
   * @property {string} [author.username] Author username
   * @property {string} [author.profile] Author profile
   */

  /**
   * @typedef {object} UserInfo
   * @property {number} urn User URN
   * @property {string} username Username
   * @property {string} name Name
   * @property {boolean} verified User verification status
   * @property {Date} createdAt Timestamp when the user was created
   * @property {?string} avatarURL Avatar of the user
   * @property {string} profile Profile of the user
   * @property {?string} bannerURL User profile banner url
   * @property {number} followers Number of followers
   * @property {number} following Number of followings
   * @property {number} likesCount Number of likes
   * @property {number} tracksCount Number of tracks uploaded
   * @property {UserTracks[]} tracks Tracks uploaded by the user
   * @property {UserLikes[]} likes Tracks liked by the user
   */

  /**
   * Returns SoundCloud user info
   * @param {string} username SoundCloud username or profile url
   * @returns {Promise<UserInfo>}
   */
  getUser(username) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!username || typeof username !== 'string')
          reject(
            new Error(
              `Expected username to be a string, received "${typeof username}"!`,
            ),
          );
        const BASE_URL = Constants.SOUNDCLOUD_BASE_URL;
        if (!username.includes(BASE_URL)) username = `${BASE_URL}/${username}`;
        if (!Util.validateURL(username, 'artist'))
          reject(new Error('Invalid artist url'));

        const html = await Util.parseHTML(username);
        const URNSearch = /soundcloud:\/\/users:(?<urn>\d+)/.exec(html);
        if (!URNSearch || !URNSearch.groups.urn)
          return reject(new Error('User not found!'));
        const tracksSection = html.split('<section>')[1].split('</section>')[0];

        const $ = Util.loadHTML(tracksSection);
        let banner = null;
        if (html.includes(',"visual_url":"'))
          banner = html.split(',"visual_url":"')[1].split('"')[0];
        const name = html
          .split(`:${URNSearch.groups.urn}","username":"`)[1]
          .split('"')[0];
        const profile = Util.last(html.split('"permalink_url":"')).split(
          '"',
        )[0];

        const likesSource = await Util.parseHTML(`${username}/likes`);
        const lhtml = likesSource.split('<section>')[1].split('</section>')[0];
        const $$ = Util.loadHTML(lhtml);
        let likes = [];
        let songs = [];

        $('article').each(i => {
          const url = $('a[itemprop="url"]').eq(i);

          songs.push({
            author: profile.split('/').pop(),
            duration: Util.parseDuration(
              $('meta[itemprop="duration"]').eq(i).attr('content'),
            ),
            genre: $('meta[itemprop="genre"]').eq(i).attr('content'),
            publishedAt: new Date($('time').eq(i).text()),
            title: url.text(),
            url: `${Constants.SOUNDCLOUD_BASE_URL}${url.attr('href')}`,
          });
        });

        $$('article').each(i => {
          const url = $('a[itemprop="url"]').eq(i);
          const LastA = $('a').eq(1);

          likes.push({
            author: {
              name: LastA.text(),
              profile: `${Constants.SOUNDCLOUD_BASE_URL}${LastA.attr('href')}`,
              username: LastA.attr('href').replace('/', ''),
            },
            genre: $('meta[itemprop="genre"]').eq(i).attr('content'),
            publishedAt: new Date($('time').eq(i).text()),
            title: url.text(),
            url: `${Constants.SOUNDCLOUD_BASE_URL}${url.attr('href')}`,
          });
        });

        const obj = {
          avatarURL: Util.last(html.split('"avatar_url":"'))
            ? Util.last(html.split('"avatar_url":"')).split('"')[0]
            : null,
          bannerURL: banner,
          createdAt: new Date(
            Util.last(html.split('"created_at":"')).split('","')[0],
          ),
          followers:
            parseInt(
              Util.last(html.split('"followers_count":')).split(',')[0],
            ) || 0,
          following:
            parseInt(
              Util.last(html.split('"followings_count":')).split(',')[0],
            ) || 0,
          likes: likes,
          likesCount:
            parseInt(Util.last(html.split('"likes_count":')).split(',')[0]) ||
            0,
          name: name,
          profile: profile,
          tracks: songs,
          tracksCount:
            parseInt(Util.last(html.split('"track_count":')).split(',')[0]) ||
            0,
          urn: parseInt(URNSearch.groups.urn),
          username: profile.split('/').pop(),
          verified: !html.includes(`,"username":"${name}","verified":false`),
        };

        return resolve(obj);
      } catch (e) {
        return reject(e);
      }
    });
  }

  /**
   * Returns SoundCloud song embed
   * @param {string} embedURL SoundCloud song embed url
   * @returns {Promise<Embed>}
   */
  getEmbed(embedURL) {
    return new Promise(resolve => {
      if (typeof embedURL !== 'string')
        throw new Error(
          `embedURL type must be a string, received "${typeof embedURL}"!`,
        );
      Util.request(embedURL)
        .then(res => res.json())
        .then(json => {
          const embed = new Embed(json, embedURL);
          resolve(embed);
        })
        .catch(() => {
          resolve(null);
        });
    });
  }

  /**
   * Creates API key
   * @param {?string} KEY Existing API key (if any). Else SoundCloud scraper will try to fetch one for you :)
   * @param {boolean} [fetch=true] If it should fetch one
   * @returns {Promise<void>}
   */
  async createAPIKey(KEY = null, fetch = true) {
    if (KEY !== false && !KEY && 'SOUNDCLOUD_API_KEY' in process.env)
      KEY = process.env['SOUNDCLOUD_API_KEY'];
    if (!KEY && !!fetch) {
      const key = await Util.keygen();
      if (key && typeof key === 'string') this.API_KEY = key;
      else this.API_KEY = null;
    } else if (KEY) {
      this.API_KEY = KEY;
      Store.set('SOUNDCLOUD_API_KEY', this.API_KEY);
    } else {
      this.API_KEY = null;
    }
  }

  /**
   * Fetch stream url from soundcloud track url
   * @param {string} trackURL Track url to fetch stream from
   * @returns {Promise<?string>}
   */
  async fetchStreamURL(trackURL) {
    if (!trackURL || typeof trackURL !== 'string')
      throw new Error(`Expected track url, received "${typeof trackURL}"!`);
    try {
      const url = await Util.fetchSongStreamURL(
        trackURL,
        Store.get('SOUNDCLOUD_API_KEY'),
      );
      const streamURL = url && typeof url === 'string' ? url : null;
      return streamURL;
    } catch (e) {
      return null;
    }
  }
}
