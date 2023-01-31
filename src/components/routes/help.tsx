import useAppConfigs from 'commons/components/app/hooks/useAppConfigs';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageCenter from 'commons/components/pages/PageCenter';
import { CustomUser } from 'components/hooks/useMyUser';
import LinkGrid from 'components/layout/linkgrid';

export default function Help() {
  const { preferences: layout } = useAppConfigs();
  const { validateProps } = useAppUser<CustomUser>();
  let items = [];
  for (const item of layout.leftnav.elements) {
    if (item.type === 'group' && item.element.id === 'help') {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      items = item.element['items'].filter(obj => validateProps(obj.userPropValidators));
    }
  }

  return (
    <PageCenter margin={4} width="100%">
      <LinkGrid items={items} />
    </PageCenter>
  );
}
