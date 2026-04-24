import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from 'ui/buttons/IconButton';

export const AboutButton = React.memo(() => {
  const { t } = useTranslation();

  return (
    <IconButton color="inherit" size="large" tooltip={t('support.about')} onClick={() => null}>
      <InfoOutlineIcon />
    </IconButton>
  );
});

AboutButton.displayName = 'AboutButton';
