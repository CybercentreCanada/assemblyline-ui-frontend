import type { AppNavigationStore, AppRouterPage, AppRouterPanel } from 'core/router';
import type { Location as ReactRouterLocation } from 'react-router';

//*****************************************************************************************
// Location State
//*****************************************************************************************

/** Full router store shape. Source of truth for runtime panel and route graph state. */
export type AppLocationState = {
  /** Store revision id for sync checks. */
  id: string;
  /** Panel configurations. */
  panels: AppRouterPanel[];
  /** Page entries keyed by unique ID. */
  pages: Record<string, Pick<AppRouterPage, 'href' | 'state' | 'scroll'>>;
};

export type AppLocation = ReactRouterLocation<AppLocationState>;

export type AppRouterState = Pick<AppNavigationStore, 'id' | 'panels' | 'pages'>;

export type PageKeyOf<Store extends AppLocationState> = Extract<keyof Store['pages'], string>;
