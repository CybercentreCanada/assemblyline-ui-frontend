import { Box, ClickAwayListener, InputBase, Typography, useMediaQuery, useTheme } from '@mui/material';
import { insertText } from 'commons/addons/utils/browser';
import { parseEvent } from 'commons/components/utils/keyboard';
import type { Field, IndexDefinition } from 'components/models/ui/user';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const DEFAULT_SUGGESTION: IndexDefinition = {
  OR: {
    name: 'OR',
    indexed: true,
    stored: false,
    type: 'keyword',
    default: false,
    list: false,
    description: 'Logical OR operator'
  },
  AND: {
    name: 'AND',
    indexed: true,
    stored: false,
    type: 'keyword',
    default: false,
    list: false,
    description: 'Logical AND operator'
  },
  NOT: {
    name: 'NOT',
    indexed: true,
    stored: false,
    type: 'keyword',
    default: false,
    list: false,
    description: 'Logical NOT operator'
  },
  TO: {
    name: 'TO',
    indexed: true,
    stored: false,
    type: 'keyword',
    default: false,
    list: false,
    description: 'Range operator'
  },
  now: {
    name: 'now',
    indexed: true,
    stored: false,
    type: 'date',
    default: false,
    list: false,
    description: 'Current datetime'
  },
  d: {
    name: 'd',
    indexed: true,
    stored: false,
    type: 'date',
    default: false,
    list: false,
    description: 'Day offset'
  },
  M: {
    name: 'M',
    indexed: true,
    stored: false,
    type: 'date',
    default: false,
    list: false,
    description: 'Month offset'
  },
  y: {
    name: 'y',
    indexed: true,
    stored: false,
    type: 'date',
    default: false,
    list: false,
    description: 'Year offset'
  },
  h: {
    name: 'h',
    indexed: true,
    stored: false,
    type: 'date',
    default: false,
    list: false,
    description: 'Hour offset'
  },
  m: {
    name: 'm',
    indexed: true,
    stored: false,
    type: 'date',
    default: false,
    list: false,
    description: 'Minute offset'
  }
};

export interface SearchTextFieldProps {
  value: string;
  options: IndexDefinition;
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onClear: () => void;
  onSearch: (query: string) => void;
  onSelection?: (selected: string) => void;
}

