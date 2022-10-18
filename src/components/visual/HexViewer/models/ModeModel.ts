import { TypesConfig } from '..';

export type ModeTheme = 'light' | 'dark';
export type ModeLanguage = 'en' | 'fr';
export type ModeWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'wd';
export type ModeLayout = 'page' | 'fullscreen';
export type ModeToolbar = 'desktop' | 'mobile';
export type ModeBody = 'window' | 'table';

export type ModeTypes = ModeTheme | ModeLanguage | ModeWidth | ModeLayout | ModeToolbar | ModeBody;

export type ModeState = {
  mode: {
    theme: ModeTheme;
    language: ModeLanguage;
    width: ModeWidth;
    layout: ModeLayout;
    toolbar: ModeToolbar;
    body: ModeBody;
  };
};

export const MODE_STATE: ModeState = {
  mode: {
    theme: 'light',
    language: 'en',
    width: 'md',
    layout: 'page',
    toolbar: 'desktop',
    body: 'window'
  }
};

export const MODE_TYPES: TypesConfig<ModeState, ModeTypes> = {
  mode: {
    theme: [
      {
        value: 0,
        type: 'light',
        label: { en: 'light', fr: 'light' },
        description: { en: 'light', fr: 'light' }
      },
      {
        value: 1,
        type: 'dark',
        label: { en: 'dark', fr: 'dark' },
        description: { en: 'dark', fr: 'dark' }
      }
    ],
    language: [
      {
        value: 0,
        type: 'en',
        label: { en: 'en', fr: 'en' },
        description: { en: 'en', fr: 'en' }
      },
      {
        value: 1,
        type: 'fr',
        label: { en: 'fr', fr: 'fr' },
        description: { en: 'fr', fr: 'fr' }
      }
    ],
    width: [
      {
        value: 0,
        type: 'xs',
        label: { en: 'xs', fr: 'xs' },
        description: { en: 'xs', fr: 'xs' }
      },
      {
        value: 1,
        type: 'sm',
        label: { en: 'sm', fr: 'sm' },
        description: { en: 'sm', fr: 'sm' }
      },
      {
        value: 2,
        type: 'md',
        label: { en: 'md', fr: 'md' },
        description: { en: 'md', fr: 'md' }
      },
      {
        value: 3,
        type: 'lg',
        label: { en: 'lg', fr: 'lg' },
        description: { en: 'lg', fr: 'lg' }
      },
      {
        value: 4,
        type: 'xl',
        label: { en: 'xl', fr: 'xl' },
        description: { en: 'xl', fr: 'xl' }
      },
      {
        value: 5,
        type: 'wd',
        label: { en: 'wd', fr: 'wd' },
        description: { en: 'wd', fr: 'wd' }
      }
    ],
    layout: [
      {
        value: 0,
        type: 'page',
        label: { en: 'page', fr: 'page' },
        description: { en: 'page', fr: 'page' }
      },
      {
        value: 1,
        type: 'fullscreen',
        label: { en: 'fullscreen', fr: 'fullscreen' },
        description: { en: 'fullscreen', fr: 'fullscreen' }
      }
    ],
    toolbar: [
      {
        value: 0,
        type: 'desktop',
        label: { en: 'desktop', fr: 'desktop' },
        description: { en: 'desktop', fr: 'desktop' }
      },
      {
        value: 1,
        type: 'mobile',
        label: { en: 'mobile', fr: 'mobile' },
        description: { en: 'mobile', fr: 'mobile' }
      }
    ],
    body: [
      {
        value: 0,
        type: 'window',
        label: { en: 'window', fr: 'window' },
        description: { en: 'window', fr: 'window' }
      },
      {
        value: 1,
        type: 'table',
        label: { en: 'table', fr: 'table' },
        description: { en: 'table', fr: 'table' }
      }
    ]
  }
};
