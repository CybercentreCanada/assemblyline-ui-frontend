import AdbIcon from '@mui/icons-material/Adb';
import { SxProps, Tooltip, useTheme } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { default as React } from 'react';

export type TooltipIconButtonProps = {
  title: string;
  icon: React.ReactElement;
  disabled?: boolean;
  size?: 'small' | 'medium';
  slotSX?: {
    iconButton?: SxProps;
  };
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

export const WrappedTooltipIconButton = ({
  title = '',
  icon = <AdbIcon />,
  disabled = false,
  size = 'small',
  slotSX = null,
  onClick = () => null
}: TooltipIconButtonProps) => {
  const theme = useTheme();

  return (
    <Tooltip title={title}>
      <span>
        <IconButton
          aria-label={title}
          onClick={onClick}
          size={size}
          disabled={disabled}
          sx={{
            padding: 10,
            [theme.breakpoints.only('sm')]: {
              padding: 4
            },
            [theme.breakpoints.only('xs')]: {
              padding: 2
            },
            ...slotSX?.iconButton
          }}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export const TooltipIconButton = React.memo(WrappedTooltipIconButton);
export default TooltipIconButton;
