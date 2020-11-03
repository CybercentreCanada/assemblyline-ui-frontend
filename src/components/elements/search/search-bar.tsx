import {
  Box,
  CircularProgress,
  Divider,
  fade,
  IconButton,
  IconButtonProps,
  makeStyles,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@material-ui/core';
import BackspaceIcon from '@material-ui/icons/Backspace';
import SearchIcon from '@material-ui/icons/Search';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchTextField from './search-textfield';

const useStyles = makeStyles(theme => ({
  root: {
    '& button': {
      marginRight: theme.spacing(1)
    }
  },
  searchbar: {
    borderRadius: '4px',
    paddingLeft: theme.spacing(2),
    backgroundColor: fade(theme.palette.text.primary, 0.04),
    '&:hover': {
      backgroundColor: fade(theme.palette.text.primary, 0.06)
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

export interface SearchBarButton {
  icon: React.ReactNode;
  props: IconButtonProps;
}

interface SearchBarProps {
  initValue: string;
  placeholder?: string;
  searching?: boolean;
  buttons?: SearchBarButton[];
  suggestions?: string[];
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
  const isLTEMd = useMediaQuery(theme.breakpoints.up('md'));

  //
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
    onSearch(value, getInputEl());
  };

  //
  useEffect(() => {
    setValue(initValue);
  }, [initValue]);

  return (
    <div ref={element} className={classes.root}>
      <Box display="flex" flexDirection="row" className={classes.searchbar} alignItems="center">
        <div style={{ lineHeight: 'normal', marginRight: theme.spacing(2) }}>
          {searching ? (
            <span style={{ width: 35, height: 35 }}>
              <CircularProgress size={24} />
            </span>
          ) : (
            <SearchIcon />
          )}
        </div>
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
        <IconButton onClick={_onValueClear} edge="end" color="primary">
          <BackspaceIcon />
        </IconButton>
        {isLTEMd && (
          <>
            <IconButton onClick={_onValueClear} edge="end">
              <Tooltip title={t('clear_filter')}>
                <BackspaceIcon />
              </Tooltip>
            </IconButton>
            {buttons.length !== 0 && (
              <Divider
                orientation="vertical"
                flexItem
                style={{ marginLeft: theme.spacing(1), marginRight: theme.spacing(1) }}
              />
            )}
            {buttons.map((b, i) => (
              <IconButton key={`searchbar-button-${i}`} {...b.props} edge="end">
                {b.icon}
              </IconButton>
            ))}
          </>
        )}
      </Box>
      {isLTEMd ? (
        <Box className={classes.searchresult}>{children}</Box>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div className={classes.searchresult}>{children}</div>
          <div style={{ flex: 1 }} />
          {buttons.map((b, i) => (
            <IconButton key={`searchbar-button-${i}`} {...b.props} edge="end" color="primary">
              {b.icon}
            </IconButton>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
