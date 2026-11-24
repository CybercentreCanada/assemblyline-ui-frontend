import { CrashRoute } from 'core/error/error.route';
import { useMemo } from 'react';
import { DisabledRoute, ForbiddenRoute } from 'routes/forbidden/forbidden.route';
import { MissingNodeRoute } from 'routes/missing-node/missing-node.route';
import { NotFoundRoute } from 'routes/not-found/not-found.route';

const APP_ROUTES = [CrashRoute, DisabledRoute, ForbiddenRoute, MissingNodeRoute, NotFoundRoute] as const;

declare global {
  type AppRoutes = typeof APP_ROUTES;
  type AppRoute = AppRoutes[number];
}

export const useAppRoutes = () => useMemo(() => APP_ROUTES, []);
