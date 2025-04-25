import { useMediaQuery, useTheme } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import type { StoreProps } from 'components/visual/HexViewer';
import { useDispatch } from 'components/visual/HexViewer';
import type { SyntheticEvent } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const WrappedHexSearchbar = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const theme = useTheme();
  const upXS = useMediaQuery(theme.breakpoints.up('xs'));

  const { onSearchBarChange, onSearchBarInputChange, onSearchBarFocus, onSearchBarBlur, onSearchBarKeyDown } =
    useDispatch();

  const [value, setValue] = React.useState<string>('');
  const [inputValue, setInputValue] = React.useState<string>('');

  const [suggestionOpen, setSuggestionOpen] = React.useState(true);
  const [suggestionLabels, setSuggestionLabels] = React.useState(['asd']);

  return (
    <Autocomplete
      multiple={false}
      freeSolo
      disableClearable
      handleHomeEndKeys
      clearIcon={null}
      fullWidth
      size="small"
      open={suggestionOpen && upXS && false}
      options={suggestionLabels}
      value={value}
      onChange={(event: SyntheticEvent<Element, Event>, newValue: string) => {
        setValue(newValue);
        onSearchBarChange({ value: newValue });
      }}
      inputValue={inputValue}
      onInputChange={(event: React.ChangeEvent, newInputValue: string) => {
        setInputValue(newInputValue);
        onSearchBarInputChange({ inputValue: newInputValue });
      }}
      onFocus={event => onSearchBarFocus()}
      onBlur={event => onSearchBarBlur()}
      onKeyDown={event => {
        // onSearchBarKeyDown(event);
      }}
      // onFocus={event => {
      //   onSuggestionFocus();
      // }}
      // onBlur={event => {
      //   onSuggestionBlur();
      // }}
      // onChange={(event: React.ChangeEvent, newValue: string | null) => {
      //   onSuggestionChange(newValue);
      // }}
      // inputValue={searchValue}
      // onInputChange={(event: React.ChangeEvent, newInputValue: string) => {
      //   onSuggestionInputChange(newInputValue);
      //   onHistoryChange();
      //   onSearchInputChange(newInputValue);
      // }}
      // onKeyDown={event => {
      //   onSearchKeyDown(event);
      //   onHistoryKeyDown(event);
      //   onSuggestionKeyDown(event);
      // }}
      renderInput={params => (
        <TextField
          {...params}
          placeholder={t('find')}
          variant="outlined"
          inputProps={{
            ...params.inputProps,
            autoComplete: 'new-password'
          }}
        />
      )}
      sx={{
        '& > fieldset': {
          border: 'none !important',
          borderWidth: '0px'
        }
      }}
      slotProps={{
        popper: {
          sx: {
            [theme.breakpoints.only('xs')]: {
              display: 'none'
            },
            width: '50vw'
          }
        },
        paper: {
          sx: {
            margin: `${theme.spacing(1)} 0px`,
            borderRadius: `0 0 ${theme.spacing(0.5)} ${theme.spacing(0.5)}`,
            width: '50vw'
          }
        },
        listbox: {
          sx: {
            margin: '0px',
            padding: '0px',
            maxHeight: `180px`
          }
        }
        // option: {
        //   sx: {
        //     fontSize: theme.typography.fontSize,
        //     backgroundColor: theme.palette.background.default,
        //     padding: theme.spacing(1),
        //     '&[data-focus="true"]': {
        //       cursor: 'pointer',
        //       backgroundColor: theme.palette.action.hover
        //     },
        //     '&[aria-selected="true"]': {
        //       backgroundColor: theme.palette.action.selected
        //     }
        //   }
        // }
      }}
    />
  );
};

export const HexSearchBar = React.memo(
  WrappedHexSearchbar,
  (prevProps: Readonly<StoreProps>, nextProps: Readonly<StoreProps>) => prevProps === nextProps
);
export default HexSearchBar;
