import { AppNavigate } from 'core/router';
import { createAppRoute } from 'core/routes';
import { useALContext } from 'deprecated/hooks/useALContext';
import { memo } from 'react';

const SubmissionRedirect = memo(() => {
  const { settings } = useALContext();

  return settings.submission_view === 'details' ? (
    <AppNavigate<'/submission/:id'>
      here={{ update: prev => ({ route: '/submission/detail/:id', path: { id: prev.path.id } }) }}
      navOptions={{ replace: true }}
    />
  ) : (
    <AppNavigate<'/submission/:id'>
      here={{ update: prev => ({ route: '/submission/report/:id', path: { id: prev.path.id } }) }}
      navOptions={{ replace: true }}
    />
  );
});

export const SubmissionRedirectRoute = createAppRoute({
  component: SubmissionRedirect,
  route: '/submission/:id',
  path: s => ({
    id: s.string()
  })
});
