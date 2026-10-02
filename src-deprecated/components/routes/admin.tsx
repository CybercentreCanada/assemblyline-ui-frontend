import { useAppConfigs, useAppUser } from 'commons/components/app/hooks';
import PageCenter from 'commons/components/pages/PageCenter';
import LinkGrid from 'components/layout/linkgrid';
import type { CustomUser } from 'components/models/ui/user';
import { Navigate } from 'react-router';

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
