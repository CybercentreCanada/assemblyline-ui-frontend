import type { InferAppNavigationPropsFromPath } from 'core/router';

/** A single topnav quick search result. */
export type QuickSearchItem = {
  /** Unique key for the result within the list. */
  id: string | number;
  /** Display label shown in the dropdown/dialog. */
  label: string;
  /** Navigation handler invoked on selection. */
  nav: InferAppNavigationPropsFromPath<AppRoute['path']>['nav'];
};

/** Display mode for the quick search UI. */
export type QuickSearchMode = 'inline' | 'fullscreen';
