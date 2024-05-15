import { Command } from 'commander';

import { play } from './commands/play';
import { donate } from './commands/donate';

import pkg from '../package.json';

const program = new Command();

program
  .name('lowfi')
  .description('A CLI tool to play lofi music')
  .version(pkg.version);

program.command('play').description('Play a lofi radio').action(play);

program
  .command('donate')
  .description('Donate to the creator of Lowfi')
  .action(donate);

export { program };