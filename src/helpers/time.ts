import { padNumber } from './number';

export function formatTime(seconds: number) {
  const mins = padNumber(Math.floor(seconds / 60));
  const secs = padNumber(seconds % 60);

  return `${mins}:${secs}`;
}
