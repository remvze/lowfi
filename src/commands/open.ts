import inquirer from 'inquirer';
import open from 'open';
import ora from 'ora';

import { playlists } from '@/data/playlists';
import { printBanner } from '@/lib/banner';

export async function openCommand() {
  await printBanner();

  inquirer
    .prompt([
      {
        choices: playlists.map(playlist => playlist.title),
        message: 'Select a lofi playlist to open:',
        name: 'playlist',
        type: 'list',
      },
    ])
    .then(answers => {
      const playlist = playlists.filter(
        playlist => playlist.title === answers.playlist,
      )[0];

      const spinner = ora('Opening the playlist in your browser.').start();

      open(playlist.url).then(() =>
        spinner.succeed('Opened the playlist in your browser.'),
      );
    });
}
