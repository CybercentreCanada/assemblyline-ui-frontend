import useUser from 'commons/components/hooks/useAppUser';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useMyLayout from 'components/hooks/useMyLayout';
import { CustomUser } from 'components/hooks/useMyUser';
import LinkGrid from 'components/layout/linkgrid';
import { Redirect } from 'react-router-dom';

export default function Admin() {
  const layout = useMyLayout();
  const { user: currentUser } = useUser<CustomUser>();
  let items = [];
  for (const item of layout.leftnav.elements) {
    if (item.type === 'group' && item.element.id === 'adminmenu') {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      items = item.element['items'];
    }
  }

  return currentUser.is_admin ? (
    <PageCenter margin={4} width="100%">
      <LinkGrid items={layout.topnav.adminMenu.length !== 0 ? layout.topnav.adminMenu : items} />
    </PageCenter>
  ) : (
    <Redirect to="/forbidden" />
  );
}
