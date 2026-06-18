import { AppNavigate } from 'core/router';
import { createAppRoute, useAppPathParams } from 'core/routes';
import { useALContext } from 'deprecated/hooks/useALContext';
import { memo } from 'react';

const SubmissionRedirect = memo(() => {
  const { settings } = useALContext();
  const { id } = useAppPathParams<'/submission/:id'>();

  return settings.submission_view === 'details' ? (
    <AppNavigate to={{ replaceRoute: { path: `/submission/detail/:id`, params: { id } } }} replace />
  ) : (
    <AppNavigate to={{ replaceRoute: { path: `/submission/report/:id`, params: { id } } }} replace />
  );
});

export const SubmissionRedirectRoute = createAppRoute({
  component: SubmissionRedirect,
  path: '/submission/:id',
  params: s => ({
    id: s.string()
  })
});
