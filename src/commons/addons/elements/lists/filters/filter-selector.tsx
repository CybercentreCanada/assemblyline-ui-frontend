import { Checkbox, TextField } from '@mui/material';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { Autocomplete } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  const onSelectionChange = (_event: React.ChangeEvent<{}>, _selections: FilterField[]) => {
    onChange(_selections);
  };

  const isSelected = (option: FilterField, value: FilterField) => option.id === value.id;
  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      size="small"
      style={{ minWidth: 150 }}
      options={fields}
      value={selections}
      getOptionLabel={option => option.label}
      isOptionEqualToValue={isSelected}
      renderInput={params => <TextField {...params} label={t('list.selector.filters')} />}
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