const SearchTextField: React.FC<SearchTextFieldProps> = ({
  value,
  options = {},
  placeholder = null,
  disabled = false,
  onSearch,
  onChange,
  onSelection,
  onClear
}) => {
  const theme = useTheme();
  const [cursor, setCursor] = useState<number>(-1);
  const [filteredOptions, setFilteredOptions] = useState<{ start: number; end: number; items: string[] }>({
    start: 0,
    end: 0,
    items: Object.keys(options || {}).filter(o => options?.[o]?.indexed)
  });
  const { t } = useTranslation();
  const [open, setOpen] = useState<boolean>(false);
  const element = useRef<HTMLDivElement>(null);
  const optionsElement = useRef<HTMLDivElement>(null);
  const isLTEMedium = useMediaQuery(theme.breakpoints.up('md'));

  // Ensure we update options if a new list is provided.
  useEffect(
    () =>
      setFilteredOptions({ start: 0, end: 0, items: Object.keys(options || {}).filter(o => options?.[o]?.indexed) }),
    [options]
  );

  // Get the the text input element.
  const getInputEl = () => element.current.querySelector('input');

  // Automatically close the options box with losing focus.
  const _onBlur = () => {
    // setOpen(false);
  };

  // Handler for when the value of the text input changes.
  const _onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value: _value } = event.currentTarget;
    onChange(_value);
    filterOptions(_value);
  };

  // Handler for KeyDown event on either the text input of the options menu.
  const _onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    const { isCtrl, isTab, isEnter, isEscape, isArrowUp, isArrowDown, isArrowLeft, isArrowRight } = parseEvent(event);

    if (isEnter) {
      event.preventDefault();
      // key[ENTER ]: handler
      if (open && cursor !== -1) {
        onOptionSelection(filteredOptions.start, filteredOptions.end, filteredOptions.items[cursor]);
      } else {
        onSearch(value);
        if (open) onOptionsClose();
      }
    } else if (isEscape) {
      // key[ESCAPE]: handler
      if (open) {
        onOptionsClose();
      } else {
        onClear();
      }
    } else if (isArrowUp) {
      // key[ARROW_UP]: handler
      event.preventDefault();
      if (open) {
        const nextIndex = cursor - 1 > -1 ? cursor - 1 : filteredOptions.items.length - 1;
        setCursor(nextIndex);
        scrollTo(nextIndex);
      }
    } else if (isArrowDown) {
      // key[ARROW_DOWN]: handler
      event.preventDefault();
      if (open) {
        const nextIndex = cursor + 1 < filteredOptions.items.length ? cursor + 1 : 0;
        setCursor(nextIndex);
        scrollTo(nextIndex);
      } else {
        onOptionsOpen();
      }
    } else if (isArrowLeft) {
      // key[ARROW_LEFT]: handler
      filterOptions(value, -1);
    } else if (isArrowRight) {
      // key[ARROW_RIGHT]: handler
      filterOptions(value, 1);
    } else if (!open && !isCtrl && !isTab) {
      onOptionsOpen();
    }
  };

  // Handler for when the options box opens.
  const onOptionsOpen = () => {
    setOpen(true);
  };

  // Handler for when the options box closes.
  const onOptionsClose = () => {
    setOpen(false);
    setCursor(-1);
    getInputEl().focus();
  };

  // Handler for when an option is selected.
  const onOptionSelection = (startIndex: number, endIndex: number, option: string) => {
    if (option) {
      const inputEl = getInputEl();
      insertText(inputEl, startIndex, endIndex + 1, `${option}${option in DEFAULT_SUGGESTION ? '' : ':'}`);
      onOptionsClose();
      onChange(inputEl.value);
      if (onSelection) {
        onSelection(option);
      }
    }
  };

  // Scroll options element to the element at specified position.
  const scrollTo = (position: number) => {
    const _target = optionsElement.current.querySelector(`[data-searchtextfieldoption-position="${position}"`);
    if (_target) {
      _target.scrollIntoView({ block: 'nearest' });
    }
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
      endIndex: insertEndIndex
    } = parseFilter(inputValue, selectionOffset);

    // Filter options.
    const _options =
      filterValue.length > 0
        ? Object.entries(options)
            .filter(
              ([name, field]) =>
                field?.indexed &&
                (name.toLowerCase().includes(filterValue.toLowerCase()) ||
                  field?.description?.toLowerCase().includes(filterValue.toLowerCase()))
            )
            .map(([name]) => name)
        : Object.keys(options);

    // If filtered options is empty, then we return all options..
    setFilteredOptions({
      start: insertStartIndex > -1 ? insertStartIndex : thisCursor,
      end: insertEndIndex > -1 ? insertEndIndex : thisCursor,
      items: _options
    });

    // Update state of content assist opptions if no options are avaiable.
    if (_options.length === 0) {
      setOpen(false);
    }
  };

  const parseFilter = (
    inputValue: string,
    offset = 0
  ): { value: string; cursor: number; startIndex: number; endIndex: number } => {
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
      endIndex: filterEndIndex
    };
  };

  const [maxWidth, setMaxWidth] = useState<number>(0);

  useLayoutEffect(() => {
    const measure = () => {
      if (!element.current) return;

      setMaxWidth(element.current.getBoundingClientRect().width);
    };

    const resizeObserver = new ResizeObserver(measure);
    if (element.current) resizeObserver.observe(element.current);

    measure();

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <div ref={element}>
        <InputBase
          placeholder={placeholder || t('filter')}
          value={value}
          color="secondary"
          // InputProps={{ disableUnderline: true }}
          disabled={disabled}
          onChange={_onChange}
          onKeyDown={_onKeyDown}
          onBlur={_onBlur}
          autoFocus
          fullWidth
        />
        {open && isLTEMedium ? (
          <div
            ref={optionsElement}
            style={{ textAlign: 'left', position: 'relative', height: 0, outline: 'none', borderRadius: '0 0 4px 4px' }}
          >
            <div
              style={{
                display: 'inline-block',
                position: 'absolute',
                overflow: 'auto',
                zIndex: 1,
                top: theme.spacing(1),
                minWidth: '100%',
                maxWidth: `${maxWidth}px`,
                maxHeight: '400px',
                backgroundColor: theme.palette.background.default,
                boxShadow: theme.shadows[4],
                borderRadius: '0 0 4px 4px'
              }}
            >
              {filteredOptions.items.map((item, index) => (
                <SearchTextOption
                  key={`SearchTextField-item-${index}`}
                  name={item}
                  field={options?.[item]}
                  position={index}
                  onSelection={() => onOptionSelection(filteredOptions.start, filteredOptions.end, item)}
                  selected={index === cursor}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </ClickAwayListener>
  );
};

const SearchTextOption: React.FC<{
  name: string;
  field: Field;
  position: number;
  selected: boolean;
  onSelection: () => void;
}> = ({ name, field, position, selected = false, onSelection }) => {
  const theme = useTheme();

  return (
    <Box
      data-searchtextfieldoption-position={position}
      data-searchtextfieldoption-selected={selected}
      onClick={() => onSelection()}
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        alignItems: 'center',
        padding: theme.spacing(1),
        '&:hover': {
          cursor: 'pointer',
          backgroundColor: theme.palette.action.hover
        },
        '&[data-searchtextfieldoption-selected="true"]': {
          backgroundColor: theme.palette.action.selected
        }
      }}
    >
      <div>{name}</div>
      <Typography
        component="div"
        color="textSecondary"
        variant="caption"
        sx={{
          textAlign: 'right',
          ...(!selected && {
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis'
          })
        }}
      >
        {field?.description}
      </Typography>
    </Box>
  );
};

export default SearchTextField;
