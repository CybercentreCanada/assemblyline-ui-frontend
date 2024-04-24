import { useMediaQuery, useTheme } from '@mui/material';
import { DEFAULT_QUERY } from 'components/routes/alerts';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
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

  const isMDUp = useMediaQuery(theme.breakpoints.up('md'));

  const query = useMemo<SimpleSearchQuery>(
    () => new SimpleSearchQuery(location.search, DEFAULT_QUERY),
    [location.search]
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
