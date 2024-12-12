import RefreshIcon from '@mui/icons-material/Refresh';
import type { IconButtonProps } from '@mui/material';
import { IconButton } from '@mui/material';
import { type FC } from 'react';

export interface ResetListInputProps extends IconButtonProps {
  visible?: boolean;
}

export const ResetListInput: FC<ResetListInputProps> = ({ visible = false, onClick = () => null, ...other }) => (
  <div style={{ ...(!visible && { opacity: 0 }) }}>
    <IconButton
      type="reset"
      color="primary"
      children={<RefreshIcon fontSize="small" />}
      onClick={event => {
        event.preventDefault();
        event.stopPropagation();
        onClick(event);
      }}
      {...other}
    />
  </div>
);
