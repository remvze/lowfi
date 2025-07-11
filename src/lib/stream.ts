import ora from 'ora';

import {
  stream as playStream,
  getFreeClientID,
  setToken,
  SoundCloudPlaylist,
  soundcloud,
} from 'play-dl';

import { error } from './logger';
import { play } from './play';

import { shuffle } from '@/helpers/random';

export async function stream(volume: number, url: string) {
  let spinner;

  try {
    spinner = ora('Fetching the playlist from SoundCloud').start();

    const id = await getFreeClientID();

    setToken({
      soundcloud: {
        client_id: id,
      },
    });

    const data = await soundcloud(url);

    spinner.succeed('Fetched the playlist from SoundCloud');

    if (data.type === 'playlist') {
      const spinner = ora('Fetching all the tracks from SoundCloud').start();

      const pl = new SoundCloudPlaylist(data, id);
      const tracks = await pl.all_tracks();

      spinner.succeed('Fetched all the tracks from SoundCloud');
      console.log('');

      const shuffled = shuffle(tracks);

      let index = 0;

      while (true) {
        const track = shuffled[index];
        const { stream } = await playStream(track.url);

        await play(track.name, volume, stream);

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
