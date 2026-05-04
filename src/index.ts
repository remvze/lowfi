import { Command } from 'commander';

import { play } from './commands/play';
import { list } from './commands/list';

import pkg from '../package.json';

const program = new Command();

program
  .name('lowfi')
  .description('A beautiful, user-friendly SomaFM terminal client')
  .version(pkg.version);

program
  .command('play')
  .description('Play a SomaFM station')
  .argument('[id]', 'Station id (for example: groovesalad)')
  .option('-q, --quality <level>', 'Stream quality: highest, high, slow')
  .option('-v, --volume <number>', 'Set the volume', '0.5')
  .action(play);

program
  .command('list')
  .description('List all available SomaFM stations')
  .action(list);

export { program };
