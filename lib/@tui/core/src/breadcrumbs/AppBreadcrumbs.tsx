import { Breadcrumbs } from '@mui/material';

import type { FC } from 'react';
import { useAppBreadcrumbs } from '../app';
import { AppBreadcrumb } from './AppBreadcrumb';

export const AppBreadcrumbs: FC = () => {
  const { items } = useAppBreadcrumbs();
  return (
    <Breadcrumbs
      id="breadcrumbs"
      sx={{
        color: 'inherit',
        '& li': {
          display: 'flex'
        },
        '& li:first-of-type': {
          flex: 1
        }
      }}
    >
      {items && items.map(item => <AppBreadcrumb key={item.path} {...item} />)}
    </Breadcrumbs>
  );
};
