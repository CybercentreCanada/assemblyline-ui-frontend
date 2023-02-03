import BackspaceIcon from '@mui/icons-material/Backspace';
import SearchIcon from '@mui/icons-material/Search';
import {
  alpha,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  IconButtonProps,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { ReactElement, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchTextField from './SearchBarTextField';

const useStyles = makeStyles(theme => ({
  root: {
    '& button': {
      marginRight: theme.spacing(1)
    }
  },
  searchbar: {
    borderRadius: '4px',
    paddingLeft: theme.spacing(2),
    backgroundColor: alpha(theme.palette.text.primary, 0.04),
    '&:hover': {
      backgroundColor: alpha(theme.palette.text.primary, 0.06)
    },
    '& input': {
      color: theme.palette.text.secondary
    }
  },
  searchresult: {
    color: theme.palette.primary.light,
    paddingLeft: theme.spacing(1),
    paddingBottom: theme.spacing(1)
  }
}));
// TODO: Add tooltip to searchbar button
export interface SearchBarButton {
  icon: React.ReactElement;
  props: IconButtonProps;
  tooltip?: string;
}

interface SearchBarProps {
  initValue: string;
  placeholder?: string;
  searching?: boolean;
  buttons?: SearchBarButton[];
  suggestions?: string[];
  children?: React.ReactNode | ReactElement | ReactElement[];
  onValueChange?: (filterValue: string) => void;
  onSearch: (filterValue: string, inputElement: HTMLInputElement) => void;
  onClear: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  initValue,
  children,
  placeholder,
  searching = false,
  suggestions = [],
  buttons = [],
  onValueChange,
  onSearch,
  onClear
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const classes = useStyles();
  const element = useRef<HTMLInputElement>();
  const [value, setValue] = useState<string>(initValue);
  const upMD = useMediaQuery(theme.breakpoints.up('md'));

  const getInputEl = () => {
    return element.current.querySelector('input');
  };

  // handler[onchange]: textfield change handler.
  // track value of filter..
  const _onValueChange = (_value: string) => {
    setValue(_value);
    onValueChange(_value);
  };

  // When clearing the filter value.
  const _onValueClear = () => {
    // textFieldEl.current.querySelector('input').focus();
    setValue('');
    onClear();
  };

  // When requesting a search.
  const _onSearch = () => {
    if (value && value.length > 0) {
      onSearch(value, getInputEl());
    } else {
      onClear();
    }
  };

  useEffect(() => {
    setValue(initValue);
  }, [initValue]);

  return (
    <div ref={element} className={classes.root}>
      <Box display="flex" flexDirection="row" className={classes.searchbar} alignItems="center">
        <Box mr={2}>
          {searching ? (
            <Box style={{ width: 35, height: 35 }}>
              <CircularProgress color="primary" size={30} />
            </Box>
          ) : (
            <SearchIcon color="primary" fontSize="large" />
          )}
        </Box>
        <Box flex={1} display="relative">
          <SearchTextField
            value={value}
            placeholder={placeholder}
            options={suggestions}
            disabled={searching}
            onChange={_onValueChange}
            onSearch={_onSearch}
            onClear={_onValueClear}
          />
        </Box>
        <IconButton onClick={_onValueClear} edge="end" color="primary" size="large">
          <Tooltip title={t('clear_filter')}>
            <BackspaceIcon fontSize={!upMD ? 'small' : 'medium'} />
          </Tooltip>
        </IconButton>
        <Divider
          orientation="vertical"
          flexItem
          style={{ marginLeft: theme.spacing(1), marginRight: theme.spacing(1) }}
        />
        {buttons.map((b, i) => (
          <IconButton key={`searchbar-button-${i}`} {...b.props} edge="end" color="primary" size="large">
            {b.tooltip ? <Tooltip title={b.tooltip}>{b.icon}</Tooltip> : b.icon}
          </IconButton>
        ))}
      </Box>
      <Box className={classes.searchresult}>{children}</Box>
    </div>
  );
};

export default SearchBar;
