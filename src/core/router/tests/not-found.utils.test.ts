import {
  formatNotFoundDiagnosticValue,
  getNotFoundDetails,
  getNotFoundPreviewHref,
  getNotFoundRouterPage,
  isNotFoundRouterPage,
  resolveNotFoundPage
} from 'core/router';
import { makePage } from 'core/router/tests/test-defaults';
import { describe, expect, it } from 'vitest';

describe('isNotFoundRouterPage', () => {
  it('returns true when the digest is "not-found"', () => {
    expect(isNotFoundRouterPage({ digest: 'not-found' })).toBe(true);
  });

  it('returns true when transient.__notFound is true', () => {
    expect(isNotFoundRouterPage({ digest: 'x', transient: { __notFound: true } })).toBe(true);
  });

  it('returns false for a regular page', () => {
    expect(isNotFoundRouterPage(makePage('/r1'))).toBe(false);
  });

  it('returns false for a null page', () => {
    expect(isNotFoundRouterPage(null)).toBe(false);
  });
});

describe('getNotFoundRouterPage', () => {
  it('returns a page with the not-found digest and default href', () => {
    const page = getNotFoundRouterPage();
    expect(page.digest).toBe('not-found');
    expect(page.href).toBe('/not-found');
    expect((page.transient as { __notFound: boolean }).__notFound).toBe(true);
  });

  it('applies the provided href', () => {
    const page = getNotFoundRouterPage({}, '/custom');
    expect(page.href).toBe('/custom');
  });

  it('spreads the provided values into transient.values', () => {
    const page = getNotFoundRouterPage({ foo: 'bar' });
    expect((page.transient as { values: Record<string, unknown> }).values).toEqual({ foo: 'bar' });
  });
});

describe('resolveNotFoundPage', () => {
  it('returns the page unchanged when it already has an href', () => {
    const page = makePage('/r1');
    expect(resolveNotFoundPage(page, '/attempted', {})).toBe(page);
  });

  it('builds a not-found page with attempted diagnostics when href is missing', () => {
    const page = { digest: null, href: null } as never;
    const result = resolveNotFoundPage(page, '/attempted', { operation: 'navigate' });
    const values = (result.transient as { values: { attemptedHref: string; operation: string } }).values;
    expect(result.digest).toBe('not-found');
    expect(values.attemptedHref).toBe('/attempted');
    expect(values.operation).toBe('navigate');
  });

  it('extracts attemptedHref from a location-like input', () => {
    const page = { digest: null, href: null } as never;
    const result = resolveNotFoundPage(page, { pathname: '/foo', search: '?a=1', hash: '' }, {});
    const values = (result.transient as { values: { attemptedHref: string } }).values;
    expect(values.attemptedHref).toBe('/foo?a=1');
  });
});

describe('formatNotFoundDiagnosticValue', () => {
  it('returns null for null/undefined values', () => {
    expect(formatNotFoundDiagnosticValue(null, 'n/a')).toBeNull();
    expect(formatNotFoundDiagnosticValue(undefined, 'n/a')).toBeNull();
  });

  it('returns strings as-is', () => {
    expect(formatNotFoundDiagnosticValue('hello', 'n/a')).toBe('hello');
  });

  it('stringifies numbers and booleans', () => {
    expect(formatNotFoundDiagnosticValue(42, 'n/a')).toBe('42');
    expect(formatNotFoundDiagnosticValue(true, 'n/a')).toBe('true');
  });

  it('JSON-stringifies objects', () => {
    expect(formatNotFoundDiagnosticValue({ a: 1 }, 'n/a')).toBe(JSON.stringify({ a: 1 }, null, 2));
  });

  it('falls back to the unserializable value placeholder on circular structures', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(formatNotFoundDiagnosticValue(circular, 'unserializable')).toBe('unserializable');
  });
});

describe('getNotFoundPreviewHref', () => {
  it('returns null when diagnostics is null', () => {
    expect(getNotFoundPreviewHref(null)).toBeNull();
  });

  it('prefers diagnostics.attemptedHref when present', () => {
    expect(getNotFoundPreviewHref({ attemptedHref: '/a' })).toBe('/a');
  });

  it('falls back to attemptedPage.href', () => {
    expect(getNotFoundPreviewHref({ attemptedPage: { href: '/b' } })).toBe('/b');
  });

  it('falls back to a string attemptedInput', () => {
    expect(getNotFoundPreviewHref({ attemptedInput: '/c' })).toBe('/c');
  });

  it('falls back to a location-like attemptedInput', () => {
    expect(getNotFoundPreviewHref({ attemptedInput: { pathname: '/d', search: '?x=1' } })).toBe('/d?x=1');
  });

  it('returns null when nothing usable is found', () => {
    expect(getNotFoundPreviewHref({})).toBeNull();
  });
});

describe('getNotFoundDetails', () => {
  const labels = {
    attemptedHref: 'Attempted href',
    operation: 'Operation',
    originPageKey: 'Origin page key',
    pageAge: 'Page age',
    pageDigest: 'Page digest',
    pageHref: 'Page href',
    pageKey: 'Page key',
    pageScroll: 'Page scroll',
    pageState: 'Page state',
    pageTransient: 'Page transient',
    panelKey: 'Panel key',
    targetPanelKey: 'Target panel key'
  };

  it('returns an empty array when diagnostics is null', () => {
    expect(getNotFoundDetails(null, labels, 'n/a')).toEqual([]);
  });

  it('includes only fields with defined values', () => {
    const details = getNotFoundDetails({ operation: 'navigate', attemptedHref: '/x' }, labels, 'n/a');
    expect(details).toEqual([
      { label: 'Operation', value: 'navigate', pre: false },
      { label: 'Attempted href', value: '/x', pre: false }
    ]);
  });

  it('marks page state/transient entries as preformatted', () => {
    const details = getNotFoundDetails({ attemptedPage: { state: { a: 1 } } }, labels, 'n/a');
    expect(details).toContainEqual({ label: 'Page state', value: JSON.stringify({ a: 1 }, null, 2), pre: true });
  });
});
