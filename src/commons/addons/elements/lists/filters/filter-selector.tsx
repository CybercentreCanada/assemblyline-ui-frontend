import { Checkbox, TextField } from '@material-ui/core';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import { Autocomplete } from '@material-ui/lab';
import React from 'react';

export const GLOBAL_FILTER = { id: 999, value: '', key: 'global.filter', label: 'Global', path: '.' };

export interface FilterField {
  value: string;
  id: string | number;
  path: string;
  label: string;
  comparator?: (pathValue: any, compareValue: any) => boolean;
}

interface FilterSelectorProps {
  fields: FilterField[];
  selections: FilterField[];
  onChange: (selections: FilterField[]) => void;
}

const FilterSelector: React.FC<FilterSelectorProps> = ({ fields, selections, onChange }) => {
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  const onSelectionChange = (_event: React.ChangeEvent<{}>, _selections: FilterField[]) => {
    onChange(_selections);
  };

  const isSelected = (option: FilterField, value: FilterField) => {
    return option.id === value.id;
  };

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      size="small"
      style={{ minWidth: 150 }}
      options={fields}
      value={selections}
      getOptionLabel={option => option.label}
      getOptionSelected={isSelected}
      renderInput={params => <TextField {...params} label="Filters" />}
      renderOption={(option, { selected }) => (
        <>
          <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
          {option.label}
        </>
      )}
      onChange={(event, _fields: FilterField[]) => onSelectionChange(event, _fields)}
    />
  );
};

export default FilterSelector;
