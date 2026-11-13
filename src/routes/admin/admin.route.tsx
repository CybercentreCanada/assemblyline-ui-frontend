import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import { createAppRoute } from 'core/router';
import { useAppConfigs, useAppUser } from 'core/template/components/app/hooks';
import PageCenter from 'core/template/components/pages/PageCenter';
import type { CustomUser } from 'models/api/user';
import { Navigate } from 'react-router';
import LinkGrid from 'ui/linkgrid';

export default function Admin() {
  const { preferences: layout } = useAppConfigs();
  const { user: currentUser, validateProps } = useAppUser<CustomUser>();
  const items = [];
  for (const item of layout.leftnav.elements) {
    if (item.type === 'group' && item.element.id === 'adminmenu') {
      for (const i of item.element['items']) {
        if (validateProps(i.userPropValidators)) {
          items.push(i);
        }
      }
    }
  }

  return currentUser.is_admin || items.length !== 0 ? (
    <PageCenter margin={4} width="100%">
      <LinkGrid items={layout.topnav.adminMenu.length !== 0 ? layout.topnav.adminMenu : items} />
    </PageCenter>
  ) : (
    <Navigate to="/forbidden" replace />
  );
}

export const AdminRoute = createAppRoute({
  component: <Admin />,

  path: '/admin',

  ancestor: null,
  shortname: () => ['app_route.admin.shortname', { ns: 'adminActions' }],
  fullname: () => ['app_route.admin.fullname', { ns: 'adminActions' }],
  shorticon: () => <BusinessOutlinedIcon />,
  fullicon: () => <BusinessOutlinedIcon />,

  disabled: () => false,
  forbidden: (_location, config) => !config.user.is_admin
});
