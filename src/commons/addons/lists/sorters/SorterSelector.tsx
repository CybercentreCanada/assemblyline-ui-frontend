import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { Autocomplete, Checkbox, Chip, TextField, useTheme } from '@mui/material';
import { AutocompleteChangeDetails, AutocompleteChangeReason } from '@mui/material/useAutocomplete';
import useSorters from 'commons/addons/elements/lists/hooks/useSorters';
import { useTranslation } from 'react-i18next';

export interface SorterField {
  id: string | number;
  path?: string;
  label?: string;
  i18nKey?: string;
  state?: 'asc' | 'desc' | 'unset';
  defaultState?: 'asc' | 'desc' | 'unset';
  getValue?: (item: any) => any;
}

interface SorterSelectorProps {
  fields: SorterField[];
  selections: SorterField[];
  onSort: (action: 'apply' | 'next' | 'remove' | 'remove-all', sorter: SorterField) => void;
}

const SorterSelector = ({ fields, selections, onSort }: SorterSelectorProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { icon } = useSorters();

  const onSelectionChange = (
    _event: React.ChangeEvent<{}>,
    _selections: SorterField[],
    reason: AutocompleteChangeReason,
    detail: AutocompleteChangeDetails<SorterField>
  ) => {
    const isRemove = reason === 'removeOption';
    onSort(isRemove ? 'remove' : 'apply', detail.option);
  };

  const isSelected = (option: SorterField, value: SorterField) => option.id === value.id;

  const onClick = (sorter: SorterField) => {
    onSort('next', sorter);
  };

  const onDelete = (sorter: SorterField) => {
    onSort('remove', sorter);
  };

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      size="small"
      style={{ minWidth: 150 }}
      options={fields}
      value={selections}
      getOptionLabel={(option: SorterField) => (option.i18nKey ? t(option.i18nKey) : option.label)}
      isOptionEqualToValue={isSelected}
      renderTags={value => (
        <>
          {value.map(o => (
            <Chip
              key={o.id}
              style={{ marginRight: theme.spacing(1) }}
              label={o.i18nKey ? t(o.i18nKey) : o.label}
              icon={icon(o.state)}
              size="small"
              onClick={() => onClick(o)}
              onDelete={() => onDelete(o)}
            />
          ))}
        </>
      )}
      renderInput={params => <TextField {...params} variant="standard" label={t('list.selector.sorters')} />}
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
            checkedIcon={<CheckBoxIcon fontSize="small" />}
            style={{ marginRight: 8 }}
            checked={selected}
          />
          {option.i18nKey ? t(option.i18nKey) : option.label}
        </li>
      )}
      onChange={onSelectionChange}
    />
  );
};

export default SorterSelector;
