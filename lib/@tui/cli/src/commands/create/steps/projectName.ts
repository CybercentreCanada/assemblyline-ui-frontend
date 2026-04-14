import inquirer from 'inquirer';
import type { CreateCommandContext } from '..';

// Ask for application name
export const projectName = async (ctx: CreateCommandContext): Promise<CreateCommandContext> => {
  const { appName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'appName',
      message: 'What is the name of your application?',
      validate: (input: string) => (input.trim() === '' ? 'Application name cannot be empty' : true)
    }
  ]);

  ctx.appName = appName;

  return ctx;
};
