import type { MouseEvent, ReactElement } from 'react';

export type AppCommand = AppCommandRoute | AppCommandAction;

export type AppCommandBase = {
  id: string | number;
  type: 'route' | 'action';
  icon?: ReactElement;
  primary?: string;
  primaryI18nKey?: string;
  secondary?: string;
  secondaryI18nKey?: string;
  description?: string;
  descriptionI18nKey?: string;
};

export type AppCommandRoute = AppCommandBase & {
  type: 'route';
  route: string;
  matcher?: RegExp;
};

export type AppCommandAction = AppCommandBase & {
  type: 'action';
  onClick: (event: MouseEvent<HTMLElement>) => void;
};
