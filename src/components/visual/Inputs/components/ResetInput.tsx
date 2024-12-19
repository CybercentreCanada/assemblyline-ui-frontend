import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import type { IconButtonProps } from '@mui/material';
import { IconButton } from '@mui/material';
import React from 'react';

export type ResetInputProps = IconButtonProps & {
  label: string;
  preventRender: boolean;
  onReset: IconButtonProps['onClick'];
};

export const ResetInput: React.FC<ResetInputProps> = React.memo(
  ({ label, preventRender = false, onReset, ...buttonProps }: ResetInputProps) =>
    preventRender ? null : (
      <IconButton
        aria-label={`refresh ${label}`}
        type="reset"
        color="secondary"
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();
          onReset(event);
        }}
        {...buttonProps}
      >
        <RefreshOutlinedIcon fontSize="small" />
      </IconButton>
    )
);
