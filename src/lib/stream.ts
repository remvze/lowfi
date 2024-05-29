import ora from 'ora';
import { stream as playStream } from 'play-dl';
import ytdl from 'ytdl-core';
import logSymbols from 'log-symbols';

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
  } catch (error) {
    console.log(logSymbols.info, 'Retrying using ytdl-core instead');

    try {
      const stream = await ytdl(url);

      await play(title, volume, stream);
    } catch (error) {
      if (error instanceof Error) {
        console.error(logSymbols.error, `Error: ${error.message}`);
      } else {
        console.error(logSymbols.error, `Something went wrong.`);
      }
    }
  }
}
