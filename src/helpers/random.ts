export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min);
}

export function pick<T>(array: Array<T>): T {
  const randomIndex = random(0, array.length);

  return array[randomIndex];
}
