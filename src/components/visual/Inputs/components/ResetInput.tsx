import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import type { IconButtonProps } from '@mui/material';
import { IconButton, useTheme } from '@mui/material';
import React from 'react';

export type ResetInputProps = Omit<IconButtonProps, 'id'> & {
  id: string;
  preventRender?: boolean;
  tiny?: boolean;
  onReset: IconButtonProps['onClick'];
};

export const ResetInput: React.FC<ResetInputProps> = React.memo(
  ({ id = null, preventRender = false, tiny = false, onReset, ...buttonProps }: ResetInputProps) => {
    const theme = useTheme();

    return preventRender ? null : (
      <IconButton
        aria-label={`refresh ${id}`}
        type="reset"
        color="secondary"
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();
          onReset(event);
        }}
        {...buttonProps}
        sx={{ ...(tiny && { padding: theme.spacing(0.5) }), ...buttonProps?.sx }}
      >
        <RefreshOutlinedIcon fontSize="small" />
      </IconButton>
    );
  }
);
