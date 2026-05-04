import chalk from 'chalk';

import { printBanner } from '@/lib/banner';
import { error } from '@/lib/logger';
import { fetchStations } from '@/lib/somafm';

function formatListeners(count: number) {
  return new Intl.NumberFormat('en-US').format(count);
}

export async function list() {
  await printBanner();

  try {
    const channels = (await fetchStations()).sort(
      (left, right) => right.listeners - left.listeners,
    );
    const idWidth = 16;
    const listenersWidth = 10;

    console.log(chalk.cyan(`\nSomaFM Stations: ${channels.length}`));
    console.log(
      chalk.dim(
        `Most popular right now: ${chalk.white(channels[0]?.title || 'N/A')} (${formatListeners(channels[0]?.listeners || 0)} listeners)`,
      ),
    );
    console.log(
      chalk.blue.bold(
        `${'ID'.padEnd(idWidth)} | ${'LISTENERS'.padEnd(listenersWidth)} | STATION`,
      ),
    );
    console.log(chalk.blue('-'.repeat(90)));

    channels.forEach(channel => {
      const genre = channel.genre ? ` - ${channel.genre}` : '';
      console.log(
        `${chalk.green(channel.id.padEnd(idWidth))} | ${formatListeners(channel.listeners).padEnd(listenersWidth)} | ${channel.title}${genre}`,
      );
    });

    console.log('');
  } catch (err) {
    if (err instanceof Error) {
      error(`Error: ${err.message}`);
    } else {
      error('Something went wrong.');
    }
  }
}
