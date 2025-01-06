import type { CheckboxProps, IconButtonProps, ListItemButtonProps, TooltipProps, TypographyProps } from '@mui/material';
import { Checkbox, ListItemIcon, ListItemText, Skeleton, Typography } from '@mui/material';
import React from 'react';
import type { ExpendInputProps } from './components/ExpendInput';
import { ExpendInput } from './components/ExpendInput';
import { ListInput } from './components/ListInput';
import type { ResetInputProps } from './components/ResetInput';
import { ResetInput } from './components/ResetInput';
import { TooltipInput } from './components/TooltipInput';

type Props = Omit<CheckboxProps, 'onClick'> & {
  disableGap?: boolean;
  expend?: boolean;
  expendProps?: ExpendInputProps;
  label: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  preventRender?: boolean;
  reset?: boolean;
  resetProps?: ResetInputProps;
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
  value: CheckboxProps['checked'];
  onExpend?: IconButtonProps['onClick'];
  onChange?: ListItemButtonProps['onClick'];
  onReset?: IconButtonProps['onClick'];
};

export const CheckboxInput: React.FC<Props> = React.memo(
  ({
    disabled = false,
    disableGap = false,
    expend = null,
    expendProps = null,
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
    onExpend = () => null,
    onChange = () => null,
    onReset = () => null,
    ...checkboxProps
  }: Props) =>
    preventRender ? null : (
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
              <Checkbox id={id || label} checked={value} size="small" disabled={disabled} {...checkboxProps} />
            </ListItemIcon>
          )}
        </ListItemIcon>
        <ListItemText
          primary={
            <TooltipInput tooltip={tooltip} {...tooltipProps}>
              <Typography
                component="label"
                htmlFor={id || label}
                variant="body2"
                whiteSpace="nowrap"
                {...(!loading && !disabled
                  ? { sx: { cursor: 'pointer', paddingRight: 1.5, ...labelProps?.sx }, onClick: onChange }
                  : null)}
                {...labelProps}
                children={label}
              />
            </TooltipInput>
          }
        />
        <ResetInput id={id || label} preventRender={loading || !reset || disabled} onReset={onReset} {...resetProps} />
        <ExpendInput id={id || label} open={expend} onExpend={onExpend} {...expendProps} />
      </ListInput>
    )
);
