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
  component: SubmissionRedirect,

  path: '/submission/:id',
  params: s => ({
    id: s.string()
  }),

  ancestor: '/submissions',
  shortname: location => ({ i18nKey: location?.path?.id ?? 'breadcrumb.submission.detail', ns: 'app' }),
  fullname: () => ({ i18nKey: 'breadcrumb.submission.detail', ns: 'app' }),
  shorticon: () => <ListAltOutlinedIcon />,
  fullicon: () => <ListAltOutlinedIcon />,

  disabled: () => false,
  forbidden: (_location, config) => !config.user.roles.includes('submission_view')
});
