import Chip from '@material-ui/core/Chip';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';

interface CustomChipProps {
  className?: string;
  type?: 'round' | 'square' | 'classification';
  size?: 'tiny' | 'small' | 'medium';
  color?: 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
  variant?: 'default' | 'outlined';
  [propName: string]: any;
}

const useStyles = makeStyles(theme => ({
  square: {
    borderRadius: '3px',
    margin: '2px 4px 2px 0'
  },
  classification: {
    borderRadius: '2px',
    margin: '2px 4px 2px 0',
    width: '100%'
  },
  tiny: {
    height: '20px',
    fontSize: '0.75rem'
  },
  success: {
    backgroundColor: theme.palette.type === 'dark' ? theme.palette.success.dark : theme.palette.success.light,
    color: theme.palette.type === 'dark' ? theme.palette.common.white : null
  },
  info: {
    backgroundColor: theme.palette.type === 'dark' ? theme.palette.info.dark : theme.palette.info.light,
    color: theme.palette.type === 'dark' ? theme.palette.common.white : null
  },
  warning: {
    backgroundColor: theme.palette.type === 'dark' ? '#b76511' : theme.palette.warning.light,
    color: theme.palette.type === 'dark' ? theme.palette.common.white : null
  },
  error: {
    backgroundColor: theme.palette.type === 'dark' ? theme.palette.error.dark : theme.palette.error.light,
    color: theme.palette.type === 'dark' ? theme.palette.common.white : null
  },
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

export default function CustomChip(props: CustomChipProps) {
  const classes = useStyles();
  const { className, type, size, color, variant, ...otherProps } = props;

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
    default: null,
    primary: null,
    secondary: null
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
