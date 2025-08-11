/* eslint-disable no-console */
import chalk from 'chalk';

export function logStep(
  browserLabel: string,
  colorFn: typeof chalk,
  message: string,
  status: 'success' | 'failure' = 'success'
) {
  console.log(
    colorFn(browserLabel),
    '::',
    status === 'failure' ? chalk.redBright('error') : chalk.greenBright('success'),
    '::',
    message
  );
}
