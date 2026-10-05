import { useAppConfigs, useAppUser } from 'deprecated/legacy/commons/components/app/hooks';
import PageCenter from 'deprecated/legacy/commons/components/pages/PageCenter';
import LinkGrid from 'deprecated/legacy/components/layout/linkgrid';
import type { CustomUser } from 'models/api/user';

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
