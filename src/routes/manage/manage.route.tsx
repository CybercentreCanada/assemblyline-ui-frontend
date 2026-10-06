import useALContext from 'core/config/useALContext';
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
