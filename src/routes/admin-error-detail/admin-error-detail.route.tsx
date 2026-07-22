import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PageviewOutlinedIcon from '@mui/icons-material/PageviewOutlined';
import PanToolOutlinedIcon from '@mui/icons-material/PanToolOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import ViewCarouselOutlinedIcon from '@mui/icons-material/ViewCarouselOutlined';
import { Card, Grid, styled, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { createAppRoute, useAppPathParams } from 'core/routes';
import useALContext from 'deprecated/hooks/useALContext';
import useClipboard from 'deprecated/hooks/useClipboard';
import useMyAPI from 'deprecated/hooks/useMyAPI';
import type { Error as ErrorModel } from 'models/base/error';
import type { ReactElement } from 'react';
import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsClipboard } from 'react-icons/bs';
import { Navigate } from 'react-router';
import { FileDownloader } from 'ui/buttons/FileDownloader';
import { IconButton } from 'ui/buttons/IconButton';
import Moment from 'ui/Moment';
import { PageCenter } from 'ui/pages/PageCenter';

const StyledBsClipboard = styled(BsClipboard)(({ theme }) => ({
  marginRight: theme.spacing(1),
  '&:hover': {
    cursor: 'pointer',
    transform: 'scale(1.1)'
  }
}));

interface Error extends ErrorModel {
  key: string;
}

//*****************************************************************************************
// AdminErrorDetail Page
//*****************************************************************************************

export const AdminErrorDetailPage = memo(() => {
  const { t } = useTranslation(['adminErrorViewer']);
  const theme = useTheme();
  const { copy } = useClipboard();
  const [error, setError] = useState<Error>(null);
  const { apiCall } = useMyAPI();
  const { id: key } = useAppPathParams<'/admin/apikeys/:id'>();
  const { user: currentUser } = useALContext();
  const downSM = useMediaQuery(theme.breakpoints.down('md'));

  const typeMap = useMemo<Record<Error['type'], ReactElement>>(() => {
    const color =
      error?.severity === 'error'
        ? theme.palette.error.main
        : error?.severity === 'warning'
          ? theme.palette.warning.main
          : theme.palette.action.active;

    return {
      'MAX DEPTH REACHED': <PanToolOutlinedIcon style={{ color }} />,
      'MAX RETRY REACHED': <PanToolOutlinedIcon style={{ color }} />,
      EXCEPTION: <ReportProblemOutlinedIcon style={{ color }} />,
      'TASK PRE-EMPTED': <CancelOutlinedIcon style={{ color }} />,
      'SERVICE DOWN': <CancelOutlinedIcon style={{ color }} />,
      'SERVICE BUSY': <CancelOutlinedIcon style={{ color }} />,
      'MAX FILES REACHED': <PanToolOutlinedIcon style={{ color }} />,
      UNKNOWN: <ReportProblemOutlinedIcon style={{ color }} />
    };
  }, [error?.severity, theme.palette.action.active, theme.palette.error.main, theme.palette.warning.main]);

  useEffect(() => {
    if (key && currentUser.is_admin) {
      apiCall<Error>({
        url: `/api/v4/error/${key}/`,
        onSuccess: api_data => setError({ key, ...api_data.api_response })
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return currentUser.is_admin ? (
    <PageCenter margin={!key ? 2 : 4} width="100%">
      {error && (
        <div
          style={{
            paddingLeft: theme.spacing(downSM ? 0 : 2),
            paddingRight: theme.spacing(downSM ? 0 : 2),
            textAlign: 'left'
          }}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <Typography variant="h5">{error.response.service_name}</Typography>
              <Typography variant="caption">
                {error.response.service_version !== 0 &&
                  error.response.service_version !== '0' &&
                  error.response.service_version}
                {error.response.service_tool_version && ` (${error.response.service_tool_version})`}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <div style={{ display: 'inline-block', textAlign: 'start' }}>
                <Typography component="div" variant="body1">
                  <Moment variant="fromNow">{error.created}</Moment>
                </Typography>
                <Typography component="div" variant="caption">
                  <Moment format="YYYY-MM-DD HH:mm:ss">{error.created}</Moment>
                </Typography>
              </div>
            </Grid>
            <Grid
              size={{ xs: 12, sm: 8 }}
              sx={{ display: 'flex', alignItems: 'center', columnGap: theme.spacing(0.5) }}
            >
              {typeMap?.[error?.type]}
              <span>{t(`type.${error?.type}`)}</span>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }} style={{ alignSelf: 'center' }}>
              <span style={{ verticalAlign: 'middle' }}>{t(`fail.${error.response.status}`)}</span>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <label>{t('file_info')}</label>
              <div style={{ wordBreak: 'break-all' }}>
                <StyledBsClipboard onClick={() => copy(error.sha256)} />
                {error.sha256}
              </div>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <div style={{ display: 'flex', marginBottom: theme.spacing(1), justifyContent: 'flex-end' }}>
                <Tooltip title={t('related')}>
                  <IconButton
                    nav={nav =>
                      nav.to().create({
                        route: '/search/:index',
                        path: { index: 'submission' },
                        search: {
                          query: `files.sha256:${error.sha256} OR results:${error.sha256}* OR errors:${error.sha256}*`
                        }
                      })
                    }
                    size="large"
                  >
                    <ViewCarouselOutlinedIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('detail')}>
                  <IconButton
                    nav={nav =>
                      nav.to().create({
                        route: '/file/detail/:id',
                        path: { id: error.sha256 }
                      })
                    }
                    size="large"
                  >
                    <DescriptionOutlinedIcon />
                  </IconButton>
                </Tooltip>
                <FileDownloader
                  link={!error ? null : `/api/v4/file/download/${error.sha256}/`}
                  tooltip={t('download')}
                />
                <Tooltip title={t('file_viewer')}>
                  <IconButton
                    nav={nav =>
                      nav.to().create(prev => ({
                        route: '/file/viewer/:id/:tab',
                        path: {
                          id: error?.sha256,
                          tab: prev.route === '/file/viewer/:id/:tab' ? prev.path.tab : null
                        }
                      }))
                    }
                    size="large"
                  >
                    <PageviewOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </div>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <label>{t('message')}</label>
              <Card variant="outlined">
                <pre
                  style={{
                    paddingLeft: theme.spacing(1),
                    paddingRight: theme.spacing(1),
                    whiteSpace: 'pre-wrap',
                    minHeight: '10rem',
                    wordBreak: 'break-word'
                  }}
                >
                  {error.response.message}
                </pre>
              </Card>
            </Grid>

            {error.response.service_debug_info && (
              <Grid size={{ xs: 12 }}>
                <label>{t('debug_info')}</label>
                <Card variant="outlined">
                  <pre
                    style={{
                      paddingLeft: theme.spacing(1),
                      paddingRight: theme.spacing(1),
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {error.response.service_debug_info}
                  </pre>
                </Card>
              </Grid>
            )}
          </Grid>
        </div>
      )}
    </PageCenter>
  ) : (
    <Navigate to="/forbidden" replace />
  );
});

AdminErrorDetailPage.displayName = 'AdminErrorDetailPage';

//*****************************************************************************************
// AdminErrorDetail Route
//*****************************************************************************************

export const AdminErrorDetailRoute = createAppRoute({
  component: AdminErrorDetailPage,
  path: '/admin/errors/:id',
  params: s => ({ id: s.string() }),

  forbidden: s => !s.user.is_admin
});
