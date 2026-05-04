import inquirer from 'inquirer';
import chalk from 'chalk';

import { printBanner } from '@/lib/banner';
import { play as playAudio } from '@/lib/play';
import { error } from '@/lib/logger';
import {
  fetchStations,
  getStationById,
  resolvePlayableStream,
  stationChoices,
} from '@/lib/somafm';

interface Options {
  quality?: string;
  volume: string;
}

const supportedQualities = ['highest', 'high', 'slow'];
const divider = '-'.repeat(68);

function formatListeners(count: number) {
  return new Intl.NumberFormat('en-US').format(count);
}

export async function play(
  id: string | undefined,
  { quality, volume }: Options,
) {
  await printBanner();
  const normalizedQuality = quality?.toLowerCase();

  if (volume) {
    const volumeNumber = Number(volume);

    if (volumeNumber < 0 || volumeNumber > 1) {
      return error('Volume should be between 0 and 1');
    }
  }

  if (normalizedQuality && !supportedQualities.includes(normalizedQuality)) {
    return error('Quality should be one of: highest, high, slow');
  }

  try {
    const channels = await fetchStations();
    let stationId = id;

    if (!stationId) {
      const answers = await inquirer.prompt([
        {
          choices: stationChoices(channels),
          message: 'Select a SomaFM station to play:',
          name: 'stationId',
          type: 'list',
        },
      ]);

      stationId = answers.stationId as string;
    }

    const station = getStationById(channels, stationId);

    if (!station) {
      return error(
        `Station "${stationId}" not found. Run ${chalk.bold.white('lowfi list')}.`,
      );
    }

    const streamUrl = await resolvePlayableStream(station, normalizedQuality);

    console.log(`\n${chalk.cyan(divider)}`);
    console.log(
      `${chalk.cyan('  Station')}      ${chalk.bold.white(station.title)} ${chalk.dim(`[${station.id}]`)}`,
    );
    console.log(
      `${chalk.cyan('  Genre')}        ${station.genre || 'Unknown'}`,
    );
    console.log(
      `${chalk.cyan('  Listeners')}    ${formatListeners(station.listeners)}`,
    );
    console.log(
      `${chalk.cyan('  Quality')}      ${normalizedQuality || 'auto (best available)'}`,
    );
    if (station.lastPlaying) {
      console.log(
        `${chalk.cyan('  Last Track')}   ${chalk.dim(station.lastPlaying)}`,
      );
    }
    console.log(`${chalk.cyan(divider)}`);

    await playAudio(station.title, Number(volume), streamUrl);
  } catch (err) {
    if (err instanceof Error) {
      error(`Error: ${err.message}`);
    } else {
      error('Something went wrong.');
    }
  }
}
