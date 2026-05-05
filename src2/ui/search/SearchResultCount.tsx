import { Tooltip } from '@mui/material';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

type SearchResultCountProps = {
  count: number;
  max?: number;
};

export const SearchResultCount = memo(({ count, max = 10000 }: SearchResultCountProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const trackedHits = useMemo(() => params.get('track_total_hits'), [params]);

  const trackFullHits = useCallback(() => {
    const p = new URLSearchParams(window.location.search);
    p.set('track_total_hits', 'true');
    navigate(`${location.pathname}?${p.toString()}${location.hash}`);
  }, [location.hash, location.pathname, navigate]);

  const formattedNumber = useCallback((x: number) => x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ' '), []);

  return count === parseInt(trackedHits) || (trackedHits === null && count === max) ? (
    <Tooltip title={t('full_count')}>
      <span style={{ cursor: 'pointer', wordSpacing: '-2px' }} onClick={trackFullHits}>
        {count ? formattedNumber(count) : 0}+&nbsp;&nbsp;
      </span>
    </Tooltip>
  ) : (
    <span style={{ wordSpacing: '-2px' }}>{count ? formattedNumber(count) : 0}&nbsp;&nbsp;</span>
  );
});

SearchResultCount.displayName = 'SearchResultCount';
