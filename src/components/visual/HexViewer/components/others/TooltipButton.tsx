import { Tooltip } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import { default as React } from 'react';
import { useStyles } from '../..';

export type TooltipButtonProps = {
  title: string;
  icon: React.ReactElement;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

export const WrappedTooltipButton = ({ title = '', icon = null, onClick = () => null }: TooltipButtonProps) => {
  const { toolbarClasses } = useStyles();

  return (
    <Tooltip title={title}>
      <IconButton className={toolbarClasses.iconButton} aria-label={title} onClick={onClick} size="small">
        {icon}
      </IconButton>
    </Tooltip>
  );
};

export const TooltipButton = React.memo(WrappedTooltipButton);
export default TooltipButton;
