import useAppConfigs from 'commons/components/app/hooks/useAppConfigs';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageCenter from 'commons/components/pages/PageCenter';
import { CustomUser } from 'components/hooks/useMyUser';
import LinkGrid from 'components/layout/linkgrid';
import { Navigate } from 'react-router';

export default function Admin() {
  const { preferences: layout } = useAppConfigs();
  const { user: currentUser, validateProps } = useAppUser<CustomUser>();
  let items = [];
  for (const item of layout.leftnav.elements) {
    if (item.type === 'group' && item.element.id === 'adminmenu') {
      // eslint-disable-next-line @typescript-eslint/dot-notation
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
