import ora from 'ora';
import { stream as playStream } from 'play-dl';
import ytdl from 'ytdl-core';

import { error, info } from './logger';
import { play } from './play';

export async function stream(
  title: string | null,
  volume: number,
  url: string,
) {
  if (title == null) {
    const spinner = ora('Fetching URL information').start();

    try {
      const info = await ytdl.getBasicInfo(url);

      spinner.succeed();

      title = info.videoDetails.title;
    } catch (error) {
      if (error instanceof Error) {
        spinner.fail(`Error: ${error.message}`);
      } else {
        spinner.fail('Error: Something went wrong');
      }

      return;
    }
  }

  try {
    const { stream } = await playStream(url);

    await play(title, volume, stream);
  } catch (err) {
    info('Retrying using ytdl-core instead');

    try {
      const stream = await ytdl(url);

      await play(title, volume, stream);
    } catch (err) {
      if (err instanceof Error) {
        error(`Error: ${err.message}`);
      } else {
        error(`Something went wrong.`);
      }
    }
  }
}
