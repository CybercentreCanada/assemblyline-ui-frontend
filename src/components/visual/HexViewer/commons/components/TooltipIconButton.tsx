import { makeStyles, Tooltip } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import AdbIcon from '@material-ui/icons/Adb';
import clsx from 'clsx';
import { default as React } from 'react';

const useHexStyles = makeStyles(theme => ({
  iconButton: {
    padding: 10,
    [theme.breakpoints.down('sm')]: {
      padding: 4
    },
    [theme.breakpoints.down('xs')]: {
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
