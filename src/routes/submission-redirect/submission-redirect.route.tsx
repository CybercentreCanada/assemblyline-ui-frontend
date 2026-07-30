import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import { AppNavigate } from 'core/router';
import { createAppRoute } from 'core/routes';
import { useALContext } from 'deprecated/hooks/useALContext';
import { memo } from 'react';

const SubmissionRedirect = memo(() => {
  const { settings } = useALContext();

  return settings.submission_view === 'details' ? (
    <AppNavigate<'/submission/:id'>
      nav={nav =>
        nav
          .here<'/submission/detail/:id'>({ replace: true })
          .update(s => ({ route: '/submission/detail/:id', path: { id: s.path.id } }))
      }
    />
  ) : (
    <AppNavigate<'/submission/:id'>
      nav={nav =>
        nav
          .here<'/submission/report/:id'>({ replace: true })
          .update(s => ({ route: '/submission/report/:id', path: { id: s.path.id } }))
      }
    />
  );
});

export const SubmissionRedirectRoute = createAppRoute({
  title: {
    ns: 'app',
    key: 'breadcrumb.submission.detail'
  },
  icon: {
    primary: <ListAltOutlinedIcon />
  },
  ancestor: '/submissions',
  component: SubmissionRedirect,
  path: '/submission/:id',
  params: s => ({
    id: s.string()
  }),

  forbidden: s => !s.user.roles.includes('submission_view')
});
