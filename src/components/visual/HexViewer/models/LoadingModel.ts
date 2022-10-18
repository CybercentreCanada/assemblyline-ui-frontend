import { TypesConfig } from '..';

export type LoadingStatus = 'loading' | 'initialized' | 'error';

export type LoadingTypes = LoadingStatus;

export type LoadingState = {
  loading: {
    status: LoadingStatus;
    message: string;
    progress: number;
    conditions: {
      hasAppLoaded: boolean;
      hasSettingsFetched: boolean;
      hasSettingsLoaded: boolean;
      hasLocationInit: boolean;
      hasBodyRefInit: boolean;
      hasBodyItemsRendered: boolean;
      hasResized: boolean;
      hasScrolled: boolean;
    };
    errors: {
      isDataInvalid: boolean;
      isHeightTooSmall: boolean;
      isWidthTooSmall: boolean;
    };
  };
};

export const LOADING_STATE: LoadingState = {
  loading: {
    status: 'loading',
    message: 'loading.initialization',
    progress: 0,
    conditions: {
      hasAppLoaded: false,
      hasSettingsFetched: false,
      hasSettingsLoaded: false,
      hasLocationInit: false,
      hasBodyRefInit: false,
      hasBodyItemsRendered: false,
      hasResized: false,
      hasScrolled: false
    },
    errors: {
      isDataInvalid: false,
      isHeightTooSmall: false,
      isWidthTooSmall: false
    }
  }
};

export const LOADING_TYPES: TypesConfig<LoadingState, LoadingTypes> = {
  loading: {
    status: [
      {
        value: 0,
        type: 'loading',
        label: { en: 'loading', fr: 'chargement' },
        description: { en: 'loading', fr: 'chargement' }
      },
      {
        value: 1,
        type: 'initialized',
        label: { en: 'initialized', fr: 'initialisé' },
        description: { en: 'initialized', fr: 'initialisé' }
      },
      {
        value: 2,
        type: 'error',
        label: { en: 'error', fr: 'erreur' },
        description: { en: 'error', fr: 'erreur' }
      }
    ]
  }
};
