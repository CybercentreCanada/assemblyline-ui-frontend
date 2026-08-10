import SearchIcon from '@mui/icons-material/Search';
import { useAppQuickSearch } from '@tui/core';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from 'ui/buttons/IconButton';

export const QuickSearch = memo(() => {
  const { t } = useTranslation();
  const quicksearch = useAppQuickSearch();

  const handleClick = useCallback(() => quicksearch.toggle(), [quicksearch]);

  return (
    <IconButton color="inherit" size="large" tooltip={t('personalization.quicksearch')} onClick={handleClick}>
      <SearchIcon />
    </IconButton>
  );
});

QuickSearch.displayName = 'QuickSearch';
