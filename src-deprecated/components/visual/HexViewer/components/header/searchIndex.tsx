import { Tooltip, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import type { StoreProps } from 'components/visual/HexViewer';
import { FieldPopper, NumericField, useDispatch } from 'components/visual/HexViewer';
import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export const WrappedHexSearchIndex = ({ store }: StoreProps) => {
  const { t } = useTranslation(['hexViewer']);
  const theme = useTheme();
  const { onSelectedSearchIndexChange } = useDispatch();
  const { inputValue, results, selectedResult } = store.search;

  const searchFieldPopper = useRef(null);
  const handleClick = useCallback((e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    searchFieldPopper.current.open(e);
  }, []);

  if (results.length > 0) {
    return (
      <>
        <NumericField
          id="search-index"
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
          slotSX={{ formControl: { minWidth: '150px' } }}
        />
        <Tooltip title={t('search')}>
          <Typography
            variant="subtitle1"
            color="textPrimary"
            onClick={e => handleClick(e)}
            sx={{
              textAlign: 'center',
              cursor: 'pointer',
              padding: '8px',
              [theme.breakpoints.only('sm')]: {
                padding: '2px'
              },
              [theme.breakpoints.only('xs')]: {
                padding: '0px'
              }
            }}
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
        <Typography
          variant="subtitle1"
          color="error"
          sx={{
            textAlign: 'center',
            cursor: 'default',
            padding: '8px',
            [theme.breakpoints.only('sm')]: {
              padding: '2px'
            },
            [theme.breakpoints.only('xs')]: {
              padding: '0px'
            }
          }}
        >
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
