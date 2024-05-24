import open from 'open';
import inquirer from 'inquirer';
import chalk from 'chalk';

export function donate() {
  console.log(`${chalk.green('[•ᴗ•]')} Hello There!`);

  console.log('Enjoyed Lowfi? Please consider buying me a coffee!');
  console.log('Link: https://buymeacoffee.com/remvze');

  inquirer
    .prompt([
      {
        message: 'Open the link in your browser?',
        name: 'open',
        type: 'confirm',
      },
    ])
    .then(answers => {
      if (answers.open) open('https://buymeacoffee.com/remvze');
    });
}
