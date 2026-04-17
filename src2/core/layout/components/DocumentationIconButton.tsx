import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import { useAppConfig } from 'core/config';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from 'ui/buttons/IconButton';

export const DocumentationIconButton = React.memo(() => {
  const { t } = useTranslation();

  const documentation = useAppConfig(s => s?.configuration?.system?.support?.documentation);

  return !documentation ? null : (
    <IconButton
      color="inherit"
      size="large"
      tooltip={t('support.documentation')}
      onClick={() => window.open(documentation, '_blank')}
    >
      <MenuBookOutlinedIcon />
    </IconButton>
  );
});
