import input from '@inquirer/input';
import { stream } from '@/lib/stream';
import { printBanner } from '@/lib/banner';

export async function customurl() {
  await printBanner();

  input({ message: 'Enter Youtube URL' }).then(answers => {
    stream(null, answers.toString());
  });
}
