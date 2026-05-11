import type { AppBreadcrumbItem, AppRouterAdapter } from '@tui/core';
import type { AppBreadcrumbRoute } from 'app/layout.breadcrumbs';
import { useAppBreadcrumbs } from 'app/layout.breadcrumbs';
import { useCallback, useMemo } from 'react';
import { Link, matchPath, useLocation, useNavigate } from 'react-router';

export const useAppTemplateRouter = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const breadcrumbRoutes = useAppBreadcrumbs();

  const _matchPath = useCallback((pattern: { path: string; end?: boolean }, pathname: string) => {
    return Boolean(matchPath(pattern, pathname));
  }, []);

  const getSpecificityScore = useCallback((path: string): number => {
    const segments = path.split('/').filter(Boolean);
    const staticSegments = segments.filter(segment => !segment.startsWith(':')).length;
    return staticSegments * 100 + segments.length;
  }, []);

  const findByPattern = useCallback(
    (pathname: string): AppBreadcrumbRoute | undefined => {
      const matches = breadcrumbRoutes
        .filter(route => Boolean(matchPath({ path: route.path, end: true }, pathname)))
        .sort((a, b) => getSpecificityScore(b.path) - getSpecificityScore(a.path));

      return matches[0];
    },
    [breadcrumbRoutes, getSpecificityScore]
  );

  const resolveParams = useCallback((routePath: string, pathname: string): Record<string, string> => {
    const matched = matchPath({ path: routePath, end: true }, pathname);
    return (matched?.params as Record<string, string | undefined>)
      ? Object.fromEntries(Object.entries(matched?.params || {}).map(([key, value]) => [key, value ?? '']))
      : {};
  }, []);

  const resolvePathWithParams = useCallback(
    (routePath: string, pathname: string): string => {
      const params = resolveParams(routePath, pathname);

      return routePath.replace(/:([A-Za-z0-9_]+)/g, (_, key: string) => params[key] || `:${key}`);
    },
    [resolveParams]
  );

  const resolveTitle = useCallback((title: string | undefined, params: Record<string, string>): string | undefined => {
    if (!title) return title;

    return title.replace(/\{:\s*([A-Za-z0-9_]+)\s*\}/g, (_, key: string) => params[key] || `{:${key}}`);
  }, []);

  const toAppBreadcrumbItem = useCallback(
    (route: AppBreadcrumbRoute, pathname: string): AppBreadcrumbItem => {
      const params = resolveParams(route.path, pathname);
      const resolvedPath = resolvePathWithParams(route.path, pathname);

      return {
        route: resolvedPath,
        path: route.path,
        title: resolveTitle(route.title, params),
        i18nKey: route.i18nKey,
        icon: route.icon,
        width: route.width,
        missing: route.missing,
        text: route.text,
        includeRoot: route.includeRoot
      };
    },
    [resolveParams, resolvePathWithParams, resolveTitle]
  );

  const _breadcrumbs = useCallback(
    (routerLocation = location): AppBreadcrumbItem[] => {
      const pathname = routerLocation.pathname;
      const current = findByPattern(pathname);

      if (!current) return [];

      const linkedPaths = current.breadcrumbs || [];

      const parentRoutes = linkedPaths
        .map(path => breadcrumbRoutes.find(route => route.path === path))
        .filter((route): route is AppBreadcrumbRoute => Boolean(route));

      const chain = [...parentRoutes, current];
      return chain.map(route => toAppBreadcrumbItem(route, pathname));
    },
    [location, findByPattern, breadcrumbRoutes, toAppBreadcrumbItem]
  );

  return useMemo<AppRouterAdapter>(
    (): AppRouterAdapter => ({
      Link,
      location,
      navigate,
      matchPath: _matchPath,
      breadcrumbs: _breadcrumbs
    }),
    [location, navigate, _breadcrumbs, _matchPath]
  );
};
