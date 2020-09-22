import { TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import React from 'react';

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
  return (
    <Autocomplete
      multiple
      options={items}
      value={selections}
      getOptionLabel={option => option.label}
      renderInput={params => <TextField {...params} label={label} variant="outlined" />}
      onChange={(event, value) => onChange(value as MultiSelectItem[])}
    />
  );
};

export default MultiSelect;
