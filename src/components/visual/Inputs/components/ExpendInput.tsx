import { ExpandMore } from '@mui/icons-material';
import type { IconButtonProps } from '@mui/material';
import { IconButton, ListItemIcon, useTheme } from '@mui/material';
import React from 'react';

export type ExpendInputProps = Omit<IconButtonProps, 'id'> & {
  id: string;
  open?: boolean;
  onExpend: IconButtonProps['onClick'];
};

export const ExpendInput: React.FC<ExpendInputProps> = React.memo(
  ({ id = null, open = null, onExpend, ...buttonProps }: ExpendInputProps) => {
    const theme = useTheme();

    return open === null ? null : (
      <ListItemIcon sx={{ minWidth: 0 }}>
        <IconButton
          aria-label={`expend ${id}`}
          type="button"
          onClick={event => {
            event.preventDefault();
            event.stopPropagation();
            onExpend(event);
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
