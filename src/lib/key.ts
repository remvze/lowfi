import sckey from 'soundcloud-key-fetch';

export async function fetchKey() {
  return sckey.fetchKey();
}
