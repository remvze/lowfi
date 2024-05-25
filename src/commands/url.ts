import input from '@inquirer/input';
import { stream } from '@/lib/stream';
import ora from 'ora';
import { printBanner } from '@/lib/banner';

export async function customurl() {
  await printBanner();

  input({ message: 'Enter Youtube URL' }).then(answers => {
    const spinner = ora('Opening the url').start();
    stream('Custom URL', answers.toString()).then(() => spinner.succeed());
  });
}
