export default {
  REGEX_ARTIST: /^https?:\/\/(soundcloud\.com|snd\.sc)\/([A-Za-z0-9_-]+)\/?$/,
  REGEX_SET:
    /^https?:\/\/(soundcloud\.com|snd\.sc)\/([A-Za-z0-9_-]+)\/sets\/([A-Za-z0-9_-]+)\/?$/,
  REGEX_TRACK:
    /^https?:\/\/(soundcloud\.com|snd\.sc)\/([A-Za-z0-9_-]+)\/([A-Za-z0-9_-]+)\/?$/,
  SOUNDCLOUD_API_KEY_REGEX:
    /(https:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/,
  SOUNDCLOUD_API_VERSION: '/version.txt',
  SOUNDCLOUD_BASE_URL: 'https://soundcloud.com',
  SOUNDCLOUD_KEYGEN_URL_REGEX:
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/,
  SOUNDCLOUD_URL_REGEX: /^https?:\/\/(soundcloud\.com|snd\.sc)\/(.*)$/,
  STREAM_ERRORS: {
    401: 'Invalid ClientID',
    404: 'Track not found/requested private track',
  },
  STREAM_FETCH_HEADERS: {
    Accept: '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36',
  },
  USER_URN_PATTERN: /soundcloud:users:(?<urn>\d+)/,
};
