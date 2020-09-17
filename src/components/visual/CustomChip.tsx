import Chip from '@material-ui/core/Chip';
import { darken, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';

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

interface CustomChipProps {
  className?: string;
  type?: 'round' | 'square' | 'classification';
  size?: 'tiny' | 'small' | 'medium';
  color?: PossibleColors;
  variant?: 'default' | 'outlined';
  [propName: string]: any;
}

const useStyles = hasClick => {
  return makeStyles(theme => ({
    square: {
      borderRadius: '3px',
      margin: '2px 4px 2px 0'
    },
    classification: {
      borderRadius: '3px',
      margin: '2px 4px 2px 0',
      width: '100%'
    },
    tiny: {
      height: '20px',
      fontSize: '0.75rem'
    },
    // Filled
    default: {
      backgroundColor: theme.palette.type === 'dark' ? '#616161' : '#999',
      color: theme.palette.common.white,
      '&:hover, &:focus': {
        backgroundColor: hasClick ? darken(theme.palette.type === 'dark' ? '#616161' : '#999', 0.15) : null
      }
    },
    primary: {
      '&:hover, &:focus': {
        backgroundColor: hasClick ? darken(theme.palette.primary.main, 0.15) : null
      }
    },
    secondary: {
      color: theme.palette.common.white,
      '&:hover, &:focus': {
        backgroundColor: hasClick ? darken(theme.palette.secondary.main, 0.15) : null
      }
    },
    success: {
      backgroundColor: theme.palette.success.main,
      color: theme.palette.common.white,
      '&:hover, &:focus': {
        backgroundColor: hasClick ? darken(theme.palette.success.main, 0.15) : null
      }
    },
    info: {
      backgroundColor: theme.palette.type === 'dark' ? '#28abd2' : '#00baf1',
      color: theme.palette.common.white,
      '&:hover, &:focus': {
        backgroundColor: hasClick ? darken(theme.palette.type === 'dark' ? '#28abd2' : '#00baf1', 0.15) : null
      }
    },
    warning: {
      backgroundColor: theme.palette.type === 'dark' ? '#ed8b00' : '#ff9d12',
      color: theme.palette.common.white,
      '&:hover, &:focus': {
        backgroundColor: hasClick ? darken(theme.palette.type === 'dark' ? '#ed8b00' : '#ff9d12', 0.15) : null
      }
    },
    error: {
      backgroundColor: theme.palette.error.dark,
      color: theme.palette.common.white,
      '&:hover, &:focus': {
        backgroundColor: hasClick ? darken(theme.palette.error.dark, 0.15) : null
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
  }))();
};

export default function CustomChip({ className, type, size, color, variant, ...otherProps }: CustomChipProps) {
  const hasClick = otherProps.onClick !== undefined && otherProps.onClick !== null;
  const classes = useStyles(hasClick);

  // Define classnames maps
  const typeClassMap = {
    square: classes.square,
    classification: classes.classification,
    round: null
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
    typeClassMap[type],
    sizeClassMap[size],
    variant === 'outlined' ? colorClassMap[`${color}_outlined`] : colorClassMap[color],
    className
  );

  // Build chip based on computed values
  return (
    <Chip className={appliedClassName} size={sizeMap[size]} color={colorMap[color]} variant={variant} {...otherProps} />
  );
}

CustomChip.defaultProps = {
  className: null,
  type: 'round' as 'round',
  size: 'medium' as 'medium',
  color: 'default' as 'default',
  variant: 'default' as 'default'
};
