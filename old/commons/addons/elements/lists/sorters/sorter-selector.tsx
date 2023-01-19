import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { Autocomplete, Checkbox, Chip, TextField, useTheme } from '@mui/material';
import useSorters from 'commons/addons/elements/lists/hooks/useSorters';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface SorterField {
  id: string | number;
  path: string;
  label: string;
  state: 'asc' | 'desc' | 'unset';
}

interface SorterSelectorProps {
  list: any[];
  fields: SorterField[];
  selections: SorterField[];
  onChange: (selections: SorterField[]) => void;
  onSorted: (list: any[]) => void;
}

const SorterSelector: React.FC<SorterSelectorProps> = ({ list, fields, selections, onChange, onSorted }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { icon: sortIcon, onSort } = useSorters();

  const onSelectionChange = (_event: React.ChangeEvent<{}>, _selections: SorterField[]) => {
    onChange(_selections);
  };

  const isSelected = (option: SorterField, value: SorterField) => {
    return option.id === value.id;
  };

  const onClick = (sorter: SorterField) => {
    onSorted(onSort(list, sorter, selections));
  };

  const onDelete = (sorter: SorterField) => {
    sorter.state = 'unset';
    onChange(selections.filter(s => s.id !== sorter.id));
  };

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      size="small"
      style={{ minWidth: 150 }}
      options={fields}
      value={selections}
      getOptionLabel={(option: SorterField) => option.label}
      isOptionEqualToValue={isSelected}
      renderTags={value => (
        <>
          {value.map(o => (
            <Chip
              key={o.id}
              style={{ marginRight: theme.spacing(1) }}
              label={o.label}
              icon={sortIcon(o)}
              size="small"
              onClick={() => onClick(o)}
              onDelete={() => onDelete(o)}
            />
          ))}
        </>
      )}
      renderInput={params => <TextField {...params} label={t('list.selector.sorters')} />}
      renderOption={(props, option, { selected }) => (
        <>
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
            checkedIcon={<CheckBoxIcon fontSize="small" />}
            style={{ marginRight: 8 }}
            checked={selected}
          />
          {option.label}
        </>
      )}
      onChange={(event, _fields: SorterField[]) => onSelectionChange(event, _fields)}
    />
  );
};

export default SorterSelector;
