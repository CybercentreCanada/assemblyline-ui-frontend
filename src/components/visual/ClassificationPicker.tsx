import { makeStyles } from '@material-ui/core/styles';
import Skeleton from '@material-ui/lab/Skeleton';
import useALContext from 'components/hooks/useALContext';
import CustomChip from 'components/visual/CustomChip';
import React from 'react';

interface ClassificationProps {
  currentClassification: string;
  setClassification?: (classification: string) => void;
}

const useStyles = makeStyles(theme => ({
  test: {
    color: theme.palette.error.dark
  }
}));

export default function ClassificationPicker({ currentClassification, setClassification }: ClassificationProps) {
  const classes = useStyles();
  const alContext = useALContext();

  const showPicker = event => {
    // Do someting
  };
  // Build chip based on computed values
  return alContext.classification && currentClassification ? (
    <CustomChip type="classification" label={currentClassification} onClick={setClassification ? showPicker : null} />
  ) : (
    <Skeleton style={{ height: '3rem' }} />
  );
}

ClassificationPicker.defaultProps = {
  setClassification: null
};
