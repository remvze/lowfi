import inquirer from 'inquirer';
import open from 'open';
import ora from 'ora';

import { radios } from '@/data/radios';
import { printBanner } from '@/lib/banner';

export async function openCommand() {
  await printBanner();

  inquirer
    .prompt([
      {
        choices: radios.map(radio => radio.title),
        message: 'Select a lofi playlist to open:',
        name: 'radio',
        type: 'list',
      },
    ])
    .then(answers => {
      const radio = radios.filter(radio => radio.title === answers.radio)[0];

      const spinner = ora('Opening the playlist in your browser.').start();

      open(radio.url).then(() =>
        spinner.succeed('Opened the playlist in your browser.'),
      );
    });
}
