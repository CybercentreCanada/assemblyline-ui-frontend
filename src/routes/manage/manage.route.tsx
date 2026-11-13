import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import useALContext from 'core/config/useALContext';
import { createAppRoute } from 'core/router';
import { useAppConfigs } from 'core/template/components/app/hooks';
import PageCenter from 'core/template/components/pages/PageCenter';
import ForbiddenPage from 'routes/forbidden/forbidden.route';
import LinkGrid from 'ui/linkgrid';

export default function Manage() {
  const { preferences: layout } = useAppConfigs();
  const { validateProps } = useALContext();

  const items = [];
  for (const item of layout.leftnav.elements) {
    if (item.type === 'group' && item.element.id === 'manage') {
      for (const i of item.element['items']) {
        if (validateProps(i.userPropValidators)) {
          items.push(i);
        }
      }
    }
  }

  return items.length !== 0 ? (
    <PageCenter margin={4} width="100%">
      <LinkGrid items={items} />
    </PageCenter>
  ) : (
    <ForbiddenPage />
  );
}

export const ManageRoute = createAppRoute({
  component: <Manage />,

  path: '/manage',

  ancestor: null,
  shortname: () => ['app_route.manage.shortname', { ns: 'manageSignatures' }],
  fullname: () => ['app_route.manage.fullname', { ns: 'manageSignatures' }],
  shorticon: () => <BuildOutlinedIcon />,
  fullicon: () => <BuildOutlinedIcon />,

  disabled: () => false,
  forbidden: (_location, config) =>
    !config.user.roles.some(role =>
      [
        'badlist_view',
        'heuristic_view',
        'safelist_view',
        'signature_view',
        'signature_manage',
        'workflow_view'
      ].includes(role)
    )
});
