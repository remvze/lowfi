import { padNumber } from './number';

export function formatTime(seconds: number) {
  const hrs = padNumber(Math.floor(seconds / 3600));
  const mins = padNumber(Math.floor((seconds % 3600) / 60));
  const secs = padNumber(seconds % 60);

  return `${hrs}:${mins}:${secs}`;
}
