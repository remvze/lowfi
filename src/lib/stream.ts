import ora from 'ora';

import { error } from './logger';
import { play } from './play';

import { Client } from 'soundcloud-scraper';

import { shuffle } from '@/helpers/random';

export async function stream(volume: number, url: string) {
  let spinner;

  try {
    spinner = ora('Fetching the playlist from SoundCloud').start();

    const client = new Client();
    const info = await client.getPlaylist(url);

    spinner.succeed('Fetched the playlist from SoundCloud');
    console.log('');

    if (info.tracks) {
      const { tracks } = info;
      const shuffled = shuffle(tracks);

      let index = 0;

      while (true) {
        const track = shuffled[index];
        const stream = await track.downloadProgressive();

        await play(track.title!, volume, stream);

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
