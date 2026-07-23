import { ErrorFallback } from 'core/error/error.components';
import { createAppRoute } from 'core/routes';

export const CrashRoute = createAppRoute({
  component: ErrorFallback,
  path: '/crash'
});
