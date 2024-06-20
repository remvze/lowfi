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
    console.log('');

    if (data.type === 'playlist') {
      const pl = new SoundCloudPlaylist(data, id);
      const tracks = await pl.all_tracks();
      const shuffled = shuffle(tracks);

      for (const track of shuffled) {
        const { stream } = await playStream(track.url);

        await play(track.name, volume, stream);
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
