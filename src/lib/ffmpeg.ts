import type { Readable } from 'stream';
import ffmpeg from 'fluent-ffmpeg';

export function createFfmpegStream(
  stream: Readable,
  onEnd: () => void,
  onError: (error: Error) => void,
) {
  const ffmpegStream = ffmpeg(stream)
    .toFormat('s16le')
    .audioFrequency(44100)
    .audioChannels(2)
    .on('error', onError)
    .on('end', onEnd);

  return ffmpegStream;
}
