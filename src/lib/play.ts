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
    const spinner = ora(`Now playing "${title}" (00:00)`);

    let startTime: number;

    try {
      const speaker = createSpeaker();
      const volume = createVolume(volumeAmount);

      const middleware = new MiddlewareStream(() => {
        startTime = Date.now();

        spinner.start();

        timer = setInterval(() => {
          const elapsedTime = Math.floor((Date.now() - startTime) / 1000);

          spinner.text = `Now playing "${title}" (${formatTime(elapsedTime)})`;
        }, 1000);
      });

      const ffmpegStream = createFfmpegStream(
        stream,
        () => {
          if (timer) clearInterval(timer);

          const elapsedTime = Math.floor((Date.now() - startTime) / 1000);

          spinner.succeed(`Finished "${title}" (${formatTime(elapsedTime)})`);

          resolve(true);
        },
        error => {
          if (timer) clearInterval(timer);

          reject(error);
        },
      );

      ffmpegStream.pipe(middleware).pipe(volume).pipe(speaker);
    } catch (error) {
      reject(error);
    }
  });
}
