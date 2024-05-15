import figlet from 'figlet';
import gradient from 'gradient-string';

export async function printBanner() {
  return new Promise((resolve, reject) => {
    figlet('Lowfi', { font: 'O8' }, (err, data) => {
      if (err) return reject(err);

      console.log(gradient(['blue', 'purple']).multiline(data));

      resolve(true);
    });
  });
}
