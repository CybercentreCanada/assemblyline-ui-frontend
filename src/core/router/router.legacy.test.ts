import { resolveLegacyLocation } from 'core/router/router.legacy';
import { describe, expect, it } from 'vitest';

//*****************************************************************************************
// resolveLegacyLocation
//*****************************************************************************************
describe('resolveLegacyLocation', () => {
  it.each<[string, string, string | undefined]>([
    ['/', '/', undefined],
    ['/account', '/account', undefined],
    ['/alerts_redirect', '/alerts-redirect', undefined],
    ['/archive', '/archives', undefined],
    ['/notfound', '/not-found', undefined],
    ['/manage/badlist', '/manage/badlists', undefined],
    ['/manage/safelist', '/manage/safelists', undefined]
  ])('maps %s to the current route grammar', (pathname, main, drawer) => {
    expect(resolveLegacyLocation(pathname, '', '')).toEqual({ 0: main, ...(drawer ? { 1: drawer } : {}) });
  });

  it.each<[string, string]>([
    ['/admin/apikeys/abc', '/admin/apikeys/abc'],
    ['/admin/errors/error-1', '/admin/errors/error-1'],
    ['/alerts/alert-1', '/alert/alert-1'],
    ['/manage/badlist/item-1', '/manage/badlist/detail/item-1'],
    ['/manage/heuristic/heur-1', '/manage/heuristic/detail/heur-1'],
    ['/manage/safelist/item-1', '/manage/safelist/detail/item-1'],
    ['/manage/signature/sig-1', '/manage/signature/detail/sig-1'],
    ['/retrohunt/hunt-1', '/retrohunt/detail/hunt-1']
  ])('maps dynamic path %s to %s', (pathname, main) => {
    expect(resolveLegacyLocation(pathname, '', '')).toEqual({ 0: main });
  });

  it.each<[string, string, string, string]>([
    ['/admin/apikeys', '#key-1', '/admin/apikeys', '/admin/apikeys/key-1'],
    ['/admin/errors', '#error-1', '/admin/errors', '/admin/errors/error-1'],
    ['/admin/services', '#service-1', '/admin/services', '/admin/services/service-1'],
    ['/admin/users', '#user-1', '/admin/users', '/admin/users/user-1'],
    ['/alerts', '#/alert/alert-1', '/alerts', '/alert/alert-1'],
    ['/archive', '#archive-1', '/archives', '/archive/archive-1'],
    ['/manage/heuristics', '#heur-1', '/manage/heuristics', '/manage/heuristic/detail/heur-1'],
    ['/manage/signatures', '#sig-1', '/manage/signatures', '/manage/signature/detail/sig-1'],
    ['/retrohunt', '#hunt-1', '/retrohunt', '/retrohunt/detail/hunt-1']
  ])('maps %s%s to main and drawer panels', (pathname, hash, main, drawer) => {
    expect(resolveLegacyLocation(pathname, '', hash)).toEqual({ 0: main, 1: drawer });
  });

  it.each<[string, string, string, string]>([
    ['/manage/badlist', '#new', '/manage/badlists', '/manage/badlist/add'],
    ['/manage/safelist', '#new', '/manage/safelists', '/manage/safelist/add'],
    ['/alerts', '#/workflow/', '/alerts', '/manage/workflow/create'],
    ['/manage/workflows', '#/create/', '/manage/workflows', '/manage/workflow/create'],
    ['/manage/workflows', '#/create/workflow-1', '/manage/workflows', '/manage/workflow/create/workflow-1'],
    ['/manage/workflows', '#/detail/workflow-1', '/manage/workflows', '/manage/workflow/detail/workflow-1']
  ])('maps special drawer location %s%s', (pathname, hash, main, drawer) => {
    expect(resolveLegacyLocation(pathname, '', hash)).toEqual({ 0: main, 1: drawer });
  });

  it('maps the legacy submission file path to submission and file panels', () => {
    expect(resolveLegacyLocation('/submission/detail/sub-1/file-1', '', '')).toEqual({
      0: '/submission/detail/sub-1',
      1: '/file/detail/file-1'
    });
  });

  it('preserves the pathname search on the main panel', () => {
    expect(resolveLegacyLocation('/search/alerts', '?q=test&offset=25', '')).toEqual({
      0: '/search/alerts?q=test&offset=25'
    });
  });

  it('preserves a hash query on the drawer panel', () => {
    expect(resolveLegacyLocation('/alerts', '?q=main', '#/alert/alert-1?tab=related')).toEqual({
      0: '/alerts?q=main',
      1: '/alert/alert-1?tab=related'
    });
  });

  it('accepts trailing slashes without adding them to resolved hrefs', () => {
    expect(resolveLegacyLocation('/file/viewer/file-1/image/', '?q=test', '')).toEqual({
      0: '/file/viewer/file-1/image?q=test'
    });
    expect(resolveLegacyLocation('/manage/workflows/', '', '#/detail/workflow-1/')).toEqual({
      0: '/manage/workflows',
      1: '/manage/workflow/detail/workflow-1'
    });
  });

  it('returns null for an unknown legacy pathname', () => {
    expect(resolveLegacyLocation('/unknown', '', '')).toBeNull();
  });
});
