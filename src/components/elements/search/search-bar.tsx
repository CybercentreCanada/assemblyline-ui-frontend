import { Box, CircularProgress, Divider, IconButton, IconButtonProps, makeStyles, useTheme } from '@material-ui/core';
import BackspaceIcon from '@material-ui/icons/Backspace';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FilterListIcon from '@material-ui/icons/FilterList';
import SearchIcon from '@material-ui/icons/Search';
import StarIcon from '@material-ui/icons/Star';
import React, { useRef, useState } from 'react';
import { isArrowDown, isEnter, isEscape } from '../utils/keyboard';
import SearchTextField from './search-textfield';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.type === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200],
    '& button': {
      marginRight: theme.spacing(1)
    }
  },
  searchbar: {
    paddingTop: theme.spacing(1),
    // paddingRight: theme.spacing(2),.
    // paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    '& input': {
      color: theme.palette.text.secondary
    }
  },
  searchresult: {
    color: theme.palette.primary.light,
    paddingLeft: theme.spacing(1),
    paddingBottom: theme.spacing(1)
    // paddingLeft: theme.spacing(1)
    // backgroundColor: theme.palette.type === 'dark' ? 'hsl(0, 0%, 15%)' : 'hsl(0, 0%, 95%)'
  }
}));

export interface SearchBarButton {
  icon: React.ReactNode;
  props: IconButtonProps;
}

interface SearchBarProps {
  searching?: boolean;
  buttons?: SearchBarButton[];
  suggestions?: string[];
  onSearching: (filterValue: string, inputElement: HTMLInputElement) => void;
  onClear: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  children,
  searching = false,
  suggestions = [],
  buttons = [],
  onSearching,
  onClear
}) => {
  const theme = useTheme();
  const classes = useStyles();
  const textFieldEl = useRef<HTMLInputElement>();
  const [filter, setFilter] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // handler[onclick]: search button click handler.
  const onSearchBtnClick = () => {
    _onSearching();
  };

  // hander[onkeydown]: textfield key_down handler.
  // add some keyboard key listeners to search text field.
  const onFilterKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    //
    // event.stopPropagation();
    const { keyCode } = event;
    if (isEnter(keyCode)) {
      _onSearching();
    } else if (isEscape(keyCode)) {
      if (showSuggestions) {
        onSuggestionClose();
      } else {
        onFilterClear();
      }
    } else if (isArrowDown(keyCode)) {
      event.preventDefault();
      setShowSuggestions(true);
    }
  };

  // handler[onchange]: textfield change handler.
  // track value of filter..
  const onFilterChange = (value: string, items: []) => {
    setFilter(value);
  };

  // When clearing the filter value.
  const onFilterClear = () => {
    textFieldEl.current.querySelector('input').focus();
    setFilter('');
    onClear();
  };

  // When requesting a search.
  const _onSearching = () => {
    if (filter && filter.length > 0) {
      onSearching(filter, textFieldEl.current.querySelector('input'));
    } else {
      onClear();
    }
  };

  // When the search suggestion box closes.
  const onSuggestionClose = () => {
    setShowSuggestions(false);
    textFieldEl.current.querySelector('input').focus();
  };

  return (
    <Box className={classes.root}>
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
            value={filter}
            options={suggestions}
            onChange={onFilterChange}
            onSelection={onSugestionSelection}
          />
          {/* <TextField
            ref={textFieldEl}
            placeholder="Filter..."
            value={filter}
            color="secondary"
            InputProps={{ disableUnderline: true }}
            disabled={searching}
            onChange={onFilterChange}
            onKeyDown={onFilterKeyDown}
            autoFocus
            fullWidth
          />
          <SearchSuggestions
            items={filterSuggestions()}
            open={showSuggestions}
            onSelection={onSugestionSelection}
            onClose={onSuggestionClose}
          /> */}
        </Box>
        <IconButton onClick={onSearchBtnClick} edge="end" color="primary">
          <FilterListIcon />
        </IconButton>
        <IconButton onClick={onFilterClear} edge="end" color="primary">
          <BackspaceIcon />
        </IconButton>
        <IconButton edge="end" color="primary">
          <StarIcon />
        </IconButton>
        <Divider
          orientation="vertical"
          flexItem
          style={{ marginLeft: theme.spacing(1), marginRight: theme.spacing(1) }}
        />
        {buttons.map((b, i) => (
          <IconButton key={`searchbar-button-${i}`} {...b.props} edge="end" color="primary">
            <ExpandMoreIcon />
          </IconButton>
        ))}
      </Box>
      <Box className={classes.searchresult}>{children}</Box>
    </Box>
  );
};

export default SearchBar;
