import BackspaceIcon from '@mui/icons-material/Backspace';
import SearchIcon from '@mui/icons-material/Search';
import { Box, CircularProgress, Divider, IconButton, IconButtonProps, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { ReactElement, useEffect, useRef, useState } from 'react';
import SearchTextField from './SearchBarTextField';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200],
    '& button': {
      marginRight: theme.spacing(1)
    }
  },
  searchbar: {
    paddingTop: theme.spacing(1),
    paddingLeft: theme.spacing(2),
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

export interface SearchBarButton {
  icon: React.ReactNode;
  props: IconButtonProps;
}

interface SearchBarProps {
  initValue: string;
  searching?: boolean;
  buttons?: SearchBarButton[];
  suggestions?: string[];
  children: ReactElement | ReactElement[];
  onValueChange?: (filterValue: string) => void;
  onSearch: (filterValue: string, inputElement: HTMLInputElement) => void;
  onClear: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  initValue,
  children,
  searching = false,
  suggestions = [],
  buttons = [],
  onValueChange,
  onSearch,
  onClear
}) => {
  const theme = useTheme();
  const classes = useStyles();
  const element = useRef<HTMLInputElement>();
  const [value, setValue] = useState<string>(initValue);

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
            options={suggestions}
            disabled={searching}
            onChange={_onValueChange}
            onSearch={_onSearch}
            onClear={_onValueClear}
          />
        </Box>
        <IconButton onClick={_onValueClear} edge="end" color="primary" size="large">
          <BackspaceIcon />
        </IconButton>
        <Divider
          orientation="vertical"
          flexItem
          style={{ marginLeft: theme.spacing(1), marginRight: theme.spacing(1) }}
        />
        {buttons.map((b, i) => (
          <IconButton key={`searchbar-button-${i}`} {...b.props} edge="end" color="primary" size="large">
            {b.icon}
          </IconButton>
        ))}
      </Box>
      <Box className={classes.searchresult}>{children}</Box>
    </div>
  );
};

export default SearchBar;
