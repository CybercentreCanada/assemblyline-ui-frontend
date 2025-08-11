/* eslint-disable no-console */
import chalk from 'chalk';

export function logStep(
  browserLabel: string,
  colorFn: typeof chalk,
  message: string,
  status: 'success' | 'failure' = 'success'
) {
  console.log(
    colorFn(browserLabel.padStart(8)),
    '::',
    status === 'failure' ? chalk.redBright('error').padStart(8) : chalk.greenBright('success').padStart(8),
    '::',
    message
  );
}
