import { Command } from 'commander';

import pkg from '../package.json';

const program = new Command();

program
  .name('lowfy')
  .description('A CLI tool to play lofi music')
  .version(pkg.version);

program
  .command('foo')
  .description('Mock')
  .action(() => console.log('bar'));

export { program };
