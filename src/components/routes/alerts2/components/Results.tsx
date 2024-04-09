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

  return (
    <div style={{ marginTop: theme.spacing(1), fontStyle: 'italic', minHeight: theme.spacing(3) }}>
      {isMDUp ? (
        <div style={{ position: 'relative' }}>
          <AlertsFiltersSelected query={query} hideQuery />
          <div style={{ position: 'absolute', top: theme.spacing(0.5), right: theme.spacing(1) }}>
            {searching ? (
              ''
            ) : (
              <span>
                <SearchResultCount count={total} />
                {total > 1 ? t('results') : t('result')}
              </span>
            )}
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginTop: theme.spacing(2), alignItems: 'center' }}>
            {!searching && query.getAll('fq', []).length > 0 && (
              <>
                <FiFilter style={{ marginRight: theme.spacing(1) }} />
              </>
            )}
            {searching ? (
              ''
            ) : (
              <span>
                <SearchResultCount count={total} />
                {total > 1 ? t('results') : t('result')}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export const AlertSearchResults = React.memo(WrappedAlertSearchResults);
