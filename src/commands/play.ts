import inquirer from 'inquirer';

import { radios } from '@/data/radios';
import { stream } from '@/lib/stream';
import { printBanner } from '@/lib/banner';
import { pick } from '@/helpers/random';

interface Options {
  random?: boolean;
  url?: string;
}

export async function play({ random, url }: Options) {
  await printBanner();

  if (random) {
    const { title, url } = pick(radios);

    return stream(title, url);
  }

  if (url) {
    return stream(null, url);
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

      stream(radio.title, radio.url);
    });
}
