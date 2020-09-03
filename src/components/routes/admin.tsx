import useMyLayout from 'components/hooks/useMyLayout';
import LinkGrid from 'components/layout/linkgrid';
import React from 'react';

export default function Admin() {
  const layout = useMyLayout();

  return <LinkGrid items={layout.topnav.adminMenu} />;
}
