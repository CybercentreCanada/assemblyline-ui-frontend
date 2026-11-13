import { createAppRoute } from 'core/router';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import RedirectSubmission from 'core/template/components/utils/RedirectSubmission';

export const SubmissionRedirectRoute = createAppRoute({
  component: <RedirectSubmission />,

  path: '/submission/:id',
  params: s => ({
    id: s.string()
  }),

  ancestor: '/submissions',
  shortname: location => ['app_route.submission_redirect.shortname', { ns: 'submissionDetail', id: location.path.id }],
  fullname: location => ['app_route.submission_redirect.fullname', { ns: 'submissionDetail', id: location.path.id }],
  shorticon: () => <ListAltOutlinedIcon />,
  fullicon: () => <ListAltOutlinedIcon />,

  disabled: () => false,
  forbidden: (_location, config) => !config.user.roles.includes('submission_view')
});
