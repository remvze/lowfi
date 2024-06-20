import inquirer from 'inquirer';

import { radios } from '@/data/radios';
import { stream } from '@/lib/stream';
import { printBanner } from '@/lib/banner';
import { pick } from '@/helpers/random';
import { error } from '@/lib/logger';

interface Options {
  random?: boolean;
  volume: string;
}

export async function play({ random, volume }: Options) {
  await printBanner();

  if (volume) {
    const volumeNumber = Number(volume);

    if (volumeNumber < 0 || volumeNumber > 1) {
      return error('Volume should be between 0 and 1');
    }
  }

  if (random) {
    const { url } = pick(radios);

    return stream(Number(volume), url);
  }

  inquirer
    .prompt([
      {
        choices: radios.map(radio => radio.title),
        message: 'Select a lofi radio to play:',
        name: 'radio',
        type: 'list',
      },
    ])
    .then(answers => {
      const radio = radios.filter(radio => radio.title === answers.radio)[0];

      stream(Number(volume), radio.url);
    });
}
