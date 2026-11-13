import BedtimeOutlinedIcon from '@mui/icons-material/BedtimeOutlined';
import BlockIcon from '@mui/icons-material/Block';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Typography, useMediaQuery, useTheme } from '@mui/material';
import { createAppRoute } from 'core/router';
import PageCenter from 'core/template/components/pages/PageCenter';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

type ForbiddenPageProps = {
  disabled?: boolean;
};

export const ForbiddenPage = memo(({ disabled = false }: ForbiddenPageProps) => {
  const { t } = useTranslation(['error403']);
  const theme = useTheme();
  const downSM = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <PageCenter>
      <div style={{ paddingTop: theme.spacing(10), fontSize: 200, color: theme.palette.secondary.main }}>
        {disabled ? <BedtimeOutlinedIcon fontSize="inherit" /> : <LockOutlinedIcon fontSize="inherit" />}
      </div>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Typography
          children={disabled ? t('disabled.title') : t('title')}
          variant={downSM ? 'h4' : 'h3'}
          gutterBottom
        />
      </div>
      <div style={{ width: '100%', maxWidth: '720px', margin: '0 auto' }}>
        <Typography
          children={disabled ? t('disabled.description') : t('description')}
          variant={downSM ? 'body1' : 'h6'}
          gutterBottom
        />
      </div>
    </PageCenter>
  );
});

ForbiddenPage.displayName = 'ForbiddenPage';

export const ForbiddenRoute = createAppRoute({
  component: ForbiddenPage,

  path: '/forbidden',

  ancestor: null,
  shortname: () => ['app_route.forbidden.shortname', { ns: 'error403' }],
  fullname: () => ['app_route.forbidden.fullname', { ns: 'error403' }],
  shorticon: () => <BlockIcon />,
  fullicon: () => <BlockIcon />,

  disabled: () => false,
  forbidden: () => false
});

export const DisabledRoute = createAppRoute({
  component: memo(() => <ForbiddenPage disabled />),

  path: '/disabled',

  ancestor: null,
  shortname: () => ['app_route.disabled.shortname', { ns: 'error403' }],
  fullname: () => ['app_route.disabled.fullname', { ns: 'error403' }],
  shorticon: () => <BlockIcon />,
  fullicon: () => <BlockIcon />,

  disabled: () => false,
  forbidden: () => false
});

export default ForbiddenPage;
