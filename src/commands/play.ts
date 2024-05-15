import inquirer from 'inquirer';

import { radios } from '@/data/radios';
import { stream } from '@/lib/stream';

export function play() {
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
