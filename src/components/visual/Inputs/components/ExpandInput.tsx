import { ExpandMore } from '@mui/icons-material';
import type { IconButtonProps } from '@mui/material';
import { IconButton, ListItemIcon, useTheme } from '@mui/material';
import React from 'react';

export type ExpandInputProps = Omit<IconButtonProps, 'id'> & {
  id: string;
  open?: boolean;
  onExpand: IconButtonProps['onClick'];
};

export const ExpandInput: React.FC<ExpandInputProps> = React.memo(
  ({ id = null, open = null, onExpand, ...buttonProps }: ExpandInputProps) => {
    const theme = useTheme();

    return open === null ? null : (
      <ListItemIcon sx={{ minWidth: 0 }}>
        <IconButton
          aria-label={`expand ${id}`}
          type="button"
          onClick={event => {
            event.preventDefault();
            event.stopPropagation();
            onExpand(event);
          }}
          {...buttonProps}
        >
          <ExpandMore
            fontSize="small"
            sx={{
              transition: theme.transitions.create('transform', {
                duration: theme.transitions.duration.shortest
              }),
              transform: 'rotate(0deg)',
              ...(open && { transform: 'rotate(180deg)' })
            }}
          />
        </IconButton>
      </ListItemIcon>
    );
  }
);
