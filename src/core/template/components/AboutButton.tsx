import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from 'ui/buttons/IconButton';

export const AboutButton = memo(() => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => null, []);

  return (
    <IconButton color="inherit" size="large" tooltip={t('support.about')} onClick={handleClick}>
      <InfoOutlineIcon />
    </IconButton>
  );
});

AboutButton.displayName = 'AboutButton';
