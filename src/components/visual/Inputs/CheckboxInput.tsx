import type { CheckboxProps, IconButtonProps, ListItemButtonProps, TooltipProps, TypographyProps } from '@mui/material';
import { Checkbox, ListItemButton, ListItemIcon, ListItemText, Skeleton, Typography } from '@mui/material';
import React from 'react';
import type { ResetInputProps } from './components/ResetInput';
import { ResetInput } from './components/ResetInput';
import { TooltipInput } from './components/TooltipInput';

type Props = Omit<CheckboxProps, 'onClick'> & {
  label: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  preventRender?: boolean;
  reset?: boolean;
  resetProps?: ResetInputProps;
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
  value: CheckboxProps['checked'];
  onChange?: ListItemButtonProps['onClick'];
  onReset?: IconButtonProps['onClick'];
};

export const CheckboxInput: React.FC<Props> = React.memo(
  ({
    disabled = false,
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
    ...checkboxProps
  }: Props) =>
    preventRender ? null : (
      <ListItemButton disabled={disabled} role={undefined} sx={{ padding: 0, columnGap: 1 }} onClick={onChange}>
        <ListItemIcon>
          {loading ? (
            <Skeleton sx={{ height: '2rem', width: '1.5rem', marginLeft: 2, marginRight: 2 }} />
          ) : (
            <Checkbox id={label} checked={value} size="small" disabled={disabled} {...checkboxProps} />
          )}
        </ListItemIcon>

        <ListItemText
          primary={
            <TooltipInput tooltip={tooltip} {...tooltipProps}>
              <Typography
                component="label"
                htmlFor={label}
                variant="body2"
                whiteSpace="nowrap"
                textTransform="capitalize"
                sx={{ cursor: 'pointer', ...labelProps?.sx }}
                onClick={onChange}
                {...labelProps}
                children={label}
              />
            </TooltipInput>
          }
        />

        <ResetInput label={label} preventRender={!reset || disabled} onReset={onReset} {...resetProps} />
      </ListItemButton>
    )
);
