import { Button, ButtonProps, IconButton, IconButtonProps, useTheme } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import FlexHorizontal from 'commons/addons/elements/layout/flexers/FlexHorizontal';
import FlexVertical from 'commons/addons/elements/layout/flexers/FlexVertical';
import React from 'react';

export interface ButtonAction {
  key?: string;
  title?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary';
  action?: () => void;
  btnProp?: ButtonProps | IconButtonProps;
}

export default function ActionList({
  orientation,
  loading = false,
  actions
}: {
  orientation: 'horizontal' | 'vertical';
  loading: boolean;
  actions: ButtonAction[];
}) {
  const theme = useTheme();

  const renderButtons = _actions => {
    return _actions.map((a, i) =>
      a.title ? (
        <Button
          style={{ marginRight: theme.spacing(1) }}
          key={a.key ? a.key : `ph-action-${i}`}
          color={a.color}
          onClick={a.action}
          startIcon={a.icon}
          {...(a.btnProp as ButtonProps)}
        >
          {a.title}
        </Button>
      ) : (
        <IconButton
          key={a.key ? a.key : `ph-action-${i}`}
          color={a.color}
          onClick={a.action}
          {...(a.btnProp as IconButtonProps)}
        >
          {a.icon}
        </IconButton>
      )
    );
  };

  const renderSkeletons = _actions => {
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
}
