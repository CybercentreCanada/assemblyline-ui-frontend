import ArrowDownward from '@mui/icons-material/ArrowDownward';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ClearIcon from '@mui/icons-material/Clear';
import { useTheme } from '@mui/material';
import type { StoreProps } from 'components/visual/HexViewer';
import { TooltipIconButton, useDispatch } from 'components/visual/HexViewer';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const WrappedHexSearchButtons = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const theme = useTheme();
  const { onSelectedSearchIndexChange, onSearchClear } = useDispatch();
  const { inputValue, selectedResult } = store.search;

  return (
    <>
      <TooltipIconButton
        title={t('previous-match')}
        onClick={() => onSelectedSearchIndexChange({ index: selectedResult - 1 })}
        disabled={selectedResult === null}
        icon={<ArrowUpward />}
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
      <TooltipIconButton
        title={t('next-match')}
        disabled={selectedResult === null}
        onClick={() => onSelectedSearchIndexChange({ index: selectedResult + 1 })}
        icon={<ArrowDownward />}
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
      <TooltipIconButton
        title={t('clear')}
        onClick={() => onSearchClear()}
        disabled={inputValue === null || inputValue === ''}
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

export const HexSearchButtons = React.memo(
  WrappedHexSearchButtons,
  (prevProps: Readonly<StoreProps>, nextProps: Readonly<StoreProps>) =>
    prevProps.store.search.inputValue === nextProps.store.search.inputValue &&
    prevProps.store.search.selectedResult === nextProps.store.search.selectedResult
);
