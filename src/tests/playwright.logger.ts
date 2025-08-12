/* eslint-disable no-console */
import chalk from 'chalk';
import type { BROWSERS } from '../../playwright.config';

type LogStatus = 'success' | 'info' | 'warning' | 'error' | 'exception';

const STATUS_STYLES: Record<LogStatus, (text: string) => string> = {
  success: chalk.greenBright,
  info: chalk.cyanBright,
  warning: chalk.yellowBright,
  error: chalk.redBright,
  exception: chalk.magentaBright
};

function padMiddle(str: string, targetLength: number, padChar: string = ' '): string {
  if (str.length >= targetLength) return str;

  const totalPadding = targetLength - str.length;
  const leftPadding = Math.floor(totalPadding / 2);
  const rightPadding = totalPadding - leftPadding;

  return padChar.repeat(leftPadding) + str + padChar.repeat(rightPadding);
}

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

    const parts = [
      this.browserColor(padMiddle(this.browserLabel, 8)),
      color(padMiddle(status, 10)),
      ...this.titles.map(t => chalk.white(t)),
      message
    ];

    console.log(parts.join(' :: '));
  }

  success(message: string) {
    this.log(message, 'success');
  }

  info(message: string) {
    this.log(message, 'info');
  }

  warning(message: string) {
    this.log(message, 'warning');
  }

  error(message: string) {
    this.log(message, 'error');
  }

  exception(message: string) {
    this.log(message, 'exception');
  }
}
