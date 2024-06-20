import { useMediaQuery, useTheme } from '@mui/material';
import { useDefaultParams } from 'components/routes/alerts/contexts/DefaultParamsContext';
import { buildSearchQuery } from 'components/routes/alerts/utils/alertUtils';
import type SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import SearchResultCount from 'components/visual/SearchResultCount';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FiFilter } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import AlertsFiltersSelected from './FiltersSelected';

type Props = {
  searching: boolean;
  total: number;
};

const WrappedAlertSearchResults: React.FC<Props> = ({ searching = false, total = 0 }: Props) => {
  const { t } = useTranslation(['alerts']);
  const theme = useTheme();
  const location = useLocation();
  const { defaultParams, getQuery } = useDefaultParams();

  const isMDUp = useMediaQuery(theme.breakpoints.up('md'));

  const query = useMemo<SimpleSearchQuery>(
    () =>
      buildSearchQuery({
        search: location.search,
        singles: ['tc', 'group_by', 'sort', 'tc_start'],
        multiples: ['fq'],
        defaultString: defaultParams.toString()
      }),
    [defaultParams, location.search]
  );

  if (isMDUp)
    return (
      <div
        style={{
          marginTop: theme.spacing(1),
          fontStyle: 'italic',
          minHeight: theme.spacing(3),
          display: 'flex',
          flexWrap: 'nowrap',
          columnGap: theme.spacing(1)
        }}
      >
        <AlertsFiltersSelected query={query} hideQuery hideTCStart />
        <div style={{ flex: 1 }} />
        <div style={{ minWidth: 'fit-content' }}>
          <SearchResultCount count={total} />
          <span>{total > 1 ? t('results') : t('result')}</span>
        </div>
      </div>
    );
  else
    return (
      <div
        style={{
          marginTop: theme.spacing(1),
          fontStyle: 'italic',
          minHeight: theme.spacing(3),
          display: 'flex',
          alignItems: 'center',
          columnGap: theme.spacing(1)
        }}
      >
        {searching ? (
          ''
        ) : (
          <>
            {query.getAll('fq', []).length > 0 && <FiFilter />}
            <div style={{ minWidth: 'fit-content' }}>
              <SearchResultCount count={total} />
              <span>{total > 1 ? t('results') : t('result')}</span>
            </div>
          </>
        )}
      </div>
    );
};

export const AlertSearchResults = React.memo(WrappedAlertSearchResults);
