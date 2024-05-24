export function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, '0');

  const mins = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, '0');

  const secs = (seconds % 60).toString().padStart(2, '0');

  return `${hrs}:${mins}:${secs}`;
}
