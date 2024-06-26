import { Command } from 'commander';

import { play } from './commands/play';
import { donate } from './commands/donate';
import { openCommand } from './commands/open';

import pkg from '../package.json';

const program = new Command();

program
  .name('lowfi')
  .description('A CLI tool to play lofi music')
  .version(pkg.version);

program
  .command('play')
  .description('Play a lofi playlist')
  .option('-r, --random', 'Select a playlist randomly')
  .option('-v, --volume <number>', 'Set the volume', '0.5')
  .action(play);

program
  .command('donate')
  .description('Donate to the creator of Lowfi')
  .action(donate);

program
  .command('open')
  .description('Open a lofi playlist in your browser')
  .action(openCommand);

export { program };
