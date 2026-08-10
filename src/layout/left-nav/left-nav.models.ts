import type { InferAppRouteParamFromPath } from 'core/routes';

export type AppLeftNavItem<Origin extends AppRoute['path'] = AppRoute['path']> = {
  link?: InferAppRouteParamFromPath<Origin>;
  divider?: boolean;
  items?: AppLeftNavItem[];
};
