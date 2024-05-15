import ytdl from 'ytdl-core';
import Speaker from 'speaker';
import ffmpeg from 'fluent-ffmpeg-7';
import ora from 'ora';

export function stream(title: string, url: string) {
  const spinner = ora(`Starting ${title}`).start();

  ytdl.getInfo(url).then(res => {
    const stream = ytdl.downloadFromInfo(res);

    spinner.succeed();

    const speaker = new Speaker();

    ffmpeg(stream)
      .toFormat('s16le')
      .audioFrequency(44100)
      .audioChannels(2)
      .pipe(speaker);
  });
}
