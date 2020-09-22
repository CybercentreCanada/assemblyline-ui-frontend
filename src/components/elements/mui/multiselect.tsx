import { makeStyles, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import React from 'react';

const useStyles = makeStyles(theme => ({
  option: {
    backgroundColor: theme.palette.background.default
  }
}));

export interface MultiSelectItem {
  id: number | string;
  label: string;
  value: any;
}

interface MultiSelectProps {
  label: string;
  selections: MultiSelectItem[];
  items: MultiSelectItem[];
  onChange: (items: MultiSelectItem[]) => void;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ label, selections, items, onChange }) => {
  const classes = useStyles();
  const isSelected = (option: MultiSelectItem, value: MultiSelectItem): boolean => {
    return option.value === value.value;
  };
  return (
    <Autocomplete
      fullWidth
      multiple
      classes={{ option: classes.option }}
      options={items}
      value={selections}
      getOptionLabel={option => option.label}
      getOptionSelected={isSelected}
      renderInput={params => <TextField {...params} label={label} variant="outlined" />}
      onChange={(event, value) => onChange(value as MultiSelectItem[])}
    />
  );
};

export default MultiSelect;
