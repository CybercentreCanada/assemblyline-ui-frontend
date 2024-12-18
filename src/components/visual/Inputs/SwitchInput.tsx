import type { FormControlLabelProps, SwitchProps, TooltipProps, TypographyProps } from '@mui/material';
import { FormControlLabel, Skeleton, Switch, Typography } from '@mui/material';
import React from 'react';
import { TooltipInput } from './TooltipInput';

type Props = SwitchProps & {
  formProps?: FormControlLabelProps;
  label: FormControlLabelProps['label'];
  labelPlacement?: FormControlLabelProps['labelPlacement'];
  labelProps?: TypographyProps;
  preventRender?: boolean;
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
  loading?: boolean;
};

export const SwitchInput: React.FC<Props> = React.memo(
  ({
    formProps = null,
    label = null,
    labelPlacement = null,
    labelProps = null,
    preventRender = false,
    tooltip = null,
    tooltipProps = null,
    loading = false,
    ...switchProps
  }: Props) =>
    preventRender ? null : (
      <TooltipInput tooltip={tooltip} tooltipProps={tooltipProps}>
        <FormControlLabel
          control={
            loading ? (
              <Skeleton sx={{ height: '2rem', width: '1.5rem', marginLeft: 2, marginRight: 2 }} />
            ) : (
              <Switch {...switchProps} />
            )
          }
          label={
            <Typography variant="body2" {...labelProps}>
              {label}
            </Typography>
          }
          labelPlacement={labelPlacement}
          {...formProps}
        />
      </TooltipInput>
    )
);
