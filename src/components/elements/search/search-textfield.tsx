/* eslint-disable jsx-a11y/no-static-element-interactions */
import { Box, makeStyles, TextField, Typography } from '@material-ui/core';
import React, { useEffect, useRef, useState } from 'react';
import { insertText } from '../utils/brower';
import { isArrowDown, isArrowLeft, isArrowRight, isArrowUp, isEnter, isEscape } from '../utils/keyboard';
import Throttler from '../utils/throttler';

const useStyles = makeStyles(theme => ({
  searchTextFieldOptionsCt: {
    position: 'relative',
    height: 0
  },
  searchTextFieldOptionsInner: {
    position: 'absolute',
    overflow: 'auto',
    zIndex: 1,
    top: 0,
    minWidth: 400,
    maxHeight: 250,
    backgroundColor: theme.palette.type === 'dark' ? 'hsl(0, 0%, 10%)' : 'hsl(0, 0%, 90%)',
    boxShadow: theme.shadows[4]
    // border: '1px solid transparent',
    // borderRightColor: theme.palette.type === 'dark' ? 'hsl(0, 0%, 25%)' : 'hsl(0, 0%, 85%)',
    // borderBottomColor: theme.palette.type === 'dark' ? 'hsl(0, 0%, 25%)' : 'hsl(0, 0%, 85%)',
    // borderLeftColor: theme.palette.type === 'dark' ? 'hsl(0, 0%, 25%)' : 'hsl(0, 0%, 85%)',
    // borderRadius: '3px'
  },
  searchTextFieldItem: {
    padding: theme.spacing(1),
    color: theme.palette.primary.light,
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: theme.palette.type === 'dark' ? 'hsl(0, 0%, 17%)' : 'hsl(0, 0%, 95%)'
    },
    '&[data-searchtextfieldoption-selected="true"]': {
      backgroundColor: theme.palette.type === 'dark' ? 'hsl(0, 0%, 15%)' : 'hsl(0, 0%, 92%)'
    }
  }
}));

const KEY_THROTTLER = new Throttler(10);

interface SearchTextFieldProps {
  // open: boolean;
  value: string;
  options: string[];
  disabled?: boolean;
  onChange: (value: string, filteredItems: string[]) => void;
  onClear: () => void;
  onSearch: (query: string) => void;
  onSelection?: (selected: string) => void;
}

const SearchTextField: React.FC<SearchTextFieldProps> = ({
  value,
  options,
  disabled = false,
  onSearch,
  onChange,
  onSelection,
  onClear
}) => {
  const classes = useStyles();

  const [cursor, setCursor] = useState<number>(-1);
  const [precursor, setPrecursor] = useState<string>('');
  const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
  const [open, setOpen] = useState<boolean>(false);
  const element = useRef<HTMLDivElement>();
  const optionsElement = useRef<HTMLDivElement>();

  // Ensure we update options if a new list is provided.
  useEffect(() => setFilteredOptions(options), [options]);

  // Just the the text input element.
  const getInputEl = () => {
    return element.current.querySelector('input');
  };

  // Handler for when the value of the text input changes.
  const _onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value: _value } = event.currentTarget;
    onChange(_value, options);

    //
    filterOptions(_value);
  };

  // Handler for KeyDown event on either the text input of the options menu.
  const _onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    const { keyCode } = event;
    console.log(`key[${keyCode}]`);
    if (isEnter(keyCode)) {
      if (open) {
        onOptionSelection(options[cursor]);
      } else {
        onSearch(value);
      }
    } else if (isEscape(keyCode)) {
      if (open) {
        onOptionsClose();
      } else {
        onClear();
      }
    } else if (isArrowUp(keyCode)) {
      event.preventDefault();
      if (open) {
        const nextIndex = cursor - 1 > -1 ? cursor - 1 : filteredOptions.length - 1;
        setCursor(nextIndex);
        scrollTo(nextIndex);
      }
    } else if (isArrowDown(keyCode)) {
      event.preventDefault();
      if (open) {
        const nextIndex = cursor + 1 < filteredOptions.length ? cursor + 1 : 0;
        setCursor(nextIndex);
        scrollTo(nextIndex);
      } else {
        setOpen(true);
      }
    } else if (isArrowLeft(keyCode)) {
      filterOptions(value);
    } else if (isArrowRight(keyCode)) {
      filterOptions(value);
    }
  };

  // Handler for when the options box closes.
  const onOptionsClose = () => {
    setOpen(false);
    setCursor(0);
    getInputEl().focus();
  };

  // Handler for when an option is selected.
  const onOptionSelection = (option: string) => {
    if (option) {
      const inputEl = getInputEl();
      const thisCursor = inputEl.selectionStart;
      const nextCursor = thisCursor + option.length;
      insertText(inputEl, nextCursor, nextCursor, option);
      onOptionsClose();
      onChange(inputEl.value, options);
    }
  };

  // Scroll options element to the element at specified position.
  const scrollTo = (position: number) => {
    console.log(`scollTo:${position}`);
    optionsElement.current
      .querySelector(`[data-searchtextfieldoption-position="${position}"`)
      .scrollIntoView({ block: 'nearest' });
  };

  // Options filter.
  // Split filter value by single space.
  // Grab nearest group to the left of cursor.
  // Filter entire list with that value if not empty.
  const filterOptions = (inputValue: string) => {
    //

    // FIXME -> filter value and precursor not quite keeping up
    asdfa;

    let _options = options;
    const thisCursor = getInputEl().selectionStart;
    const _precursor = inputValue.substr(0, thisCursor);
    const parts = inputValue.substr(0, thisCursor).split(' ');
    if (parts[parts.length - 1] !== '') {
      const filterValue = parts[parts.length - 1];
      console.log(`precursor: ${precursor}, filterValue: ${filterValue}, cursor: ${thisCursor}`);
      _options = _options.filter(option => option.includes(filterValue));
    }

    setPrecursor(_precursor);
    setFilteredOptions(_options.length > 0 ? _options : options);
  };

  return (
    <div ref={element}>
      <TextField
        placeholder="Filter..."
        value={value}
        color="secondary"
        InputProps={{ disableUnderline: true }}
        disabled={disabled}
        onChange={_onChange}
        onKeyDown={_onKeyDown}
        autoFocus
        fullWidth
      />
      {open ? (
        <div ref={optionsElement} className={classes.searchTextFieldOptionsCt} tabIndex={-1} onKeyDown={_onKeyDown}>
          <div style={{ display: 'inline-block', height: 0, lineHeight: 0, overflow: 'hidden', whiteSpace: 'pre' }}>
            <Typography>{precursor}</Typography>
          </div>
          <div style={{ display: 'inline-block' }} className={classes.searchTextFieldOptionsInner}>
            {filteredOptions.map((item, index) => (
              <SearchTextOption
                key={`SearchTextField-item-${index}`}
                text={item}
                position={index}
                onSelection={onOptionSelection}
                selected={index === cursor}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const SearchTextOption: React.FC<{
  text: string;
  position: number;
  selected: boolean;
  onSelection: (text: string) => void;
}> = ({ text, position, selected = false, onSelection }) => {
  const classes = useStyles();
  return (
    <Box
      className={classes.searchTextFieldItem}
      data-searchtextfieldoption-position={position}
      data-searchtextfieldoption-selected={selected}
      onClick={() => onSelection(text)}
    >
      {text}
    </Box>
  );
};

export default SearchTextField;
