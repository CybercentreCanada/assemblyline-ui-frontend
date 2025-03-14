import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import type { IconButtonProps } from '@mui/material';
import { IconButton, useTheme } from '@mui/material';
import type { FC } from 'react';

export type ResetListInputProps = Omit<IconButtonProps, 'id'> & {
  id: string;
  preventRender: boolean;
  tiny?: boolean;
  onReset: IconButtonProps['onClick'];
};

export const ResetListInput: FC<ResetListInputProps> = ({
  id = null,
  preventRender = false,
  tiny = false,
  onReset,
  ...buttonProps
}) => {
  const theme = useTheme();

  return preventRender ? null : (
    <IconButton
      aria-label={`refresh ${id}`}
      type="reset"
      color="primary"
      children={<RefreshOutlinedIcon fontSize="small" />}
      onClick={event => {
        event.preventDefault();
        event.stopPropagation();
        onReset(event);
      }}
      {...buttonProps}
      sx={{ ...(tiny && { padding: theme.spacing(0.5) }), ...buttonProps?.sx }}
    />
  );
};
