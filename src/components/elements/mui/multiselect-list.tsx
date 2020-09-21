import { TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import React from 'react';

interface MultiSelectListItem {
  id: number | string;
  label: string;
  value;
}

interface MultiSelectListProps {
  label: string;
  items: MultiSelectListItem[];
  onChange: (items: MultiSelectListItem[]) => void;
}

const MultiSelectList: React.FC<MultiSelectListProps> = ({ label, items }) => {
  return (
    <div>
      <Autocomplete
        multiple
        id="combo-box-demo"
        options={items}
        getOptionLabel={option => option.label}
        renderInput={params => <TextField {...params} label={label} variant="outlined" />}
        onChange={(event, value) => console.log(value)}
      />
    </div>
  );
};

export default MultiSelectList;
