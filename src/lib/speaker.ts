import Speaker from 'speaker';

export function createSpeaker() {
  const speaker = new Speaker({
    bitDepth: 16,
    channels: 2,
    sampleRate: 44100,
  });

  return speaker;
}
