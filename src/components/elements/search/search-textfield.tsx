/* eslint-disable jsx-a11y/no-static-element-interactions */
import { Box, makeStyles, TextField } from '@material-ui/core';
import React, { useEffect, useRef, useState } from 'react';
import { isArrowDown, isArrowUp, isEnter, isEscape } from '../utils/keyboard';
import Throttler from '../utils/throttler';

const useStyles = makeStyles(theme => ({
  searchTextFieldCt: {
    position: 'relative'
  },
  searchTextFieldInner: {
    position: 'absolute',
    overflow: 'auto',
    zIndex: 1,
    top: 0,
    minWidth: 400,
    maxHeight: 250,
    backgroundColor: theme.palette.type === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200]
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
  const [open, setOpen] = useState<boolean>(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
  const element = useRef<HTMLDivElement>();
  const optionsElement = useRef<HTMLDivElement>();

  // Ensure we update the filtered items if the list of options changes.
  useEffect(() => setFilteredOptions(options), [options]);

  // Just the the text input element.
  const getInputEl = () => {
    return element.current.querySelector('input');
  };

  // Handler for when the value of the text input changes.
  const _onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value: _value } = event.currentTarget;
    onChange(_value, options);
  };

  // Handler for KeyDown event on either the text input of the options menu.
  const _onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    const { keyCode } = event;
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
        const nextIndex = cursor - 1 > -1 ? cursor - 1 : options.length - 1;
        setCursor(nextIndex);
        scrollTo(nextIndex);
      }
    } else if (isArrowDown(keyCode)) {
      event.preventDefault();
      if (open) {
        const nextIndex = cursor + 1 < options.length ? cursor + 1 : 0;
        setCursor(nextIndex);
        scrollTo(nextIndex);
      } else {
        setOpen(true);
      }
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
      inputEl.setRangeText(option);
      inputEl.setSelectionRange(nextCursor, nextCursor);
      onOptionsClose();
      onChange(getInputEl().value, options);
    }
  };

  // Scroll options element to the element at specified position.
  const scrollTo = (position: number) => {
    optionsElement.current
      .querySelector(`[data-searchtextfieldoption-position="${position}"`)
      .scrollIntoView({ block: 'nearest' });
  };

  // TODO: Filtering logic.
  const filterOptions = () => {
    let _options = options;
    // Split filter value by whitespace.
    // Grab nearest group to the left of cursor.
    // Filter entire list with that value.
    const inputEl = getInputEl();
    const thisCursor = inputEl.selectionStart;
    const _value = inputEl.value;
    // const parts = _value.substr(0, thisCursor).split(/\s+/);
    const parts = _value.substr(0, thisCursor).split(' ');
    if (parts[parts.length - 1] !== '') {
      const filterValue = parts[parts.length - 1];
      console.log(filterValue);
      _options = _options.filter(option => option.includes(filterValue));
    }
    console.log(parts);
    return _options.length > 0 ? _options : options;
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
        <div ref={optionsElement} className={classes.searchTextFieldCt} tabIndex={-1} onKeyDown={_onKeyDown}>
          <div className={classes.searchTextFieldInner}>
            {filterOptions().map((item, index) => (
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
