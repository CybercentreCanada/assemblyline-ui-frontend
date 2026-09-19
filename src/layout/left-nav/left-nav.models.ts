import type { InferAppRouteParamFromPath } from 'core/router';

export type AppLeftNavItem<Origin extends AppRoute['path'] = AppRoute['path']> = {
  link?: InferAppRouteParamFromPath<Origin>;
  divider?: boolean;
  items?: AppLeftNavItem[];
};
