import {
  Box,
  CircularProgress,
  Divider,
  IconButton,
  IconButtonProps,
  makeStyles,
  TextField,
  useTheme
} from '@material-ui/core';
import BackspaceIcon from '@material-ui/icons/Backspace';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FilterListIcon from '@material-ui/icons/FilterList';
import SearchIcon from '@material-ui/icons/Search';
import StarIcon from '@material-ui/icons/Star';
import React, { useRef, useState } from 'react';
import { isEnter, isEscape } from '../utils/keyboard';

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
  onSearching: (filterValue: string, inputElement: HTMLInputElement) => void;
  onClear: () => void;
  buttons?: SearchBarButton[];
}

const SearchBar: React.FC<SearchBarProps> = ({ children, searching = false, buttons = [], onSearching, onClear }) => {
  const theme = useTheme();
  const classes = useStyles();
  const textFieldEl = useRef<HTMLInputElement>();
  const [filter, setFilter] = useState<string>('');

  // handler[onclick]: search button click handler.
  const onSearchBtnClick = () => {
    _onSearching();
  };

  // hander[onkeydown]: textfield key_down handler.
  // add some keyboard key listeners to search text field.
  const onFilterKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const { keyCode } = event;
    if (isEnter(keyCode)) {
      _onSearching();
    } else if (isEscape(keyCode)) {
      onFilterClear();
    }
  };

  // handler[onchange]: textfield change handler.
  // track value of filter.
  const onFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  const onFilterClear = () => {
    textFieldEl.current.querySelector('input').focus();
    setFilter('');
    onClear();
  };

  //
  const _onSearching = () => {
    if (filter && filter.length > 0) {
      onSearching(filter, textFieldEl.current.querySelector('input'));
    } else {
      onClear();
    }
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
        <Box flex={1}>
          <TextField
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
