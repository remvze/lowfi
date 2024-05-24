import Speaker from 'speaker';
import ffmpeg from 'fluent-ffmpeg-7';
import ora from 'ora';
import play from 'play-dl';

async function stream(title: string, url: string) {
  const spinner = ora(`Starting ${title}`).start();

  try {
    const { stream } = await play.stream(url);

    spinner.succeed();

    const startTime = Date.now();
    const elapsedTimeSpinner = ora(`🕒 00:00:00`).start();

    const timer = setInterval(() => {
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
      elapsedTimeSpinner.text = `🕒 ${formatTime(elapsedTime)}`;
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
    spinner.fail(`Failed to start stream: ${error.message}`);
  }
}

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, '0');
  const mins = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

export { stream };
