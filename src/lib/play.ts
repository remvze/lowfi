import { spawn } from 'child_process';
import chalk from 'chalk';

export function play(title: string, volumeAmount: number, streamUrl: string) {
  return new Promise((resolve, reject) => {
    try {
      console.log('');
      console.log(
        chalk.cyan(
          `[mpv] Streaming ${chalk.bold.white(title)} at ${Math.round(volumeAmount * 100)}% volume`,
        ),
      );
      console.log(chalk.dim('[mpv] Press q to stop playback.\n'));

      const player = spawn(
        'mpv',
        [
          '--no-video',
          '--msg-level=all=status',
          `--volume=${Math.round(volumeAmount * 100)}`,
          '--force-window=no',
          streamUrl,
        ],
        {
          stdio: 'inherit',
        },
      );

      player.on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'ENOENT') {
          reject(
            new Error(
              'mpv is not installed or not in PATH. Install mpv, then run the command again.',
            ),
          );
          return;
        }

        reject(error);
      });

      player.on('exit', code => {
        if (code === 0 || code === null) {
          resolve(true);
          return;
        }

        reject(new Error(`mpv exited with code ${code}`));
      });
    } catch (error) {
      reject(error);
    }
  });
}
