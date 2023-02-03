import FilterListIcon from '@mui/icons-material/FilterList';
import { InputAdornment, TextField, TextFieldProps } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import Throttler from 'commons/addons/utils/throttler';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FilterField } from './FilterSelector';

const useStyles = makeStyles(theme => ({
  filterInput: {
    padding: 0,
    '& svg': {
      transition: theme.transitions.create(['color', 'transform']),
      color: theme.palette.mode === 'dark' ? 'hsl(0, 0%, 22%)' : 'hsl(0, 0%, 80%)'
    }
  },
  filterInputFocused: {
    '& svg': {
      color: theme.palette.primary.main
    }
  }
}));

const THROTTLER = new Throttler(100);

type FilterInputProps = TextFieldProps & {
  fullWidth?: boolean;
  filter: FilterField;
  onFilter: (action: 'apply' | 'reset' | 'remove' | 'remove-all', filter?: FilterField) => void;
};

const FilterInput: React.FC<FilterInputProps> = ({ fullWidth = false, filter, onFilter, ...textFieldProps }) => {
  const { t } = useTranslation();
  const classes = useStyles();
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
      className={classes.filterInput}
      value={value}
      onChange={onChange}
      label={filter.i18nKey ? t(filter.i18nKey) : filter.label}
      fullWidth={fullWidth}
      InputProps={{
        className: classes.filterInput,
        classes: { focused: classes.filterInputFocused },
        startAdornment: (
          <InputAdornment position="start" disablePointerEvents>
            <FilterListIcon color="inherit" />
          </InputAdornment>
        )
      }}
    />
  );
};

export default FilterInput;
