import ClearIcon from '@mui/icons-material/Clear';
import { Typography, useTheme } from '@mui/material';
import type { StoreProps } from 'components/visual/HexViewer';
import {
  DelayedTextField,
  isWidthEqualUp,
  NumericField,
  TooltipIconButton,
  useDispatch,
  useEventListener
} from 'components/visual/HexViewer';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

export const WrappedHexcodeBar = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const theme = useTheme();
  const {
    onSearchClear,
    onSearchBarFocus,
    onSearchBarKeyDown,
    onSearchBarValueChange,
    onSelectedSearchIndexChange,
    onSearchBarWheel
  } = useDispatch();

  const {
    search: { inputValue, results, selectedResult }
  } = store;

  const inputRef = useRef(null);

  useEventListener('keydown', (event: KeyboardEvent) => {
    if (event.ctrlKey === false || event.code !== 'KeyF') return;
    event.preventDefault();
    inputRef.current.focus();
  });

  return (
    <>
      <DelayedTextField
        inputRef={inputRef}
        type="text"
        placeholder={t('header.searchfield.text')}
        fullWidth
        autoFocus
        delay={250}
        value={inputValue}
        size="small"
        margin="dense"
        preventSubmit={true}
        onFocus={() => onSearchBarFocus()}
        onWheel={event => onSearchBarWheel({ event })}
        onChange={event => onSearchBarValueChange({ value: event.target.value })}
        onKeyDown={event => onSearchBarKeyDown({ event }, { store })}
        slotSX={{
          formControl: { width: '100%' },
          outlinedInput: { paddingRight: '4px' },
          root: {
            '& > fieldset': {
              border: 'none !important',
              borderWidth: '0px'
            }
          },
          input: { textAlign: 'left' }
        }}
      />

      {(inputValue === null || inputValue === '') && (results === null || results.length === 0) ? (
        <></>
      ) : results === null || results.length === 0 ? (
        isWidthEqualUp(store, 'sm') ? (
          <Typography
            variant="subtitle1"
            color="error"
            sx={{
              textAlign: 'center',
              cursor: 'default',
              padding: 8,
              [theme.breakpoints.only('sm')]: {
                padding: 2
              },
              [theme.breakpoints.only('xs')]: {
                padding: 0
              }
            }}
          >
            {t('no-results.desktop')}
          </Typography>
        ) : (
          <Typography
            variant="subtitle1"
            color="error"
            sx={{
              textAlign: 'center',
              cursor: 'default',
              padding: 8,
              [theme.breakpoints.only('sm')]: {
                padding: 2
              },
              [theme.breakpoints.only('xs')]: {
                padding: 0
              }
            }}
          >
            {t('no-results.mobile')}
          </Typography>
        )
      ) : (
        <>
          <NumericField
            // label={t('offset.label')}
            labelWidth={0}
            placeholder=""
            size="small"
            margin="dense"
            range="loop"
            value={selectedResult}
            min={0}
            max={results.length - 1}
            allowNull={true}
            offset={1}
            direction="inverse"
            preventArrowKeyDown
            endAdornment={
              <div style={{ color: theme.palette.secondary.light }}>
                {t('of') + results.length.toString().toUpperCase()}
              </div>
            }
            onFocus={() => onSearchBarFocus()}
            onChange={event => onSelectedSearchIndexChange({ index: event.target.valueAsNumber as number })}
            // onKeyDown={event => onSearchBarKeyDown(event, store)}
            slotSX={{
              root: {
                '& > fieldset': {
                  border: 'none !important',
                  borderWidth: '0px'
                }
              },
              input: {
                textAlign: 'right'
              }
            }}
          />
          <TooltipIconButton
            title={t('clear')}
            onClick={() => onSearchClear()}
            disabled={inputValue === null || inputValue === ''}
            icon={<ClearIcon />}
            slotSX={{
              iconButton: {
                padding: 10,
                [theme.breakpoints.only('sm')]: {
                  padding: 4
                },
                [theme.breakpoints.only('xs')]: {
                  padding: 2
                }
              }
            }}
          />
        </>
      )}
    </>
  );
};

export const HexcodeBar = React.memo(
  WrappedHexcodeBar,
  (prevProps: Readonly<StoreProps>, nextProps: Readonly<StoreProps>) =>
    prevProps.store.mode.width === nextProps.store.mode.width &&
    prevProps.store.search.mode === nextProps.store.search.mode &&
    prevProps.store.search.inputValue === nextProps.store.search.inputValue &&
    prevProps.store.search.selectedResult === nextProps.store.search.selectedResult &&
    prevProps.store.search.results === nextProps.store.search.results
);
