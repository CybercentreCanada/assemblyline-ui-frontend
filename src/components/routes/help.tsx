import useAppUser from 'commons/components/hooks/useAppUser';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useMyLayout from 'components/hooks/useMyLayout';
import { CustomUser } from 'components/hooks/useMyUser';
import LinkGrid from 'components/layout/linkgrid';
import React from 'react';

export default function Help() {
  const layout = useMyLayout();
  const { validateProps } = useAppUser<CustomUser>();
  let items = [];
  for (const item of layout.leftnav.elements) {
    if (item.type === 'group' && item.element.id === 'help') {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      items = item.element['items'].filter(obj => {
        return validateProps(obj.userPropValidators);
      });
    }
  }

  return (
    <PageCenter margin={4} width="100%">
      <LinkGrid items={items} />
    </PageCenter>
  );
}
