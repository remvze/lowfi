import inquirer from 'inquirer';
import open from 'open';
import ora from 'ora';

import { radios } from '@/data/radios';

export function openCommand() {
  inquirer
    .prompt([
      {
        choices: radios.map(radio => radio.title),
        message: 'Select a lofi radio to open:',
        name: 'radio',
        type: 'list',
      },
    ])
    .then(answers => {
      const radio = radios.filter(radio => radio.title === answers.radio)[0];

      const spinner = ora('Opening the radio').start();

      open(radio.url).then(() => spinner.succeed());
    });
}
