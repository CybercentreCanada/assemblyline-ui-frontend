import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { Autocomplete, Checkbox, TextField } from '@mui/material';
import { AutocompleteChangeDetails, AutocompleteChangeReason } from '@mui/material/useAutocomplete';
import { useTranslation } from 'react-i18next';

export const GLOBAL_FILTER = { id: 999, value: '', key: 'global.filter', label: 'Global', path: '.' };

export interface FilterField {
  value: string;
  id: string | number;
  path: string;
  label?: string;
  i18nKey?: string;
  getValue?: (item: any) => any;
  comparator?: (pathValue: any, compareValue: any) => boolean;
}

interface FilterSelectorProps {
  fields: FilterField[];
  selections: FilterField[];
  onFilter: (action: 'apply' | 'reset' | 'remove' | 'remove-all', filter?: FilterField) => void;
}

const FilterSelector: React.FC<FilterSelectorProps> = ({ fields, selections, onFilter }) => {
  const { t } = useTranslation();
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  const onSelectionChange = (
    _event: React.ChangeEvent<{}>,
    _selections: FilterField[],
    reason: AutocompleteChangeReason,
    detail: AutocompleteChangeDetails<FilterField>
  ) => {
    const isRemove = reason === 'removeOption';
    const isClear = reason === 'clear';
    const action = isClear ? 'remove-all' : isRemove ? 'remove' : 'apply';
    const details = !isClear ? detail.option : null;
    onFilter(action, details);
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
      getOptionLabel={(option: FilterField) => (option.i18nKey ? t(option.i18nKey) : option.label)}
      isOptionEqualToValue={isSelected}
      renderInput={params => <TextField {...params} variant="standard" label={t('list.selector.filters')} />}
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
          {option.i18nKey ? t(option.i18nKey) : option.label}
        </li>
      )}
      onChange={onSelectionChange}
    />
  );
};

export default FilterSelector;
