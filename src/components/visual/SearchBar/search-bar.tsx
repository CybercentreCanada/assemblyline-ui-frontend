import {
  alpha,
  Box,
  Divider,
  IconButton,
  IconButtonProps,
  LinearProgress,
  makeStyles,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@material-ui/core';
import BackspaceIcon from '@material-ui/icons/Backspace';
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
  extras?: React.ReactNode;
  suggestions?: string[];
  onValueChange?: (filterValue: string) => void;
  onSearch: (filterValue: string, inputElement: HTMLInputElement) => void;
  onClear: (inputElement: HTMLInputElement) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  initValue,
  children,
  placeholder,
  searching = false,
  suggestions = [],
  buttons = [],
  extras,
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

  //
  const getInputEl = () => element.current.querySelector('input');

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
    onClear(getInputEl());
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
      <Box
        display="flex"
        flexDirection="row"
        className={classes.searchbar}
        alignItems="center"
        style={{ paddingRight: !extras ? theme.spacing(0.5) : null }}
      >
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
        <IconButton
          onClick={_onValueClear}
          edge="end"
          size={!upMD ? 'small' : null}
          style={{ marginRight: theme.spacing(upMD ? 0 : 0.5) }}
          disabled={searching}
        >
          <Tooltip title={t('clear_filter')}>
            <BackspaceIcon fontSize={!upMD ? 'small' : 'medium'} />
          </Tooltip>
        </IconButton>
        {buttons.length !== 0 && (
          <Divider
            orientation="vertical"
            flexItem
            style={{ marginLeft: theme.spacing(upMD ? 1 : 0.5), marginRight: theme.spacing(upMD ? 1 : 0.5) }}
          />
        )}
        {buttons.map((b, i) => (
          <IconButton
            key={`searchbar-button-${i}`}
            {...b.props}
            edge="end"
            size={!upMD ? 'small' : null}
            style={{ marginRight: theme.spacing(upMD ? 0 : 0.5) }}
            disabled={searching}
          >
            {b.tooltip ? <Tooltip title={b.tooltip}>{b.icon}</Tooltip> : b.icon}
          </IconButton>
        ))}
        {extras}
      </Box>
      {searching && (
        <LinearProgress
          style={{
            position: 'absolute',
            height: theme.spacing(upMD ? 0.5 : 0.25),
            marginTop: theme.spacing(upMD ? -0.5 : -0.25),
            width: '100%',
            borderRadius: '0 0 4px 4px'
          }}
        />
      )}
      <div className={classes.searchresult}>{children}</div>
    </div>
  );
};

export default SearchBar;
