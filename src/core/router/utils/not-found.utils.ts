import type { AppRouterPage, NotFoundDetailItem, NotFoundDetailLabels } from 'core/router';

//*****************************************************************************************
// Not Found Page
//*****************************************************************************************

const getAttemptedHrefFromInput = (input: unknown): AppRouterPage['href'] => {
  if (typeof input === 'string') {
    const next = input.trim();
    return next ? next : null;
  }

  if (!input || typeof input !== 'object') return null;

  if ('pathname' in input) {
    const locationLike = input as { pathname?: unknown; search?: unknown; hash?: unknown };
    if (typeof locationLike.pathname !== 'string' || !locationLike.pathname) return null;

    const search = typeof locationLike.search === 'string' ? locationLike.search : '';
    const hash = typeof locationLike.hash === 'string' ? locationLike.hash : '';
    return `${locationLike.pathname}${search}${hash}`;
  }

  if ('route' in input) {
    const routeLike = input as { route?: unknown };
    return typeof routeLike.route === 'string' && routeLike.route ? routeLike.route : null;
  }

  if ('href' in input) {
    const hrefLike = input as { href?: unknown };
    return typeof hrefLike.href === 'string' && hrefLike.href ? hrefLike.href : null;
  }

  return null;
};

/**
 * @name isNotFoundRouterPage
 * @description Checks whether a page is marked as a not-found page.
 * @param page - Page to inspect.
 * @returns True when the page carries the not-found marker.
 */
export const isNotFoundRouterPage = function (page: Partial<AppRouterPage> = null): boolean {
  if (!page) return false;
  if (page.digest === 'not-found') return true;

  const transient = page.transient as { __notFound?: boolean } | null;
  return transient?.__notFound === true;
};

/**
 * @name getNotFoundRouterPage
 * @description Creates a router page containing not-found diagnostics.
 * @param values - Diagnostic values to store on the page.
 * @param href - Href associated with the failed navigation.
 * @returns A marked not-found router page.
 */
export const getNotFoundRouterPage = function (
  values: object = null,
  href: AppRouterPage['href'] = '/not-found'
): AppRouterPage {
  return {
    age: 0,
    digest: 'not-found',
    href,
    scroll: null,
    state: null,
    transient: {
      __notFound: true,
      values: { ...values }
    }
  };
};

/**
 * @name resolveNotFoundPage
 * @description Replaces an empty page with a diagnostic not-found page.
 * @param page - Candidate page to validate.
 * @param attemptedInput - Input that produced the candidate page.
 * @param context - Navigation context to include in diagnostics.
 * @returns The original page when valid, otherwise a diagnostic page.
 */
export const resolveNotFoundPage = (
  page: AppRouterPage,
  attemptedInput: unknown,
  context: Record<string, unknown>
): AppRouterPage => {
  if (page?.href) return page;

  const attemptedHref = getAttemptedHrefFromInput(attemptedInput);
  return getNotFoundRouterPage(
    {
      ...context,
      attemptedHref,
      attemptedInput,
      attemptedPage: {
        age: page?.age ?? null,
        digest: page?.digest ?? null,
        href: page?.href ?? null,
        scroll: page?.scroll ?? null,
        state: page?.state ?? null,
        transient: page?.transient ?? null
      }
    },
    attemptedHref
  );
};

const getAttemptedPageFromDiagnostics = (
  diagnostics: Record<string, unknown> | null
): Record<string, unknown> | null => {
  if (!diagnostics?.attemptedPage || typeof diagnostics.attemptedPage !== 'object') return null;
  return diagnostics.attemptedPage as Record<string, unknown>;
};

/**
 * @name formatNotFoundDiagnosticValue
 * @description Converts a diagnostic value into displayable text.
 * @param value - Value to format.
 * @param unserializableValue - Fallback text for values that cannot be serialized.
 * @returns Formatted diagnostic text, or null for empty values.
 */
export const formatNotFoundDiagnosticValue = (value: unknown, unserializableValue: string): string | null => {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return unserializableValue;
  }
};

/**
 * @name getNotFoundPreviewHref
 * @description Extracts the most useful attempted href from not-found diagnostics.
 * @param diagnostics - Diagnostic payload to inspect.
 * @returns Attempted href, or null when unavailable.
 */
export const getNotFoundPreviewHref = (diagnostics: Record<string, unknown> | null): AppRouterPage['href'] => {
  if (!diagnostics) return null;

  const attemptedHref = diagnostics.attemptedHref;
  if (typeof attemptedHref === 'string' && attemptedHref) return attemptedHref;

  const attemptedPage = getAttemptedPageFromDiagnostics(diagnostics);
  if (attemptedPage) {
    const attemptedPageHref = attemptedPage.href;
    if (typeof attemptedPageHref === 'string' && attemptedPageHref) return attemptedPageHref;
  }

  const attemptedInput = diagnostics.attemptedInput;
  if (typeof attemptedInput === 'string' && attemptedInput) return attemptedInput;
  if (attemptedInput && typeof attemptedInput === 'object') {
    const input = attemptedInput as { href?: unknown; pathname?: unknown; search?: unknown; hash?: unknown };

    if (typeof input.href === 'string' && input.href) return input.href;
    if (typeof input.pathname === 'string' && input.pathname) {
      const searchValue = typeof input.search === 'string' ? input.search : '';
      const hashValue = typeof input.hash === 'string' ? input.hash : '';
      return `${input.pathname}${searchValue}${hashValue}`;
    }
  }

  return null;
};

/**
 * @name getNotFoundDetails
 * @description Builds labeled display entries from not-found diagnostics.
 * @param diagnostics - Diagnostic payload to inspect.
 * @param labels - Labels for each diagnostic field.
 * @param unserializableValue - Fallback text for values that cannot be serialized.
 * @returns Display-ready diagnostic detail items.
 */
export const getNotFoundDetails = (
  diagnostics: Record<string, unknown> | null,
  labels: NotFoundDetailLabels,
  unserializableValue: string
): NotFoundDetailItem[] => {
  if (!diagnostics) return [];

  const items: NotFoundDetailItem[] = [];
  const attemptedPage = getAttemptedPageFromDiagnostics(diagnostics);

  const pushItem = (label: string, value: unknown, pre: boolean = false) => {
    const formatted = formatNotFoundDiagnosticValue(value, unserializableValue);
    if (!formatted) return;
    items.push({ label, value: formatted, pre });
  };

  pushItem(labels.operation, diagnostics.operation);
  pushItem(labels.targetPanelKey, diagnostics.targetPanelKey);
  pushItem(labels.panelKey, diagnostics.panelKey);
  pushItem(labels.originPageKey, diagnostics.originPageKey);
  pushItem(labels.pageKey, diagnostics.pageKey);
  pushItem(labels.attemptedHref, diagnostics.attemptedHref);
  pushItem(labels.pageDigest, attemptedPage?.digest);
  pushItem(labels.pageHref, attemptedPage?.href);
  pushItem(labels.pageAge, attemptedPage?.age);
  pushItem(labels.pageScroll, attemptedPage?.scroll);
  pushItem(labels.pageState, attemptedPage?.state, true);
  pushItem(labels.pageTransient, attemptedPage?.transient, true);

  return items;
};
