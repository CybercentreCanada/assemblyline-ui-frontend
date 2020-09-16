import { Box, CircularProgress, Divider, IconButton, IconButtonProps, makeStyles, useTheme } from '@material-ui/core';
import BackspaceIcon from '@material-ui/icons/Backspace';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FilterListIcon from '@material-ui/icons/FilterList';
import SearchIcon from '@material-ui/icons/Search';
import StarIcon from '@material-ui/icons/Star';
import React, { useRef, useState } from 'react';
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
  const element = useRef<HTMLInputElement>();
  const [value, setValue] = useState<string>('');
  // const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  //
  const getInputEl = () => {
    return element.current.querySelector('input');
  };

  // handler[onclick]: search button click handler.
  const onSearchBtnClick = () => {
    _onSearching();
  };

  // // hander[onkeydown]: textfield key_down handler.
  // // add some keyboard key listeners to search text field.
  // const onFilterKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
  //   //
  //   // event.stopPropagation();
  //   const { keyCode } = event;
  //   if (isEnter(keyCode)) {
  //     _onSearching();
  //   } else if (isEscape(keyCode)) {
  //     if (showSuggestions) {
  //       onSuggestionClose();
  //     } else {
  //       onFilterClear();
  //     }
  //   } else if (isArrowDown(keyCode)) {
  //     event.preventDefault();
  //     setShowSuggestions(true);
  //   }
  // };

  // handler[onchange]: textfield change handler.
  // track value of filter..
  const onValueChange = (_value: string, items: []) => {
    setValue(_value);
  };

  // When clearing the filter value.
  const onValueClear = () => {
    // textFieldEl.current.querySelector('input').focus();
    setValue('');
    onClear();
  };

  // When requesting a search.
  const _onSearching = () => {
    if (value && value.length > 0) {
      onSearching(value, getInputEl());
    } else {
      onClear();
    }
  };

  // When the search suggestion box closes.
  // const onSuggestionClose = () => {
  //   setShowSuggestions(false);
  //   textFieldEl.current.querySelector('input').focus();
  // };

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
          <SearchTextField value={value} options={suggestions} onChange={onValueChange} />
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
        <IconButton onClick={onValueClear} edge="end" color="primary">
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
    </div>
  );
};

export default SearchBar;
