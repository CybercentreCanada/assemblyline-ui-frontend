import BlockIcon from '@mui/icons-material/Block';
import { useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import { createAppRoute } from 'core/router/route/route.utils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageCenter } from 'ui/layouts/PageCenter';

//*****************************************************************************************
// Forbidden Page
//*****************************************************************************************
type ForbiddenPageProps = {
  disabled?: boolean;
};

export const ForbiddenPage = React.memo(({ disabled = false }: ForbiddenPageProps) => {
  const { t } = useTranslation(['error403']);
  const theme = useTheme();

  return (
    <PageCenter width="65%" margin={4}>
      <div style={{ paddingTop: theme.spacing(10), fontSize: 200 }}>
        <BlockIcon
          style={{ color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark }}
          fontSize="inherit"
        />
      </div>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Typography variant="h3">{t('title')}</Typography>
      </div>
      {disabled ? (
        <div>
          <Typography variant="h6">{t('disabled')}</Typography>
        </div>
      ) : (
        <div>
          <Typography variant="h6">{t('not_allowed')}</Typography>
        </div>
      )}
    </PageCenter>
  );
});

//*****************************************************************************************
// Forbidden Route
//*****************************************************************************************

export const ForbiddenRoute = createAppRoute({
  component: ForbiddenPage,
  path: '/forbidden'
});

export default ForbiddenRoute;
