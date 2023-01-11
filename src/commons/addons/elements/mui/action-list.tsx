import { Button, ButtonProps, IconButton, IconButtonProps, Tooltip, useTheme } from '@mui/material';
import { Skeleton } from '@mui/material';
import FlexHorizontal from 'commons/addons/elements/layout/flexers/FlexHorizontal';
import FlexVertical from 'commons/addons/elements/layout/flexers/FlexVertical';
import React from 'react';

export interface ButtonAction {
  key?: string;
  title?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary';
  action?: () => void;
  btnProps?: ButtonProps | IconButtonProps;
  tooltip?: string;
}

const ActionList: React.FC<{
  orientation: 'horizontal' | 'vertical';
  loading: boolean;
  actions: ButtonAction[];
}> = ({ orientation, loading = false, actions }) => {
  const theme = useTheme();

  const renderButtons = (_actions: ButtonAction[]) => {
    return _actions.map((a, i) => {
      const button = a.title ? (
        <Button
          style={{ marginRight: theme.spacing(1) }}
          key={a.key ? a.key : `ph-action-${i}`}
          color={a.color}
          onClick={a.action}
          startIcon={a.icon}
          {...(a.btnProps as ButtonProps)}
        >
          {a.title}
        </Button>
      ) : (
        <IconButton
          key={a.key ? a.key : `ph-action-${i}`}
          color={a.color}
          onClick={a.action}
          {...(a.btnProps as IconButtonProps)}
          size="large">
          {a.icon}
        </IconButton>
      );

      return a.tooltip ? (
        <Tooltip key={a.key ? a.key : `ph-action-${i}`} title={a.tooltip}>
          <span>{button}</span>
        </Tooltip>
      ) : (
        button
      );
    });
  };

  const renderSkeletons = (_actions: ButtonAction[]) => {
    return _actions.map((a, i) => (
      <div key={a.key ? a.key : `ph-action-${i}`} style={{ marginLeft: theme.spacing(1) }}>
        <Skeleton width={36} height={48} variant="text" animation="wave" />
      </div>
    ));
  };

  const elements = loading ? renderSkeletons(actions) : renderButtons(actions);

  if (orientation === 'vertical') {
    return <FlexVertical>{elements}</FlexVertical>;
  }
  return <FlexHorizontal>{elements}</FlexHorizontal>;
};
export default ActionList;
