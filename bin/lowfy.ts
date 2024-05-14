#!/usr/bin/env node

import { program } from '@/index';

program.parse();

if (process.argv.length < 3) {
  program.help();
}
