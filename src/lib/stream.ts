import type { Readable } from 'stream';

import ora from 'ora';
import { Soundcloud } from 'soundcloud.ts';

import { error } from './logger';
import { play } from './play';

import { shuffle } from '@/helpers/random';
import { fetchKey } from './key';

export async function stream(volume: number, url: string) {
  let spinner;

  try {
    spinner = ora('Fetching the playlist from SoundCloud').start();

    const clientId = await fetchKey();
    const soundcloud = new Soundcloud(clientId);
    const playlist = await soundcloud.playlists.get(url);

    if (playlist?.tracks) {
      spinner.succeed(
        `Fetched the playlist from SoundCloud (${playlist.track_count} Tracks)`,
      );
      console.log('');

      const { tracks } = playlist;
      const shuffled = shuffle(tracks);

      let index = 0;

      while (true) {
        const track = shuffled[index];
        const stream = await soundcloud.util.streamTrack(track.permalink_url);

        await play(track.title!, volume, stream as Readable);

        index = (index + 1) % shuffled.length;
      }
    }
  } catch (err) {
    spinner?.stop();

    if (err instanceof Error) {
      error(`Error: ${err.message}`);
    } else {
      error(`Something went wrong.`);
    }
  }
}
