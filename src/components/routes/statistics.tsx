import useAppConfigs from 'commons/components/app/hooks/useAppConfigs';
import PageCenter from 'commons/components/pages/PageCenter';
import LinkGrid from 'components/layout/linkgrid';

export default function Statistics() {
  const { preferences: layout } = useAppConfigs();
  let items = [];
  for (const item of layout.leftnav.elements) {
    if (item.type === 'group' && item.element.id === 'stats') {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      items = item.element['items'];
    }
  }

  return (
    <PageCenter margin={4} width="100%">
      <LinkGrid items={items} />
    </PageCenter>
  );
}
