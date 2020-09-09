import Chip from '@material-ui/core/Chip';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';

interface Props extends WithStyles<typeof styles> {
  className?: string;
  type?: 'round' | 'square' | 'classification';
  size?: 'tiny' | 'small' | 'medium';
}

// We can inject some CSS into the DOM.
const styles = {
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
  }
};

function CustomChip(props) {
  const { classes, className, type, size, ...other } = props;
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

  return (
    <Chip
      className={clsx(typeClassMap[type], sizeClassMap[size], className)}
      size={size === 'tiny' ? null : size}
      {...other}
    />
  );
}

CustomChip.defaultProps = {
  className: null,
  type: 'round' as 'round',
  size: 'medium' as 'medium'
};

export default withStyles(styles)(CustomChip);
