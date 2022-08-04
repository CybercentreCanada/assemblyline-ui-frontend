import { makeStyles, Tooltip } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
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
    [theme.breakpoints.down('sm')]: {
      padding: 2
    },
    [theme.breakpoints.down('xs')]: {
      padding: 0
    }
  },
  resultNoneIndexes: {
    textAlign: 'center',
    cursor: 'default',
    padding: 8,
    [theme.breakpoints.down('sm')]: {
      padding: 2
    },
    [theme.breakpoints.down('xs')]: {
      padding: 0
    }
  }
}));

export const WrappedHexSearchIndex = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const classes = useHexStyles();
  const { onSelectedSearchIndexChange } = useDispatch();
  const { value, selectedIndex, indexes } = store.search;

  const searchFieldPopper = React.useRef(null);
  const handleClick = useCallback((e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    searchFieldPopper.current.open(e);
  }, []);

  if (indexes.length > 0) {
    return (
      <>
        <NumericField
          id="search-index"
          classes={{ formControl: classes.formControl }}
          placeholder={t('search.placeholder')}
          margin="dense"
          range="loop"
          direction="inverse"
          allowNull
          value={selectedIndex}
          min={0}
          max={indexes.length - 1}
          base={10}
          step={1}
          offset={1}
          endAdornment={<>{t('of') + indexes.length}</>}
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
            {selectedIndex !== null ? selectedIndex + 1 + t('of') + indexes.length : t('of') + indexes.length}
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
              margin="dense"
              range="loop"
              direction="inverse"
              autoFocus
              allowNull
              labelWidth={175}
              value={selectedIndex}
              min={0}
              max={indexes.length - 1}
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
  } else if (value === null || value === '') {
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
    prevProps.store.search.value === nextProps.store.search.value &&
    prevProps.store.search.selectedIndex === nextProps.store.search.selectedIndex &&
    prevProps.store.search.indexes.length === nextProps.store.search.indexes.length
);
