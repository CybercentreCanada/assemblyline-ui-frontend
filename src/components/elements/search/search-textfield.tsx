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
    backgroundColor: theme.palette.type === 'dark' ? 'hsl(0, 0%, 10%)' : 'hsl(0, 0%, 95%)',
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
      backgroundColor: theme.palette.type === 'dark' ? 'hsl(0, 0%, 17%)' : 'hsl(0, 0%, 90%)'
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
  onChange: (value: string) => void;
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
  const [cursor, setCursor] = useState<number>(0);
  const [precursor, setPrecursor] = useState<string>('');
  const [filteredOptions, setFilteredOptions] = useState<{ start: number; end: number; items: string[] }>({
    start: 0,
    end: 0,
    items: options
  });
  const [open, setOpen] = useState<boolean>(false);
  const element = useRef<HTMLDivElement>();
  const optionsElement = useRef<HTMLDivElement>();
  const isLTEMedium = useMediaQuery(theme.breakpoints.up('md'));

  // Ensure we update options if a new list is provided.
  useEffect(() => setFilteredOptions({ start: 0, end: 0, items: options }), [options]);

  // Get the the text input element.
  const getInputEl = () => {
    return element.current.querySelector('input');
  };

  // Automatically close the options box with losing focus.
  const _onBlur = () => {
    setOpen(false);
  };

  // Handler for when the value of the text input changes.
  const _onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value: _value } = event.currentTarget;
    onChange(_value);
    filterOptions(_value);
  };

  // Handler for KeyDown event on either the text input of the options menu.
  const _onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    const { key: keyCode } = event;

    if (isEnter(keyCode)) {
      // key[ENTER ]: handler
      if (open) {
        onOptionSelection(filteredOptions.start, filteredOptions.end, filteredOptions.items[cursor]);
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
        const nextIndex = cursor - 1 > -1 ? cursor - 1 : filteredOptions.items.length - 1;
        setCursor(nextIndex);
        scrollTo(nextIndex);
      }
    } else if (isArrowDown(keyCode)) {
      // key[ARROW_DOWN]: handler
      event.preventDefault();
      if (open) {
        const nextIndex = cursor + 1 < filteredOptions.items.length ? cursor + 1 : 0;
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
    setPrecursor(parseFilter(value).precursor);
    setOpen(true);
  };

  // Handler for when the options box closes.
  const onOptionsClose = () => {
    setOpen(false);
    setCursor(0);
    getInputEl().focus();
  };

  // Handler for when an option is selected.
  const onOptionSelection = (startIndex: number, endIndex: number, option: string) => {
    if (option) {
      const inputEl = getInputEl();
      insertText(inputEl, startIndex, endIndex + 1, option);
      onOptionsClose();
      onChange(inputEl.value);
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
    //
    const {
      value: filterValue,
      cursor: thisCursor,
      startIndex: insertStartIndex,
      endIndex: insertEndIndex,
      precursor: _precursor
    } = parseFilter(inputValue, selectionOffset);

    // Filter options.
    const _options =
      filterValue.length > 0
        ? options.filter(option => option.toLowerCase().includes(filterValue.toLowerCase()))
        : options;

    // Update states...
    setPrecursor(_precursor);

    // If filtered options is empty, then we return all options..
    setFilteredOptions({
      start: insertStartIndex > -1 ? insertStartIndex : thisCursor,
      end: insertEndIndex > -1 ? insertEndIndex : thisCursor,
      items: _options
    });
  };

  const parseFilter = (
    inputValue: string,
    offset = 0
  ): { value: string; cursor: number; startIndex: number; endIndex: number; precursor: string; postcursor: string } => {
    // With left/right arrow keys, the cursor isn't yet updated to new position
    //  when the event is received, therefore we use offset.
    //  +1 for right arrow, -1 for left arrow.
    const thisCursor = getInputEl().selectionStart + offset;

    // We'll split the inptu text in two parts, before and after cursor.
    const _precursor = inputValue.substr(0, thisCursor);
    const _postcursor = inputValue.substr(thisCursor);

    // Intialize the start and end indexes of filter value.
    let filterStartIndex = -1;
    let filterEndIndex = -1;

    // Grab the last substring of text from precursor.
    const _preParts = _precursor.split(' ');
    const _prePartsLast = _preParts[_preParts.length - 1];

    // Grab the first substring of text from postcursor.
    const _postParts = _postcursor.split(' ');
    const _postPartsFirst = _postParts[0];

    // If what preceeds the cursor isn't an empty string, we compute the new start position of filterValue.
    if (_prePartsLast !== '') {
      filterStartIndex = thisCursor - _prePartsLast.length;
    }

    // If what fallows the cursor isn't an empty string, we compute the new end position of filterValue.
    if (_postPartsFirst !== '') {
      filterEndIndex = thisCursor + _postPartsFirst.length - 1;
    } else {
      // Ensure that if we have a what preceed cursor isn't empty, to set end position to cursor.
      filterEndIndex = filterStartIndex > -1 ? thisCursor - 1 : -1;
    }

    // If the preceeding part of cursor is empty but not the folowing part, then set start position to cursor.
    if (filterStartIndex === -1 && filterEndIndex > -1) {
      filterStartIndex = thisCursor;
    }

    // Give it back.
    return {
      value: _prePartsLast,
      cursor: thisCursor,
      startIndex: filterStartIndex,
      endIndex: filterEndIndex,
      precursor: _precursor,
      postcursor: _postcursor
    };
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
        onBlur={_onBlur}
        autoFocus
        fullWidth
      />
      {open && isLTEMedium ? (
        <div ref={optionsElement} className={classes.searchTextFieldOptionsCt}>
          <div className={classes.serachTextFieldOptionsInnerSpacer}>
            <Typography>{precursor}</Typography>
          </div>
          <div className={classes.searchTextFieldOptionsInner}>
            {filteredOptions.items.map((item, index) => (
              <SearchTextOption
                key={`SearchTextField-item-${index}`}
                text={item}
                position={index}
                onSelection={() => onOptionSelection(filteredOptions.start, filteredOptions.end, item)}
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
  onSelection: () => void;
}> = ({ text, position, selected = false, onSelection }) => {
  const classes = useStyles();
  return (
    <Box
      className={classes.searchTextFieldItem}
      data-searchtextfieldoption-position={position}
      data-searchtextfieldoption-selected={selected}
      onClick={() => onSelection()}
    >
      {text}
    </Box>
  );
};

export default SearchTextField;
