import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import PageviewOutlinedIcon from '@mui/icons-material/PageviewOutlined';
import PanToolOutlinedIcon from '@mui/icons-material/PanToolOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import ViewCarouselOutlinedIcon from '@mui/icons-material/ViewCarouselOutlined';
import { Card, Grid, IconButton, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageCenter from 'commons/components/pages/PageCenter';
import useClipboard from 'commons/components/utils/hooks/useClipboard';
import useMyAPI from 'components/hooks/useMyAPI';
import { CustomUser } from 'components/hooks/useMyUser';
import { DEFAULT_TAB, TAB_OPTIONS } from 'components/routes/file/viewer';
import FileDownloader from 'components/visual/FileDownloader';
import Moment from 'components/visual/Moment';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsClipboard } from 'react-icons/bs';
import { Navigate } from 'react-router';
import { Link, useLocation, useParams } from 'react-router-dom';

export type Error = {
  created: string;
  id: string;
  response: {
    message: string;
    service_debug_info: string;
    service_name: string;
    service_tool_version: string;
    service_version: number | string;
    status: string;
  };
  sha256: string;
  type: string;
};

type ParamProps = {
  key?: string;
  type?: string;
  source?: string;
  name?: string;
};

type ErrorDetailProps = {
  error_key?: string;
};

const useStyles = makeStyles(theme => ({
  clipboardIcon: {
    marginRight: theme.spacing(1),
    '&:hover': {
      cursor: 'pointer',
      transform: 'scale(1.1)'
    }
  }
}));

export const ErrorDetail = ({ error_key = null }: ErrorDetailProps) => {
  const { t } = useTranslation(['adminErrorViewer']);
  const classes = useStyles();
  const theme = useTheme();
  const { copy } = useClipboard();
  const [error, setError] = useState<Error>(null);
  const { apiCall } = useMyAPI();
  const location = useLocation();
  const { key, type, source, name } = useParams<ParamProps>();
  const { user: currentUser } = useAppUser<CustomUser>();
  const downSM = useMediaQuery(theme.breakpoints.down('md'));

  const errorMap = {
    'MAX DEPTH REACHED': <PanToolOutlinedIcon style={{ color: theme.palette.action.active }} />,
    'MAX RETRY REACHED': <PanToolOutlinedIcon style={{ color: theme.palette.action.active }} />,
    EXCEPTION: <ReportProblemOutlinedIcon style={{ color: theme.palette.action.active }} />,
    'TASK PRE-EMPTED': <CancelOutlinedIcon style={{ color: theme.palette.action.active }} />,
    'SERVICE DOWN': <CancelOutlinedIcon style={{ color: theme.palette.action.active }} />,
    'SERVICE BUSY': <CancelOutlinedIcon style={{ color: theme.palette.action.active }} />,
    'MAX FILES REACHED': <PanToolOutlinedIcon style={{ color: theme.palette.action.active }} />,
    UNKNOWN: <ReportProblemOutlinedIcon style={{ color: theme.palette.action.active }} />
  };

  const fileViewerPath = useMemo<string>(() => {
    const tab = TAB_OPTIONS.find(option => location.pathname.indexOf(option) >= 0);
    if (!location.pathname.startsWith('/file/viewer') || !tab)
      return `/file/viewer/${error?.sha256}/${DEFAULT_TAB}/${location.search}${location.hash}`;
    else return `/file/viewer/${error?.sha256}/${tab}/${location.search}${location.hash}`;
  }, [error?.sha256, location.hash, location.pathname, location.search]);

  useEffect(() => {
    if ((error_key || key) && currentUser.is_admin) {
      apiCall({
        url: `/api/v4/error/${error_key || key}/`,
        onSuccess: api_data => {
          setError({ key: error_key || key, ...api_data.api_response });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error_key, key]);

  return currentUser.is_admin ? (
    <PageCenter margin={!key && !type && !name && !source ? 2 : 4} width="100%">
      {error && (
        <div
          style={{
            paddingLeft: theme.spacing(downSM ? 0 : 2),
            paddingRight: theme.spacing(downSM ? 0 : 2),
            textAlign: 'left'
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <Typography variant="h5">{error.response.service_name}</Typography>
              <Typography variant="caption">
                {error.response.service_version !== 0 &&
                  error.response.service_version !== '0' &&
                  error.response.service_version}
                {error.response.service_tool_version && ` (${error.response.service_tool_version})`}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <div style={{ display: 'inline-block', textAlign: 'start' }}>
                <Typography component="div" variant="body1">
                  <Moment variant="fromNow">{error.created}</Moment>
                </Typography>
                <Typography component="div" variant="caption">
                  <Moment format="YYYY-MM-DD HH:mm:ss">{error.created}</Moment>
                </Typography>
              </div>
            </Grid>
            <Grid item xs={12} sm={8}>
              <span style={{ verticalAlign: 'middle' }}>{errorMap[error.type]}&nbsp;</span>
              <span style={{ verticalAlign: 'middle' }}>{t(`type.${error.type}`)}</span>
            </Grid>
            <Grid item xs={12} sm={4} style={{ alignSelf: 'center' }}>
              <span style={{ verticalAlign: 'middle' }}>{t(`fail.${error.response.status}`)}</span>
            </Grid>

            <Grid item xs={12} md={8}>
              <label>{t('file_info')}</label>
              <div style={{ wordBreak: 'break-all' }}>
                <BsClipboard className={classes.clipboardIcon} onClick={() => copy(error.sha256, 'drawerTop')} />
                {error.sha256}
              </div>
            </Grid>
            <Grid item xs={12} md={4}>
              <div style={{ display: 'flex', marginBottom: theme.spacing(1), justifyContent: 'flex-end' }}>
                <Tooltip title={t('related')}>
                  <IconButton
                    component={Link}
                    to={`/search/submission?query=files.sha256:${error.sha256} OR results:${error.sha256}* OR errors:${error.sha256}*`}
                    size="large"
                  >
                    <ViewCarouselOutlinedIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('detail')}>
                  <IconButton component={Link} to={`/file/detail/${error.sha256}`} size="large">
                    <DescriptionOutlinedIcon />
                  </IconButton>
                </Tooltip>
                <FileDownloader
                  icon={<GetAppOutlinedIcon />}
                  link={`/api/v4/file/download/${error.sha256}/`}
                  tooltip={t('download')}
                />
                <Tooltip title={t('file_viewer')}>
                  <IconButton component={Link} to={fileViewerPath} size="large">
                    <PageviewOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </div>
            </Grid>

            <Grid item xs={12}>
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
              <Grid item xs={12}>
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
};

export default ErrorDetail;
