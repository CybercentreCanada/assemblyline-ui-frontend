import { Tooltip } from '@mui/material';
import { EnrichedChip } from 'borealis-ui';
import clsx from 'clsx';
import React from 'react';
import { CustomChipProps, useStyles } from './CustomChip';

declare module '@mui/material/Chip' {
  interface ChipPropsSizeOverrides {
    tiny: true;
  }
}

export type EnrichmentCustomChipProps = CustomChipProps & {
  dataType: string;
  dataValue: string;
  contextIcon?: boolean;
  counters?: boolean;
  hidePopover?: boolean;
  hidePopper?: boolean;
  hideLoading?: boolean;
};

const WrappedCustomChip: React.FC<EnrichmentCustomChipProps> = ({
  dataType,
  dataValue,
  contextIcon = false,
  counters = false,
  hidePopover = false,
  hidePopper = true,
  hideLoading = false,
  className = null,
  type = 'round',
  size = 'medium',
  color = 'default',
  variant = 'filled',
  mono = false,
  wrap = false,
  tooltip = null,
  fullWidth = false,
  tooltipPlacement = 'bottom',
  children,
  ...otherProps
}) => {
  const classes = useStyles();

  // Define classnames maps
  const typeClassMap = {
    square: classes.square,
    rounded: classes.rounded,
    round: null
  };
  const sizeLabelClassMap = {
    tiny: classes.label_tiny,
    small: null,
    medium: null
  };
  const sizeClassMap = {
    tiny: classes.tiny,
    small: null,
    medium: null
  };
  const colorClassMap = {
    success: classes.success,
    warning: classes.warning,
    error: classes.error,
    info: classes.info,
    success_outlined: classes.success_outlined,
    warning_outlined: classes.warning_outlined,
    error_outlined: classes.error_outlined,
    info_outlined: classes.info_outlined,
    default: classes.default,
    primary: classes.primary,
    secondary: classes.secondary
  };
  const colorMap = {
    primary: 'primary',
    secondary: 'secondary'
  };
  const sizeMap = {
    small: 'small',
    medium: 'medium'
  };

  // Compute values applied to the original chip component
  const appliedClassName = clsx(
    mono ? (size === 'tiny' ? classes.tiny_mono : classes.mono) : null,
    wrap ? classes.auto_height : null,
    fullWidth ? classes.fullWidth : null,
    typeClassMap[type],
    sizeClassMap[size],
    variant === 'outlined' ? colorClassMap[`${color}_outlined`] : colorClassMap[color],
    className
  );
  const labelClassName = clsx(sizeLabelClassMap[size], wrap ? classes.wrap : null);

  // Build chip based on computed values
  const chip = (
    <EnrichedChip
      type={dataType}
      value={dataValue}
      contextIcon={contextIcon}
      counters={counters}
      hidePopover={hidePopover}
      hidePopper={hidePopper}
      hideLoading={hideLoading}
      classes={{ label: labelClassName, icon: variant !== 'outlined' ? classes.icon : null }}
      className={appliedClassName}
      size={sizeMap[size]}
      color={colorMap[color]}
      variant={variant}
      {...otherProps}
    />
  );

  // Do we have a tooltip?
  return tooltip ? (
    <Tooltip
      PopperProps={{
        disablePortal: true
      }}
      title={tooltip}
      placement={tooltipPlacement}
      disableInteractive
    >
      {chip}
    </Tooltip>
  ) : (
    chip
  );
};

const CustomChip = React.memo(WrappedCustomChip);
export default CustomChip;
