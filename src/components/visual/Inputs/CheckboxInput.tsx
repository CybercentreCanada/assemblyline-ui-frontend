import type { CheckboxProps, IconButtonProps, ListItemButtonProps, TooltipProps, TypographyProps } from '@mui/material';
import { Checkbox, ListItem, ListItemButton, ListItemIcon, ListItemText, Skeleton, Typography } from '@mui/material';
import React from 'react';
import type { ExpendInputProps } from './components/ExpendInput';
import { ExpendInput } from './components/ExpendInput';
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
    preventRender ? null : loading ? (
      <ListItem sx={{ padding: 0, columnGap: 1 }}>
        <ListItemIcon sx={{ ...(disableGap && { minWidth: 0 }) }}>
          <Skeleton variant="circular" sx={{ height: '26px', width: '26px', margin: '6px' }} />
        </ListItemIcon>
        <ListItemText
          primary={
            <TooltipInput tooltip={tooltip} {...tooltipProps}>
              <Typography
                component="label"
                htmlFor={id || label}
                variant="body2"
                whiteSpace="nowrap"
                onClick={onChange}
                {...labelProps}
                children={label}
              />
            </TooltipInput>
          }
        />
      </ListItem>
    ) : (
      <ListItemButton disabled={disabled} role={undefined} sx={{ padding: 0, columnGap: 1 }} onClick={onChange}>
        <ListItemIcon sx={{ ...(disableGap && { minWidth: 0 }) }}>
          <Checkbox id={id || label} checked={value} size="small" disabled={disabled} {...checkboxProps} />
        </ListItemIcon>
        <ListItemText
          primary={
            <TooltipInput tooltip={tooltip} {...tooltipProps}>
              <Typography
                component="label"
                htmlFor={id || label}
                variant="body2"
                whiteSpace="nowrap"
                sx={{ cursor: 'pointer', ...labelProps?.sx }}
                onClick={onChange}
                {...labelProps}
                children={label}
              />
            </TooltipInput>
          }
        />
        <ResetInput id={id || label} preventRender={!reset || disabled} onReset={onReset} {...resetProps} />
        <ExpendInput id={id || label} open={expend} onExpend={onExpend} {...expendProps} />
      </ListItemButton>
    )
);
