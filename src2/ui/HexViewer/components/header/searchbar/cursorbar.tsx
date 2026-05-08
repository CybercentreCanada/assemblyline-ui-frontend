import ClearIcon from '@mui/icons-material/Clear';
import { useTheme } from '@mui/material';
import type { StoreProps } from 'components/visual/HexViewer';
import { NumericField, TooltipIconButton, useDispatch, useEventListener } from 'components/visual/HexViewer';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

export const WrappedHexCursorBar = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const theme = useTheme();
  const { onCursorIndexChange, onCursorClear, onSearchBarFocus, onSearchBarKeyDown } = useDispatch();

  const {
    cursor: { index: cursorIndex },
    offset: { base: offsetBase }
  } = store;
  const { codes: hexcodes } = store.hex;

  const inputRef = useRef(null);

  useEventListener('keydown', (event: KeyboardEvent) => {
    if (event.ctrlKey === false || event.code !== 'KeyF') return;
    event.preventDefault();
    inputRef.current.focus();
  });

  return (
    <>
      <NumericField
        // label={t('offset.label')}
        inputRef={inputRef}
        labelWidth={0}
        placeholder={t('header.searchfield.cursor')}
        fullWidth
        size="small"
        margin="dense"
        range="loop"
        value={cursorIndex}
        min={0}
        max={hexcodes.size - 1}
        base={offsetBase}
        autoFocus
        allowNull={true}
        direction="inverse"
        preventArrowKeyDown
        preventWheel
        preventSubmit
        endAdornment={
          <div style={{ color: theme.palette.secondary.light }}>
            {t('of') + (hexcodes.size - 1).toString(offsetBase).toUpperCase()}
          </div>
        }
        onFocus={() => onSearchBarFocus()}
        onChange={event => onCursorIndexChange({ index: event.target.valueAsNumber as number })}
        onKeyDown={event => onSearchBarKeyDown({ event }, { store })}
        slotSX={{
          outlinedInput: {
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none'
            }
          },
          root: {
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none'
            }
          }
        }}
      />
      <TooltipIconButton
        title={t('clear')}
        onClick={() => onCursorClear()}
        disabled={cursorIndex === null}
        icon={<ClearIcon />}
        slotSX={{
          iconButton: {
            padding: '10px',
            [theme.breakpoints.only('sm')]: {
              padding: '4px'
            },
            [theme.breakpoints.only('xs')]: {
              padding: '2px'
            }
          }
        }}
      />
    </>
  );
};

export const HexCursorBar = React.memo(
  WrappedHexCursorBar,
  (prevProps: Readonly<StoreProps>, nextProps: Readonly<StoreProps>) =>
    prevProps.store.search.mode === nextProps.store.search.mode &&
    prevProps.store.offset.base === nextProps.store.offset.base &&
    prevProps.store.cursor.index === nextProps.store.cursor.index
);
