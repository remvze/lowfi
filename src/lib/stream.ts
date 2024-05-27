import Speaker from 'speaker';
import ffmpeg from 'fluent-ffmpeg-7';
import ora from 'ora';
import { stream as playStream } from 'play-dl';
import ytdl from 'ytdl-core';

import { formatTime } from '@/helpers/time';

export async function stream(title: string | null, url: string) {
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

  const spinner = ora(`Starting ${title}`).start();

  try {
    const { stream } = await playStream(url);

    spinner.succeed();

    const startTime = Date.now();

    const elapsedTimeSpinner = ora({
      spinner: 'clock',
      text: `00:00:00`,
    }).start();

    const timer = setInterval(() => {
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000);

      elapsedTimeSpinner.text = formatTime(elapsedTime);
    }, 1000);

    const speaker = new Speaker({
      bitDepth: 16,
      channels: 2,
      sampleRate: 44100,
    });

    ffmpeg(stream)
      .toFormat('s16le')
      .audioFrequency(44100)
      .audioChannels(2)
      .on('error', error => {
        clearInterval(timer);
        spinner.fail(`Failed to start stream: ${error.message}`);
      })
      .on('end', () => {
        clearInterval(timer);
        elapsedTimeSpinner.succeed(
          `Stream ended. You listened for ${elapsedTimeSpinner.text.slice(2)}.`,
        );
      })
      .pipe(speaker);
  } catch (error) {
    if (error instanceof Error) {
      spinner.fail(`Failed to start stream: ${error.message}`);
    } else {
      spinner.fail('Failed to start stream');
    }
  }
}
