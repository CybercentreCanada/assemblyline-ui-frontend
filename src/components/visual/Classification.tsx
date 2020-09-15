import { makeStyles } from '@material-ui/core/styles';
import Skeleton from '@material-ui/lab/Skeleton';
import useALContext from 'components/hooks/useALContext';
import CustomChip, { PossibleColors } from 'components/visual/CustomChip';
import React from 'react';

interface ClassificationProps {
  currentClassification: string;
  setClassification?: (classification: string) => void;
  size?: 'medium' | 'small' | 'tiny';
  type?: 'picker' | 'pill' | 'text';
}

const useStyles = makeStyles(theme => ({
  classification: {
    fontWeight: 500,
    width: '100%'
  }
}));

export default function Classification({ currentClassification, setClassification, size, type }: ClassificationProps) {
  const classes = useStyles();
  const alContext = useALContext();

  const textType = type === 'text';

  const computeColor = (): PossibleColors => {
    // Actually compute the color name and fix custom color hover
    return 'success';
  };

  const skelheight = {
    normal: '3rem',
    small: '2rem',
    tiny: '1.5rem'
  };

  const showPicker = event => {
    // Obvisouly do more!
    setClassification('TLP:GREEN');
  };
  // Build chip based on computed values
  return alContext.classification && currentClassification ? (
    <CustomChip
      type="classification"
      variant={textType ? 'outlined' : 'default'}
      size={size}
      color={computeColor()}
      className={classes.classification}
      label={currentClassification}
      onClick={type === 'picker' ? showPicker : null}
    />
  ) : (
    <Skeleton style={{ height: skelheight[size] }} />
  );
}

Classification.defaultProps = {
  setClassification: null,
  size: 'medium' as 'medium',
  type: 'pill' as 'pill'
};
