import { makeStyles } from '@material-ui/core';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import ClearIcon from '@material-ui/icons/Clear';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StoreProps, TooltipIconButton, useDispatch } from '../..';

const useHexStyles = makeStyles(theme => ({
  iconButton: {
    padding: 10,
    [theme.breakpoints.down('sm')]: {
      padding: 4
    },
    [theme.breakpoints.down('xs')]: {
      padding: 2
    }
  }
}));

export const WrappedHexSearchButtons = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const classes = useHexStyles();
  const { onSelectedSearchIndexChange, onSearchClear } = useDispatch();
  const { value, selectedIndex } = store.search;

  return (
    <>
      <TooltipIconButton
        classes={{ iconButton: classes.iconButton }}
        title={t('previous-match')}
        onClick={() => onSelectedSearchIndexChange(selectedIndex - 1)}
        disabled={selectedIndex === null}
        icon={<ArrowUpward />}
      />
      <TooltipIconButton
        classes={{ iconButton: classes.iconButton }}
        title={t('next-match')}
        disabled={selectedIndex === null}
        onClick={() => onSelectedSearchIndexChange(selectedIndex + 1)}
        icon={<ArrowDownward />}
      />
      <TooltipIconButton
        classes={{ iconButton: classes.iconButton }}
        title={t('clear')}
        onClick={onSearchClear}
        disabled={value === null || value === ''}
        icon={<ClearIcon />}
      />
    </>
  );
};

export const HexSearchButtons = React.memo(
  WrappedHexSearchButtons,
  (prevProps: Readonly<StoreProps>, nextProps: Readonly<StoreProps>) =>
    prevProps.store.search.value === nextProps.store.search.value &&
    prevProps.store.search.selectedIndex === nextProps.store.search.selectedIndex
);
