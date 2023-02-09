import AdbIcon from '@mui/icons-material/Adb';
import { Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import { default as React } from 'react';

const useHexStyles = makeStyles(theme => ({
  iconButton: {
    padding: 10,
    [theme.breakpoints.only('sm')]: {
      padding: 4
    },
    [theme.breakpoints.only('xs')]: {
      padding: 2
    }
  }
}));

export type TooltipIconButtonProps = {
  classes?: {
    iconButton?: string;
  };
  title: string;
  icon: React.ReactElement;
  disabled?: boolean;
  size?: 'small' | 'medium';
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

export const WrappedTooltipIconButton = ({
  classes = {
    iconButton: null
  },
  title = '',
  icon = <AdbIcon />,
  disabled = false,
  size = 'small',
  onClick = () => null
}: TooltipIconButtonProps) => {
  const c = useHexStyles();

  return (
    <Tooltip title={title}>
      <span>
        <IconButton
          className={clsx(c.iconButton, classes.iconButton)}
          aria-label={title}
          onClick={onClick}
          size={size}
          disabled={disabled}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export const TooltipIconButton = React.memo(WrappedTooltipIconButton);
export default TooltipIconButton;
