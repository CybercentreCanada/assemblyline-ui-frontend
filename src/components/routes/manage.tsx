import { useAppConfigs } from 'commons/components/app/hooks';
import PageCenter from 'commons/components/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import LinkGrid from 'components/layout/linkgrid';
import ForbiddenPage from 'components/routes/403';

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
