type LegacyResolution = {
  /** New href for panel 1 (drawer), if present. */
  1?: string;
  /** New href for panel 0 (main). */
  0: string;
};

type LegacyRouteTemplate = {
  /** Hash template without the leading `#`. */
  hash?: string;
  /** Pathname template. */
  pathname: string;
};

type LegacyRule = {
  /** Legacy location templates to match. */
  from: LegacyRouteTemplate;
  /** New panel href templates to produce. */
  to: LegacyResolution;
};

const LEGACY_RULES: LegacyRule[] = [
  { from: { pathname: '/' }, to: { 0: '/' } },
  { from: { pathname: '/account' }, to: { 0: '/account' } },
  { from: { pathname: '/admin' }, to: { 0: '/admin' } },
  { from: { pathname: '/admin/actions' }, to: { 0: '/admin/actions' } },

  {
    from: { pathname: '/admin/apikeys', hash: ':id' },
    to: { 0: '/admin/apikeys', 1: '/admin/apikeys/:id' }
  },
  { from: { pathname: '/admin/apikeys' }, to: { 0: '/admin/apikeys' } },
  { from: { pathname: '/admin/apikeys/:id' }, to: { 0: '/admin/apikeys/:id' } },

  {
    from: { pathname: '/admin/errors', hash: ':key' },
    to: { 0: '/admin/errors', 1: '/admin/errors/:key' }
  },
  { from: { pathname: '/admin/errors' }, to: { 0: '/admin/errors' } },
  { from: { pathname: '/admin/errors/:key' }, to: { 0: '/admin/errors/:key' } },

  { from: { pathname: '/admin/identify' }, to: { 0: '/admin/identify' } },
  { from: { pathname: '/admin/service_review' }, to: { 0: '/admin/service_review' } },

  {
    from: { pathname: '/admin/services', hash: ':svc' },
    to: { 0: '/admin/services', 1: '/admin/services/:svc' }
  },
  { from: { pathname: '/admin/services' }, to: { 0: '/admin/services' } },
  { from: { pathname: '/admin/services/:svc' }, to: { 0: '/admin/services/:svc' } },

  { from: { pathname: '/admin/sitemap' }, to: { 0: '/admin/sitemap' } },
  { from: { pathname: '/admin/tag_safelist' }, to: { 0: '/admin/tag_safelist' } },

  {
    from: { pathname: '/admin/users', hash: ':id' },
    to: { 0: '/admin/users', 1: '/admin/users/:id' }
  },
  { from: { pathname: '/admin/users' }, to: { 0: '/admin/users' } },
  { from: { pathname: '/admin/users/:id' }, to: { 0: '/admin/users/:id' } },

  { from: { pathname: '/alerts_redirect' }, to: { 0: '/alerts-redirect' } },
  {
    from: { pathname: '/alerts', hash: '/alert/:id' },
    to: { 0: '/alerts', 1: '/alert/:id' }
  },
  {
    from: { pathname: '/alerts', hash: '/workflow' },
    to: { 0: '/alerts', 1: '/manage/workflow/create' }
  },
  { from: { pathname: '/alerts' }, to: { 0: '/alerts' } },
  { from: { pathname: '/alerts/:id' }, to: { 0: '/alert/:id' } },

  {
    from: { pathname: '/archive', hash: ':id' },
    to: { 0: '/archives', 1: '/archive/:id' }
  },
  { from: { pathname: '/archive' }, to: { 0: '/archives' } },
  { from: { pathname: '/archive/:id' }, to: { 0: '/archive/:id' } },
  { from: { pathname: '/archive/:id/:tab' }, to: { 0: '/archive/:id/:tab' } },

  { from: { pathname: '/authorize' }, to: { 0: '/authorize' } },
  { from: { pathname: '/crash' }, to: { 0: '/crash' } },
  { from: { pathname: '/dashboard' }, to: { 0: '/dashboard' } },
  { from: { pathname: '/development/api' }, to: { 0: '/development/api' } },
  { from: { pathname: '/development/customize' }, to: { 0: '/development/customize' } },
  { from: { pathname: '/development/library' }, to: { 0: '/development/library' } },
  { from: { pathname: '/development/theme' }, to: { 0: '/development/theme' } },
  { from: { pathname: '/file/detail/:id' }, to: { 0: '/file/detail/:id' } },
  { from: { pathname: '/file/viewer/:id' }, to: { 0: '/file/viewer/:id' } },
  { from: { pathname: '/file/viewer/:id/:tab' }, to: { 0: '/file/viewer/:id/:tab' } },
  { from: { pathname: '/forbidden' }, to: { 0: '/forbidden' } },
  { from: { pathname: '/help' }, to: { 0: '/help' } },
  { from: { pathname: '/help/api' }, to: { 0: '/help/api' } },
  { from: { pathname: '/help/classification' }, to: { 0: '/help/classification' } },
  { from: { pathname: '/help/configuration' }, to: { 0: '/help/configuration' } },
  { from: { pathname: '/help/search' }, to: { 0: '/help/search' } },
  { from: { pathname: '/help/services' }, to: { 0: '/help/services' } },
  { from: { pathname: '/logout' }, to: { 0: '/logout' } },
  { from: { pathname: '/manage' }, to: { 0: '/manage' } },

  {
    from: { pathname: '/manage/badlist', hash: 'new' },
    to: { 0: '/manage/badlists', 1: '/manage/badlist/add' }
  },
  {
    from: { pathname: '/manage/badlist', hash: ':id' },
    to: { 0: '/manage/badlists', 1: '/manage/badlist/detail/:id' }
  },
  { from: { pathname: '/manage/badlist' }, to: { 0: '/manage/badlists' } },
  { from: { pathname: '/manage/badlist/:id' }, to: { 0: '/manage/badlist/detail/:id' } },

  { from: { pathname: '/manage/heuristic/:id' }, to: { 0: '/manage/heuristic/detail/:id' } },
  {
    from: { pathname: '/manage/heuristics', hash: ':id' },
    to: { 0: '/manage/heuristics', 1: '/manage/heuristic/detail/:id' }
  },
  { from: { pathname: '/manage/heuristics' }, to: { 0: '/manage/heuristics' } },

  {
    from: { pathname: '/manage/safelist', hash: 'new' },
    to: { 0: '/manage/safelists', 1: '/manage/safelist/add' }
  },
  {
    from: { pathname: '/manage/safelist', hash: ':id' },
    to: { 0: '/manage/safelists', 1: '/manage/safelist/detail/:id' }
  },
  { from: { pathname: '/manage/safelist' }, to: { 0: '/manage/safelists' } },
  { from: { pathname: '/manage/safelist/:id' }, to: { 0: '/manage/safelist/detail/:id' } },

  { from: { pathname: '/manage/signature/:id' }, to: { 0: '/manage/signature/detail/:id' } },
  {
    from: { pathname: '/manage/signature/:type/:source/:name' },
    to: { 0: '/manage/signature/detail/:type/:source/:name' }
  },
  {
    from: { pathname: '/manage/signatures', hash: ':id' },
    to: { 0: '/manage/signatures', 1: '/manage/signature/detail/:id' }
  },
  { from: { pathname: '/manage/signatures' }, to: { 0: '/manage/signatures' } },
  { from: { pathname: '/manage/sources' }, to: { 0: '/manage/sources' } },

  { from: { pathname: '/manage/workflow/create/:id' }, to: { 0: '/manage/workflow/create/:id' } },
  { from: { pathname: '/manage/workflow/detail/:id' }, to: { 0: '/manage/workflow/detail/:id' } },
  {
    from: { pathname: '/manage/workflows', hash: '/detail/:id' },
    to: { 0: '/manage/workflows', 1: '/manage/workflow/detail/:id' }
  },
  {
    from: { pathname: '/manage/workflows', hash: '/create' },
    to: { 0: '/manage/workflows', 1: '/manage/workflow/create' }
  },
  {
    from: { pathname: '/manage/workflows', hash: '/create/:id' },
    to: { 0: '/manage/workflows', 1: '/manage/workflow/create/:id' }
  },
  { from: { pathname: '/manage/workflows' }, to: { 0: '/manage/workflows' } },

  { from: { pathname: '/notfound' }, to: { 0: '/not-found' } },
  {
    from: { pathname: '/retrohunt', hash: ':key' },
    to: { 0: '/retrohunt', 1: '/retrohunt/detail/:key' }
  },
  { from: { pathname: '/retrohunt' }, to: { 0: '/retrohunt' } },
  { from: { pathname: '/retrohunt/:key' }, to: { 0: '/retrohunt/detail/:key' } },
  { from: { pathname: '/search' }, to: { 0: '/search' } },
  { from: { pathname: '/search/:id' }, to: { 0: '/search/:id' } },
  { from: { pathname: '/settings' }, to: { 0: '/settings' } },
  { from: { pathname: '/settings/:tab' }, to: { 0: '/settings/:tab' } },
  { from: { pathname: '/submission/:id' }, to: { 0: '/submission/:id' } },
  { from: { pathname: '/submission/detail/:id' }, to: { 0: '/submission/detail/:id' } },
  {
    from: { pathname: '/submission/detail/:id/:fid' },
    to: { 0: '/submission/detail/:id', 1: '/file/detail/:fid' }
  },
  { from: { pathname: '/submission/report/:id' }, to: { 0: '/submission/report/:id' } },
  { from: { pathname: '/submissions' }, to: { 0: '/submissions' } },
  { from: { pathname: '/submit' }, to: { 0: '/submit' } },
  { from: { pathname: '/tos' }, to: { 0: '/tos' } }
];

