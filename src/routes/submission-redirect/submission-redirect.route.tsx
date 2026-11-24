import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import useALContext from 'core/config/useALContext';
import { createAppRoute } from 'core/router';
import { memo } from 'react';
import { Navigate, useParams } from 'react-router';

type ParamProps = {
  id: string;
};

export const SubmissionRedirectPage = memo(() => {
  const { id } = useParams<ParamProps>();

  const { settings } = useALContext();

  return settings.submission_view === 'details' ? (
    <Navigate to={`/submission/detail/${id}`} replace />
  ) : (
    <Navigate to={`/submission/report/${id}`} replace />
  );
});

export const SubmissionRedirectRoute = createAppRoute({
  component: SubmissionRedirectPage,

  path: '/submission/:id',
  params: s => ({
    id: s.string('')
  }),

  ancestor: '/submissions',
  shortname: location => ['app_route.submission_redirect.shortname', { ns: 'submissionDetail', id: location.path.id }],
  fullname: location => ['app_route.submission_redirect.fullname', { ns: 'submissionDetail', id: location.path.id }],
  shorticon: () => <ListAltOutlinedIcon />,
  fullicon: () => <ListAltOutlinedIcon />,

  disabled: () => false,
  forbidden: (_location, config) => !config.user.roles.includes('submission_view')
});
