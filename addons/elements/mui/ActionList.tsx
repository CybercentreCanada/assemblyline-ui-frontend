import { Button, ButtonProps, IconButton, IconButtonProps, Skeleton, Tooltip, useTheme } from '@mui/material';
import FlexHorizontal from 'commons/addons/elements/layout/flexers/FlexHorizontal';
import FlexVertical from 'commons/addons/elements/layout/flexers/FlexVertical';
import { memo, useCallback } from 'react';

export interface ButtonAction {
  key?: string;
  title?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary';
  action?: () => void;
  btnProps?: ButtonProps | IconButtonProps;
  tooltip?: string;
}

interface ButtonActionProps {
  orientation: 'horizontal' | 'vertical';
  loading: boolean;
  actions: ButtonAction[];
}

const ActionList = ({ orientation, loading = false, actions }: ButtonActionProps) => {
  const theme = useTheme();

  const renderButtons = useCallback(
    (_actions: ButtonAction[]) =>
      actions.map((a, i) => {
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
            size="large"
          >
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
      }),
    [actions, theme]
  );

  const renderSkeletons = useCallback(
    (_actions: ButtonAction[]) =>
      _actions.map((a, i) => (
        <div key={a.key ? a.key : `ph-action-${i}`} style={{ marginLeft: theme.spacing(1) }}>
          <Skeleton width={36} height={48} variant="text" animation="wave" />
        </div>
      )),
    [theme]
  );

  const renderer = loading ? renderSkeletons : renderButtons;

  if (orientation === 'vertical') {
    return <FlexVertical>{renderer(actions)}</FlexVertical>;
  }
  return <FlexHorizontal alignItems="center">{renderer(actions)}</FlexHorizontal>;
};
export default memo(ActionList);
