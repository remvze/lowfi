import chalk from 'chalk';

export async function printBanner() {
  console.log('');
  console.log(chalk.bold.cyan('Lowfi'));
  console.log(chalk.dim('SomaFM terminal client'));
  console.log(
    chalk.cyan(
      '--------------------------------------------------------------------',
    ),
  );
}
