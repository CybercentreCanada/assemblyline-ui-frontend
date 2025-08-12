/* eslint-disable no-console */
import chalk from 'chalk';
import type { BROWSERS } from '../../../playwright.config';

type LogStatus = 'success' | 'info' | 'warning' | 'error' | 'exception';

const STATUS_STYLES: Record<LogStatus, (text: string) => string> = {
  success: chalk.greenBright,
  info: chalk.cyanBright,
  warning: chalk.yellowBright,
  error: chalk.redBright,
  exception: chalk.magentaBright
};

export class Logger {
  private browserLabel: string;
  private browserColor: typeof chalk;
  private titles: string[];

  constructor({ label, color }: (typeof BROWSERS)[number], titles: string[]) {
    this.browserLabel = label;
    this.browserColor = color;
    this.titles = titles;
  }

  log(message: string, status: LogStatus = 'info') {
    const color = STATUS_STYLES[status] || chalk.white;

    const browserCol = this.browserColor(this.browserLabel.padStart(8));
    const statusCol = color(status.toUpperCase().padEnd(10));
    const titlesCol = chalk.gray(this.titles.join(' > '));

    console.log(`${browserCol} | ${statusCol}${titlesCol} :: ${message}`);
  }

  success(msg: string) {
    this.log(msg, 'success');
  }

  info(msg: string) {
    this.log(msg, 'info');
  }

  warning(msg: string) {
    this.log(msg, 'warning');
  }

  error(msg: string) {
    this.log(msg, 'error');
  }

  exception(msg: string) {
    this.log(msg, 'exception');
  }
}
