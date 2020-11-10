import { Tooltip } from '@material-ui/core';
import Chip from '@material-ui/core/Chip';
import { darken, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { ReactNode } from 'react';

export const ColorMap = {
  'label-default': 'default' as 'default',
  'label-primary': 'primary' as 'primary',
  'label-secondary': 'secondary' as 'secondary',
  'label-info': 'info' as 'info',
  'label-success': 'success' as 'success',
  'label-warning': 'warning' as 'warning',
  'label-error': 'error' as 'error',
  default: 'default' as 'default',
  primary: 'primary' as 'primary',
  secondary: 'secondary' as 'secondary',
  info: 'info' as 'info',
  success: 'success' as 'success',
  warning: 'warning' as 'warning',
  error: 'error' as 'error'
};
export type PossibleColors = 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';

export interface CustomChipProps {
  className?: string;
  type?: 'round' | 'square' | 'rounded';
  size?: 'tiny' | 'small' | 'medium';
  color?: PossibleColors;
  variant?: 'default' | 'outlined';
  mono?: boolean;
  wrap?: boolean;
  tooltip?: string;
  fullWidth?: boolean;
  children?: ReactNode;
  [propName: string]: any;
}

const useStyles = makeStyles(theme => ({
  wrap: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  },
  square: {
    borderRadius: '0px',
    margin: '2px 4px 2px 0'
  },
  rounded: {
    borderRadius: '3px',
    margin: '2px 4px 2px 0'
  },
  fullWidth: {
    width: '100%'
  },
  tiny: {
    height: '20px',
    fontSize: '0.725rem'
  },
  label_tiny: {
    paddingLeft: '6px',
    paddingRight: '6px'
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: '1.15rem'
  },
  tiny_mono: {
    fontFamily: 'monospace',
    fontSize: '1rem'
  },
  // Filled
  default: {
    backgroundColor: theme.palette.type === 'dark' ? '#616161' : '#999',
    color: theme.palette.common.white,
    '[role=button]&:hover, [role=button]&:focus': {
      backgroundColor: darken(theme.palette.type === 'dark' ? '#616161' : '#999', 0.15)
    }
  },
  primary: {
    '[role=button]&:hover, [role=button]&:focus': {
      backgroundColor: darken(theme.palette.primary.main, 0.15)
    }
  },
  secondary: {
    color: theme.palette.common.white,
    '[role=button]&:hover, [role=button]&:focus': {
      backgroundColor: darken(theme.palette.secondary.main, 0.15)
    }
  },
  success: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.common.white,
    '[role=button]&:hover, [role=button]&:focus': {
      backgroundColor: darken(theme.palette.success.main, 0.15)
    }
  },
  info: {
    backgroundColor: theme.palette.type === 'dark' ? '#28abd2' : '#00baf1',
    color: theme.palette.common.white,
    '[role=button]&:hover, [role=button]&:focus': {
      backgroundColor: darken(theme.palette.type === 'dark' ? '#28abd2' : '#00baf1', 0.15)
    }
  },
  warning: {
    backgroundColor: theme.palette.type === 'dark' ? '#ed8b00' : '#ff9d12',
    color: theme.palette.common.white,
    '[role=button]&:hover, [role=button]&:focus': {
      backgroundColor: darken(theme.palette.type === 'dark' ? '#ed8b00' : '#ff9d12', 0.15)
    }
  },
  error: {
    backgroundColor: theme.palette.error.dark,
    color: theme.palette.common.white,
    '[role=button]&:hover, [role=button]&:focus': {
      backgroundColor: darken(theme.palette.error.dark, 0.15)
    }
  },
  // Outlined
  success_outlined: {
    borderColor: theme.palette.type !== 'dark' ? theme.palette.success.dark : theme.palette.success.light,
    color: theme.palette.type !== 'dark' ? theme.palette.success.dark : theme.palette.success.light
  },
  info_outlined: {
    borderColor: theme.palette.type !== 'dark' ? theme.palette.info.dark : theme.palette.info.light,
    color: theme.palette.type !== 'dark' ? theme.palette.info.dark : theme.palette.info.light
  },
  warning_outlined: {
    borderColor: theme.palette.type !== 'dark' ? theme.palette.warning.dark : theme.palette.warning.light,
    color: theme.palette.type !== 'dark' ? theme.palette.warning.dark : theme.palette.warning.light
  },
  error_outlined: {
    borderColor: theme.palette.type !== 'dark' ? theme.palette.error.dark : theme.palette.error.light,
    color: theme.palette.type !== 'dark' ? theme.palette.error.dark : theme.palette.error.light
  }
}));

const WrappedCustomChip: React.FC<CustomChipProps> = ({
  className = null,
  type = 'round',
  size = 'medium',
  color = 'default',
  variant = 'default',
  mono = false,
  wrap = false,
  tooltip = null,
  fullWidth = false,
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
    fullWidth ? classes.fullWidth : null,
    typeClassMap[type],
    sizeClassMap[size],
    variant === 'outlined' ? colorClassMap[`${color}_outlined`] : colorClassMap[color],
    className
  );
  const labelClassName = clsx(sizeLabelClassMap[size], wrap ? classes.wrap : null);

  // Build chip based on computed values
  const chip = (
    <Chip
      classes={{ label: labelClassName }}
      className={appliedClassName}
      size={sizeMap[size]}
      color={colorMap[color]}
      variant={variant}
      {...otherProps}
    />
  );

  // Do we have a tooltip?
  return tooltip ? <Tooltip title={tooltip}>{chip}</Tooltip> : chip;
};

const CustomChip = React.memo(WrappedCustomChip);
export default CustomChip;
