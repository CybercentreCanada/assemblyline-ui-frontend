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

export const isNotFoundRouterPage = function (page: Partial<AppRouterPage> = null): boolean {
  if (!page) return false;
  if (page.digest === 'not-found') return true;

  const transient = page.transient as { __notFound?: boolean } | null;
  return transient?.__notFound === true;
};

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
