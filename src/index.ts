import { Command } from 'commander';

import { play } from './commands/play';

import pkg from '../package.json';

const program = new Command();

program
  .name('lowfi')
  .description('A CLI tool to play lofi music')
  .version(pkg.version);

program.command('play').description('Play a lofi radio').action(play);

export { program };
