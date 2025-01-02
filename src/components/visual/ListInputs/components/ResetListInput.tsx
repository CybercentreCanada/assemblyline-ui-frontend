import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import type { IconButtonProps } from '@mui/material';
import { IconButton } from '@mui/material';
import { type FC } from 'react';

export type ResetListInputProps = Omit<IconButtonProps, 'id'> & {
  id: string;
  preventRender: boolean;
  onReset: IconButtonProps['onClick'];
};

export const ResetListInput: FC<ResetListInputProps> = ({
  id = null,
  preventRender = false,
  onReset,
  ...buttonProps
}) => (
  <div style={{ ...(preventRender && { opacity: 0 }) }}>
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
    />
  </div>
);
