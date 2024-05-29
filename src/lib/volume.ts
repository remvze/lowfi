import Volume from 'pcm-volume';

export function createVolume(amount: number) {
  const volume = new Volume();

  volume.setVolume(amount);

  return volume;
}
