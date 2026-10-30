import type { AppRouterPage } from 'core/router';

/** Diagnostics payload used by the not-found page UI. */
export type NotFoundDiagnostics = {
  attemptedHref?: string;
  attemptedInput?: unknown;
  attemptedPage?: Partial<AppRouterPage>;
  operation?: string;
  originPageKey?: string;
  pageKey?: string;
  panelKey?: number | string;
  targetPanelKey?: number | string;
};

export type NotFoundDetailLabels = {
  attemptedHref: string;
  operation: string;
  originPageKey: string;
  pageAge: string;
  pageDigest: string;
  pageHref: string;
  pageKey: string;
  pageScroll: string;
  pageState: string;
  pageTransient: string;
  panelKey: string;
  targetPanelKey: string;
};

export type NotFoundDetailItem = {
  label: string;
  value: string;
  pre?: boolean;
};
