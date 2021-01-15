import { useTheme } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import DeveloperModeOutlinedIcon from '@material-ui/icons/DeveloperModeOutlined';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import React from 'react';
import { useTranslation } from 'react-i18next';

const UnderConstruction = ({ page }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <PageCenter width="65%" margin={4}>
      <div style={{ paddingTop: theme.spacing(10), fontSize: 200 }}>
        <DeveloperModeOutlinedIcon color="secondary" fontSize="inherit" />
      </div>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Typography variant="h3">{page}</Typography>
      </div>
      <div>
        <Typography variant="h6">{t('under_construction')}</Typography>
      </div>
    </PageCenter>
  );
};

export default UnderConstruction;
