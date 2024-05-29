import type { Readable } from 'stream';
import ora from 'ora';

import { formatTime } from '@/helpers/time';

import { MiddlewareStream } from './middleware';
import { createFfmpegStream } from './ffmpeg';
import { createSpeaker } from './speaker';
import { createVolume } from './volume';

export function play(title: string, volumeAmount: number, stream: Readable) {
  return new Promise((resolve, reject) => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const elapsedTimeSpinner = ora({
      spinner: 'clock',
      text: `Listening for 00:00:00`,
    });

    const spinner = ora(`Starting ${title}`).start();
    let startTime: number;

    try {
      const speaker = createSpeaker();
      const volume = createVolume(volumeAmount);

      const middleware = new MiddlewareStream(() => {
        spinner.succeed();

        startTime = Date.now();

        elapsedTimeSpinner.start();

        timer = setInterval(() => {
          const elapsedTime = Math.floor((Date.now() - startTime) / 1000);

          elapsedTimeSpinner.text = `Listening for ${formatTime(elapsedTime)}`;
        }, 1000);
      });

      const ffmpegStream = createFfmpegStream(
        stream,
        () => {
          if (timer) clearInterval(timer);

          const elapsedTime = Math.floor((Date.now() - startTime) / 1000);

          elapsedTimeSpinner.succeed(
            `Stream ended. You listened for ${formatTime(elapsedTime)}.`,
          );

          resolve(true);
        },
        error => {
          if (timer) clearInterval(timer);

          spinner.fail(`Failed to start stream: ${error.message}`);

          reject(error);
        },
      );

      ffmpegStream.pipe(middleware).pipe(volume).pipe(speaker);
    } catch (error) {
      reject(error);
    }
  });
}
