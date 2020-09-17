/* eslint-disable jsx-a11y/no-static-element-interactions */
import { Box, makeStyles, TextField, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import React, { useEffect, useRef, useState } from 'react';
import { insertText } from '../utils/browser';
import { isArrowDown, isArrowLeft, isArrowRight, isArrowUp, isEnter, isEscape } from '../utils/keyboard';

const useStyles = makeStyles(theme => ({
  searchTextFieldOptionsCt: {
    position: 'relative',
    height: 0,
    outline: 'none'
  },
  searchTextFieldOptionsInner: {
    display: 'inline-block',
    position: 'absolute',
    overflow: 'auto',
    zIndex: 1,
    top: 0,
    minWidth: 400,
    maxHeight: 250,
    backgroundColor: theme.palette.type === 'dark' ? 'hsl(0, 0%, 10%)' : 'hsl(0, 0%, 90%)',
    boxShadow: theme.shadows[4]
  },
  serachTextFieldOptionsInnerSpacer: {
    display: 'inline-block',
    height: 0,
    lineHeight: 0,
    overflow: 'hidden',
    whiteSpace: 'pre'
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

interface SearchTextFieldProps {
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
  const theme = useTheme();
  const classes = useStyles();
  const [cursor, setCursor] = useState<number>(-1);
  const [precursor, setPrecursor] = useState<string>('');
  const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
  const [open, setOpen] = useState<boolean>(false);
  const element = useRef<HTMLDivElement>();
  const optionsElement = useRef<HTMLDivElement>();
  const isLTEMedium = useMediaQuery(theme.breakpoints.up('md'));

  // Ensure we update options if a new list is provided.
  useEffect(() => setFilteredOptions(options), [options]);

  // Get the the text input element.
  const getInputEl = () => {
    return element.current.querySelector('input');
  };

  // Handler for when the value of the text input changes.
  const _onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value: _value } = event.currentTarget;
    onChange(_value, options);
    filterOptions(_value);
  };

  // Handler for KeyDown event on either the text input of the options menu.
  const _onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    const { keyCode } = event;
    // console.log(`key[${keyCode}]`);
    if (isEnter(keyCode)) {
      // key[ENTER ]: handler
      if (open) {
        onOptionSelection(filteredOptions[cursor]);
      } else {
        onSearch(value);
      }
    } else if (isEscape(keyCode)) {
      // key[ESCAPE]: handler
      if (open) {
        onOptionsClose();
      } else {
        onClear();
      }
    } else if (isArrowUp(keyCode)) {
      // key[ARROW_UP]: handler
      event.preventDefault();
      if (open) {
        const nextIndex = cursor - 1 > -1 ? cursor - 1 : filteredOptions.length - 1;
        setCursor(nextIndex);
        scrollTo(nextIndex);
      }
    } else if (isArrowDown(keyCode)) {
      // key[ARROW_DOWN]: handler
      event.preventDefault();
      if (open) {
        const nextIndex = cursor + 1 < filteredOptions.length ? cursor + 1 : 0;
        setCursor(nextIndex);
        scrollTo(nextIndex);
      } else {
        onOptionsOpen();
      }
    } else if (isArrowLeft(keyCode)) {
      // key[ARROW_LEFT]: handler
      filterOptions(value, -1);
    } else if (isArrowRight(keyCode)) {
      // key[ARROW_RIGHT]: handler
      filterOptions(value, 1);
    }
  };

  // Handler for when the options box opens.
  const onOptionsOpen = () => {
    setPrecursor(extractPrecursor(value));
    setOpen(true);
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
      insertText(inputEl, thisCursor, thisCursor, option);
      onOptionsClose();
      onChange(inputEl.value, options);
      if (onSelection) {
        onSelection(option);
      }
    }
  };

  // Scroll options element to the element at specified position.
  const scrollTo = (position: number) => {
    optionsElement.current
      .querySelector(`[data-searchtextfieldoption-position="${position}"`)
      .scrollIntoView({ block: 'nearest' });
  };

  // Filter the options.
  // Split filter value by single space.
  // Grab nearest group to the left of cursor.
  // Filter entire list with that value if not empty.
  const filterOptions = (inputValue: string, selectionOffset = 0) => {
    let _options = options;

    // Grab the part of the text before the precursor.
    const _precursor = extractPrecursor(inputValue, selectionOffset);

    // Split that with a single whitespace.
    const parts = _precursor.split(' ');
    // The the part just before the cursor isn't empty,
    //  then we use that to filter the options.
    if (parts[parts.length - 1] !== '') {
      const filterValue = parts[parts.length - 1];
      _options = _options.filter(option => option.includes(filterValue));
    }

    // Update states...
    setPrecursor(_precursor);

    // If filtered options is empty, then we return all options..
    setFilteredOptions(_options.length > 0 ? _options : options);
  };

  const extractPrecursor = (inputValue: string, offset = 0) => {
    // Extract text up to position of cursor in input element.
    // with left/right arrow keys, the cursor isn't yet updated to new position
    //  when the event is received, therefore we use offset.
    //  +1 for right arrow, -1 for left arrow.
    const thisCursor = getInputEl().selectionStart + offset;

    // Grab only the part of the text before the cursor.
    return inputValue.substr(0, thisCursor);
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
      {open && isLTEMedium ? (
        <div ref={optionsElement} className={classes.searchTextFieldOptionsCt} tabIndex={-1} onKeyDown={_onKeyDown}>
          <div className={classes.serachTextFieldOptionsInnerSpacer}>
            <Typography>{precursor}</Typography>
          </div>
          <div className={classes.searchTextFieldOptionsInner}>
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
