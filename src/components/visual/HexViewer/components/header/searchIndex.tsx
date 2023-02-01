import { Tooltip } from '@mui/material';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FieldPopper, NumericField, StoreProps, useDispatch } from '../..';

const useHexStyles = makeStyles(theme => ({
  formControl: {
    minWidth: '150px'
  },
  resultIndexes: {
    textAlign: 'center',
    cursor: 'pointer',
    padding: 8,
    [theme.breakpoints.down('lg')]: {
      padding: 2
    },
    [theme.breakpoints.down('md')]: {
      padding: 0
    }
  },
  resultNoneIndexes: {
    textAlign: 'center',
    cursor: 'default',
    padding: 8,
    [theme.breakpoints.down('lg')]: {
      padding: 2
    },
    [theme.breakpoints.down('md')]: {
      padding: 0
    }
  }
}));

export const WrappedHexSearchIndex = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const classes = useHexStyles();
  const { onSelectedSearchIndexChange } = useDispatch();
  const { inputValue, results, selectedResult } = store.search;

  const searchFieldPopper = React.useRef(null);
  const handleClick = useCallback((e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    searchFieldPopper.current.open(e);
  }, []);

  if (results.length > 0) {
    return (
      <>
        <NumericField
          id="search-index"
          classes={{ formControl: classes.formControl }}
          placeholder={t('search.placeholder')}
          size="small"
          margin="dense"
          range="loop"
          direction="inverse"
          allowNull
          value={selectedResult}
          min={0}
          max={results.length - 1}
          base={10}
          step={1}
          offset={1}
          endAdornment={<>{t('of') + results.length}</>}
          onChange={(event: React.ChangeEvent<any>) => {
            onSelectedSearchIndexChange({ index: event.target.valueAsNumber as number });
          }}
        />
        <Tooltip title={t('search')}>
          <Typography
            className={classes.resultIndexes}
            variant="subtitle1"
            color="textPrimary"
            onClick={e => handleClick(e)}
          >
            {selectedResult !== null ? selectedResult + 1 + t('of') + results.length : t('of') + results.length}
          </Typography>
        </Tooltip>
        <FieldPopper
          ref={searchFieldPopper}
          popperPlacement="bottom-end"
          component={
            <NumericField
              id="search-index"
              label={t('search.label')}
              placeholder={t('search.placeholder')}
              size="small"
              margin="dense"
              range="loop"
              direction="inverse"
              autoFocus
              allowNull
              labelWidth={175}
              value={selectedResult}
              min={0}
              max={results.length - 1}
              base={10}
              step={1}
              offset={1}
              endAdornment={<div>test</div>}
              onChange={(event: React.ChangeEvent<any>) => {
                onSelectedSearchIndexChange({ index: event.target.valueAsNumber as number });
              }}
            />
          }
        />
      </>
    );
  } else if (inputValue === null || inputValue === '') {
    return <></>;
  } else {
    return (
      <Tooltip title={t('search')}>
        <Typography className={classes.resultNoneIndexes} variant="subtitle1" color="error">
          {t('no-results')}
        </Typography>
      </Tooltip>
    );
  }
};

export const HexSearchIndex = React.memo(
  WrappedHexSearchIndex,
  (prevProps: Readonly<StoreProps>, nextProps: Readonly<StoreProps>) =>
    prevProps.store.search.inputValue === nextProps.store.search.inputValue &&
    prevProps.store.search.selectedResult === nextProps.store.search.selectedResult &&
    prevProps.store.search.results.length === nextProps.store.search.results.length
);
