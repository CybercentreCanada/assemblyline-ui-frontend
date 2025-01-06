import type { IconButtonProps, ListItemButtonProps, SwitchProps, TooltipProps, TypographyProps } from '@mui/material';
import { ListItemIcon, ListItemText, Skeleton, Switch } from '@mui/material';
import React from 'react';
import { ListInput } from './components/ListInput';
import type { ResetInputProps } from './components/ResetInput';
import { ResetInput } from './components/ResetInput';
import { TooltipInput } from './components/TooltipInput';

type Props = Omit<SwitchProps, 'onClick'> & {
  disableGap?: boolean;
  label: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  preventRender?: boolean;
  reset?: boolean;
  resetProps?: ResetInputProps;
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
  value: SwitchProps['checked'];
  onChange?: ListItemButtonProps['onClick'];
  onReset?: IconButtonProps['onClick'];
};

export const SwitchInput: React.FC<Props> = React.memo(
  ({
    disabled = false,
    disableGap = false,
    id = null,
    label = null,
    labelProps = null,
    loading = false,
    preventRender = false,
    reset = false,
    resetProps = null,
    tooltip = null,
    tooltipProps = null,
    value = false,
    onChange = () => null,
    onReset = () => null,
    ...switchProps
  }: Props) =>
    preventRender ? null : (
      <TooltipInput tooltip={loading ? null : tooltip} {...tooltipProps}>
        <ListInput
          button={!loading && !disabled}
          buttonProps={{ sx: { padding: 0, columnGap: 1 }, onClick: onChange }}
          itemProps={{ sx: { padding: 0, columnGap: 1 } }}
        >
          <ListItemIcon sx={{ ...(disableGap && { minWidth: 0 }) }}>
            {loading ? (
              <Skeleton variant="circular" sx={{ height: '26px', width: '26px', margin: '6px' }} />
            ) : (
              <ListItemIcon sx={{ ...(disableGap && { minWidth: 0 }) }}>
                <Switch id={id || label} checked={value} size="small" disabled={disabled} {...switchProps} />
              </ListItemIcon>
            )}
          </ListItemIcon>
          <ListItemText
            primary={label}
            primaryTypographyProps={{
              component: 'label',
              htmlFor: id || label,
              variant: 'body2',
              whiteSpace: 'nowrap',
              ...(!loading && !disabled
                ? { sx: { cursor: 'pointer', paddingRight: 1.5, ...labelProps?.sx }, onClick: onChange }
                : null),
              ...labelProps
            }}
          />
          <ResetInput
            id={id || label}
            preventRender={loading || !reset || disabled}
            onReset={onReset}
            {...resetProps}
          />
        </ListInput>
      </TooltipInput>
    )
);
