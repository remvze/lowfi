import Speaker from 'speaker';
import ffmpeg from 'fluent-ffmpeg-7';
import ora from 'ora';

import play from 'play-dl';

export async function stream(title: string, url: string) {
  const spinner = ora(`Starting ${title}`).start();

  // eslint-disable-next-line
  const { stream } = await play.stream(url);

  spinner.succeed();

  const speaker = new Speaker();

  ffmpeg(stream)
    .toFormat('s16le')
    .audioFrequency(44100)
    .audioChannels(2)
    .pipe(speaker);
}
