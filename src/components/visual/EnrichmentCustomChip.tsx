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

export const BOREALIS_TYPE_MAP = {
  'network.static.ip': 'ip',
  'network.dynamic.ip': 'ip',
  'network.static.domain': 'domain',
  'network.dynamic.domain': 'domain',
  'network.static.uri': 'url',
  'network.dynamic.uri': 'url',
  md5: 'md5',
  sha1: 'sha1',
  sha256: 'sha256',
  'email.address': 'eml_address'
};

const WrappedEnrichmentCustomChip: React.FC<EnrichmentCustomChipProps> = ({
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
  variant = 'outlined',
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
    small: classes.small,
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
  const sizeMap = {
    tiny: 'small' as 'small',
    small: 'small' as 'small',
    medium: 'medium' as 'medium'
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
      variant={variant}
      sx={{ '& .iconify': { marginLeft: '8px', flexShrink: 0 } }}
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

const EnrichmentCustomChip = React.memo(WrappedEnrichmentCustomChip);
export default EnrichmentCustomChip;
