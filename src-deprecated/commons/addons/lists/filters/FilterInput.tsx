import FilterListIcon from '@mui/icons-material/FilterList';
import type { TextFieldProps } from '@mui/material';
import { InputAdornment, TextField, useTheme } from '@mui/material';
import type { FilterField } from 'commons/addons/lists/filters/FilterSelector';
import Throttler from 'commons/addons/utils/throttler';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const THROTTLER = new Throttler(100);

type FilterInputProps = TextFieldProps & {
  fullWidth?: boolean;
  filter: FilterField;
  onFilter: (action: 'apply' | 'reset' | 'remove' | 'remove-all', filter?: FilterField) => void;
};

const FilterInput: React.FC<FilterInputProps> = ({ fullWidth = false, filter, onFilter, ...textFieldProps }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [value, setValue] = useState<string>(filter.value);

  useEffect(() => {
    setValue(filter.value);
  }, [filter.value]);

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    filter.value = event.target.value;
    setValue(filter.value);
    THROTTLER.delay(() => onFilter('apply', filter));
  };

  return (
    <TextField
      {...textFieldProps}
      variant="standard"
      value={value}
      onChange={onChange}
      label={filter.i18nKey ? t(filter.i18nKey) : filter.label}
      fullWidth={fullWidth}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start" disablePointerEvents>
              <FilterListIcon color="inherit" />
            </InputAdornment>
          ),
          sx: {
            padding: 0,
            '& svg': {
              transition: theme.transitions.create(['color', 'transform']),
              color: theme.palette.mode === 'dark' ? 'hsl(0, 0%, 22%)' : 'hsl(0, 0%, 80%)'
            },
            ['&:focused']: {
              '& svg': {
                color: theme.palette.primary.main
              }
            }
          }
        }
      }}
      sx={{
        padding: 0,
        '& svg': {
          transition: theme.transitions.create(['color', 'transform']),
          color: theme.palette.mode === 'dark' ? 'hsl(0, 0%, 22%)' : 'hsl(0, 0%, 80%)'
        }
      }}
    />
  );
};

export default FilterInput;
