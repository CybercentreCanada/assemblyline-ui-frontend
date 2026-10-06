import { useAppConfigs, useAppUser } from 'core/template/components/app/hooks';
import PageCenter from 'core/template/components/pages/PageCenter';
import type { CustomUser } from 'models/api/user';
import LinkGrid from 'ui/linkgrid';

export default function Help() {
  const { preferences: layout } = useAppConfigs();
  const { validateProps } = useAppUser<CustomUser>();
  let items = [];
  for (const item of layout.leftnav.elements) {
    if (item.type === 'group' && item.element.id === 'help') {
      items = item.element['items'].filter(obj => validateProps(obj.userPropValidators));
    }
  }

  return (
    <PageCenter margin={4} width="100%">
      <LinkGrid items={items} />
    </PageCenter>
  );
}
