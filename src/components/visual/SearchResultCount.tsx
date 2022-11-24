import { Box, Tooltip } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';

type SearchResultCountProps = {
  count: number;
  max?: number;
};

const SearchResultCount: React.FC<SearchResultCountProps> = ({ count, max = 10000 }) => {
  const { t } = useTranslation();
  const params = new URLSearchParams(window.location.search);
  const trackedHits = params.get('track_total_hits');
  const location = useLocation();
  const history = useHistory();

  const trackFullHits = () => {
    params.set('track_total_hits', 'true');
    history.push(`${location.pathname}?${params.toString()}${location.hash}`);
  };

  const formattedNumber = x => x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ' ');

  if (count === parseInt(trackedHits) || (trackedHits === null && count === max)) {
    return (
      <Tooltip title={t('full_count')}>
        <Box component="span" style={{ cursor: 'pointer', wordSpacing: '-2px' }} onClick={trackFullHits}>
          {count ? formattedNumber(count) : 0}+&nbsp;&nbsp;
        </Box>
      </Tooltip>
    );
  }

  return <span style={{ wordSpacing: '-2px' }}>{count ? formattedNumber(count) : 0}&nbsp;&nbsp;</span>;
};

export default SearchResultCount;
