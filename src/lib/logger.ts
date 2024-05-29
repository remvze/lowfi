import logSymbols from 'log-symbols';

export function info(message: string) {
  console.log(logSymbols.info, message);
}

export function error(message: string) {
  console.error(logSymbols.error, message);
}
