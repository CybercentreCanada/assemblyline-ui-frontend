import { Typography, useMediaQuery, useTheme } from '@mui/material';
import type { AlertSearchParams } from 'components/routes/alerts';
import { useSearchParams } from 'components/routes/alerts/contexts/SearchParamsContext';
import SearchResultCount from 'components/visual/SearchResultCount';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiFilter } from 'react-icons/fi';
import AlertsFiltersSelected from './FiltersSelected';

type Props = {
  searching: boolean;
  total: number;
};

const WrappedAlertSearchResults: React.FC<Props> = ({ searching = false, total = 0 }: Props) => {
  const { t } = useTranslation(['alerts']);
  const theme = useTheme();
  const { searchParams } = useSearchParams<AlertSearchParams>();

  const isMDUp = useMediaQuery(theme.breakpoints.up('md'));

  if (isMDUp)
    return (
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          columnGap: theme.spacing(1),
          marginTop: theme.spacing(1),
          minHeight: theme.spacing(3)
        }}
      >
        <AlertsFiltersSelected query={searchParams} hidden={['q', 'tc_start']} />
        <div style={{ flex: 1 }} />
        <Typography variant="subtitle1" color="primary" fontStyle="italic">
          <SearchResultCount count={total} />
          <span>{total > 1 ? t('results') : t('result')}</span>
        </Typography>
      </div>
    );
  else
    return (
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          columnGap: theme.spacing(1),
          marginTop: theme.spacing(1),
          minHeight: theme.spacing(3)
        }}
      >
        {searching ? (
          ''
        ) : (
          <>
            {searchParams.getAll('fq').length > 0 && <FiFilter />}
            <Typography variant="subtitle1" color="primary" fontStyle="italic">
              <SearchResultCount count={total} />
              <span>{total > 1 ? t('results') : t('result')}</span>
            </Typography>
          </>
        )}
      </div>
    );
};

export const AlertSearchResults = React.memo(WrappedAlertSearchResults);
