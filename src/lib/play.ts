import type { Readable } from 'stream';
import ora from 'ora';

import { formatTime } from '@/helpers/time';

import { MiddlewareStream } from './middleware';
import { createFfmpegStream } from './ffmpeg';
import { createSpeaker } from './speaker';

export function play(title: string, stream: Readable) {
  return new Promise((resolve, reject) => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const elapsedTimeSpinner = ora({
      spinner: 'clock',
      text: `00:00:00`,
    });

    const spinner = ora(`Starting ${title}`).start();

    try {
      const speaker = createSpeaker();
      const middleware = new MiddlewareStream(() => {
        spinner.succeed();

        const startTime = Date.now();

        elapsedTimeSpinner.start();

        timer = setInterval(() => {
          const elapsedTime = Math.floor((Date.now() - startTime) / 1000);

          elapsedTimeSpinner.text = formatTime(elapsedTime);
        }, 1000);
      });
      const ffmpegStream = createFfmpegStream(
        stream,
        () => {
          if (timer) clearInterval(timer);

          elapsedTimeSpinner.succeed(
            `Stream ended. You listened for ${elapsedTimeSpinner.text.slice(2)}.`,
          );

          resolve(true);
        },
        error => {
          if (timer) clearInterval(timer);

          spinner.fail(`Failed to start stream: ${error.message}`);

          reject(error);
        },
      );

      ffmpegStream.pipe(middleware).pipe(speaker);
    } catch (error) {
      reject(error);
    }
  });
}
