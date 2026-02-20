import { Page2 } from 'pages/Page2';
import { SubmissionsRoute } from 'pages/Submissions';

export type Routes =
  | { path: '/search'; params?: never; search: { query: string; offset: number; rows: number }; hash?: never }
  | { path: '/detail/:id'; params: { id: string }; search?: never; hash?: never }
  | { path: '/viewer/:id'; params: { id: string }; search?: never; hash: string };

export const test: Routes = {
  path: '/detail/:id',
  params: { id: 'asd' }
  // search: { query: 'a', offset: 0, rows: 20 }
};

export const APP_ROUTES = [Page2, SubmissionsRoute] as const;

export type AppRoutes = typeof APP_ROUTES;