const appendSearch = (href: string, search: string): string => `${href}${search || ''}`;

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const matchTemplate = (template: string, value: string): Record<string, string> | null => {
  const normalizedTemplate = template === '/' ? '/' : template.replace(/\/+$/, '');
  const source = escapeRegExp(normalizedTemplate).replace(/:([A-Za-z][A-Za-z0-9_]*)/g, '(?<$1>[^/?#]+)');
  const pattern = new RegExp(normalizedTemplate === '/' ? '^/?$' : `^${source}/?$`);
  const match = pattern.exec(value);

  return match ? (match.groups ?? {}) : null;
};

const interpolateTemplate = (template: string, params: Record<string, string>): string =>
  template.replace(/:([A-Za-z][A-Za-z0-9_]*)/g, (_, key: string) => params[key] ?? `:${key}`);

/**
 * Maps an old location to new panel hrefs. Search parameters remain on panel 0;
 * query strings embedded in the old hash remain on panel 1.
 */
export const resolveLegacyLocation = (pathname: string, search: string, hash: string): LegacyResolution | null => {
  const hashValue = hash.startsWith('#') ? hash.slice(1) : hash;
  const hashQueryIndex = hashValue.indexOf('?');
  const hashPath = hashQueryIndex < 0 ? hashValue : hashValue.slice(0, hashQueryIndex);
  const hashSearch = hashQueryIndex < 0 ? '' : hashValue.slice(hashQueryIndex);

  for (const rule of LEGACY_RULES) {
    const pathParams = matchTemplate(rule.from.pathname, pathname);
    if (!pathParams) continue;

    const hashParams = rule.from.hash ? matchTemplate(rule.from.hash, hashPath) : {};
    if (!hashParams) continue;

    const params = { ...pathParams, ...hashParams };
    const main = appendSearch(interpolateTemplate(rule.to[0], params), search);
    const drawer = !rule.to[1] ? undefined : appendSearch(interpolateTemplate(rule.to[1], params), hashSearch);

    return { 0: main, ...(drawer ? { 1: drawer } : {}) };
  }

  return null;
};
