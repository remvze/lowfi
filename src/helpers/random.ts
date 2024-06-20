export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min);
}

export function pick<T>(array: Array<T>): T {
  const randomIndex = random(0, array.length);

  return array[randomIndex];
}

export function shuffle<T>(array: Array<T>): Array<T> {
  return array
    .map(value => ({ sort: Math.random(), value }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}
