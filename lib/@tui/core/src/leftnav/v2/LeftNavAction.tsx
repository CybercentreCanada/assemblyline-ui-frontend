import { Button } from '@mui/material';
import { useCallback, type FC, type SyntheticEvent } from 'react';
import type { LeftNavActionProps, LeftNavChildRenderProps } from '.';
import { useAppLeftNav } from '../../app';
import { LeftNavItem } from './LeftNavItem';

export const LeftNavAction: FC<
  LeftNavActionProps & LeftNavChildRenderProps & { disableCollapse?: boolean }
> = props => {
  const { open: navopen, collapseMenus } = useAppLeftNav();

  const onClick = useCallback(
    (event: SyntheticEvent<HTMLElement>) => {
      props.action(event, props);
      if (!navopen && !props.disableCollapse) {
        collapseMenus();
      }
    },
    [collapseMenus, navopen, props]
  );

  return (
    <Button
      fullWidth
      onClick={onClick}
      variant="outlined"
      color="inherit"
      sx={{
        border: 'none',
        p: 0,
        textTransform: 'none',
        borderRadius: 0,
        '&:hover': {
          bgcolor: 'inherit'
        }
      }}
    >
      <LeftNavItem {...props} />
    </Button>
  );
};
