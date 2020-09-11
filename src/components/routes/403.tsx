import { useTheme } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import BlockIcon from '@material-ui/icons/Block';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import React from 'react';
import { useTranslation } from 'react-i18next';

type ForbiddenPageProps = {
  disabled?: boolean;
};

export default function ForbiddenPage({ disabled = false }: ForbiddenPageProps) {
  const { t } = useTranslation(['error403']);
  const theme = useTheme();
  return (
    <PageCenter width="65%">
      <Box pt={6} textAlign="center" fontSize={200}>
        <BlockIcon
          style={{ color: theme.palette.type === 'dark' ? theme.palette.error.light : theme.palette.error.dark }}
          fontSize="inherit"
        />
      </Box>
      <Box pb={2}>
        <Typography variant="h3">{t('title')}</Typography>
      </Box>
      {disabled ? (
        <Box>
          <Typography variant="h6">{t('disabled')}</Typography>
        </Box>
      ) : (
        <Box>
          <Typography variant="h6">{t('not_allowed')}</Typography>
        </Box>
      )}
    </PageCenter>
  );
}

ForbiddenPage.defaultProps = {
  disabled: false
};
