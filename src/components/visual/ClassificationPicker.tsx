import { makeStyles } from '@material-ui/core/styles';
import CustomChip from 'components/visual/CustomChip';
import React from 'react';

interface ClassificationProps {
  currentClassification: string;
  setClassification: (classification: string) => void;
}

const useStyles = makeStyles(theme => ({
  test: {
    color: theme.palette.error.dark
  }
}));

export default function ClassificationPicker({ currentClassification, setClassification }: ClassificationProps) {
  const classes = useStyles();

  // Build chip based on computed values
  return <CustomChip type="classification" label={currentClassification} />;
}
