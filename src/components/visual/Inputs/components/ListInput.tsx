import type { ListItemButtonProps, ListItemProps } from '@mui/material';
import { ListItem, ListItemButton } from '@mui/material';
import React from 'react';

export type ListInputProps = {
  button?: boolean;
  children?: React.ReactNode;
  buttonProps?: ListItemButtonProps;
  itemProps?: ListItemProps;
};

export const ListInput: React.FC<ListInputProps> = React.memo(
  ({ button = false, children = null, buttonProps = null, itemProps = null }: ListInputProps) => {
    switch (button) {
      case true:
        return <ListItemButton {...buttonProps}>{children}</ListItemButton>;
      case false:
        return <ListItem {...itemProps}>{children}</ListItem>;
      default:
        return null;
    }
  }
);
