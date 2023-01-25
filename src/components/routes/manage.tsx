import PageCenter from 'commons/components/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import useMyLayout from 'components/hooks/useMyLayout';
import LinkGrid from 'components/layout/linkgrid';
import ForbiddenPage from './403';

export default function Manage() {
  const layout = useMyLayout();
  const { validateProps } = useALContext();

  let items = [];
  for (const item of layout.leftnav.elements) {
    if (item.type === 'group' && item.element.id === 'manage') {
      // eslint-disable-next-line @typescript-eslint/dot-notation
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
