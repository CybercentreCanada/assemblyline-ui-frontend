import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import { useAppConfig } from 'core/config';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from 'ui/buttons/IconButton';

export const EmailButton = memo(() => {
  const { t } = useTranslation();

  const email = useAppConfig(s => s?.configuration?.system?.support?.email);

  return !email ? null : (
    <IconButton color="inherit" size="large" tooltip={t('support.email')} onClick={() => window.open(email, '_blank')}>
      <MenuBookOutlinedIcon />
    </IconButton>
  );
});

EmailButton.displayName = 'EmailButton';
