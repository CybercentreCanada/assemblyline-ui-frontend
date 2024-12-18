import type { CheckboxProps, FormControlLabelProps, TooltipProps, TypographyProps } from '@mui/material';
import { Checkbox, FormControlLabel, Skeleton, Typography } from '@mui/material';
import React from 'react';
import { TooltipInput } from './TooltipInput';

type Props = CheckboxProps & {
  formProps?: FormControlLabelProps;
  label: FormControlLabelProps['label'];
  labelPlacement?: FormControlLabelProps['labelPlacement'];
  labelProps?: TypographyProps;
  preventRender?: boolean;
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
  loading?: boolean;
};

export const CheckboxInput: React.FC<Props> = React.memo(
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
              <Checkbox size="small" {...switchProps} />
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
