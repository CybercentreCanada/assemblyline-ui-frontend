import { Command } from 'commander';
import { create } from './commands/create';
import { upgrade } from './commands/upgrade';

// Initialize commander.
const program = new Command();

// Run commander.
program
  .command('create') //
  .description('Create a new @tui v4 application with an interactive wizard')
  .action(create);

program
  .command('upgrade') //
  .description('Run interactive @tui v4 upgrade wizard')
  .action(upgrade);

program.parse(process.argv);
