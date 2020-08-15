import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import BlockIcon from '@material-ui/icons/Block';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import React from 'react';
import { useTranslation } from 'react-i18next';

type ForbiddenPageProps = {
  disabled: boolean;
};

const ForbiddenPage = (props: ForbiddenPageProps) => {
  const { disabled } = props;
  const { t } = useTranslation();
  return (
    <PageCenter width={65}>
      <Box pt={6} textAlign="center" fontSize={200}>
        <BlockIcon color="secondary" fontSize="inherit" />
      </Box>
      <Box pb={2}>
        <Typography variant="h3">{t('page.403.title')}</Typography>
      </Box>
      {disabled ? (
        <Box>
          <Typography variant="h6">{t('page.403.disabled')}</Typography>
        </Box>
      ) : (
        <Box>
          <Typography variant="h6">{t('page.403.not_allowed')}</Typography>
        </Box>
      )}
    </PageCenter>
  );
};

export default ForbiddenPage;
