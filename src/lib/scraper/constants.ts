export default {
  SOUNDCLOUD_API_KEY_REGEX:
    /(https:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/,
  SOUNDCLOUD_BASE_URL: 'https://soundcloud.com',
  SOUNDCLOUD_KEYGEN_URL_REGEX:
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/,
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
};
