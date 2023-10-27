import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MoodBadIcon from '@mui/icons-material/MoodBad';
import OndemandVideoOutlinedIcon from '@mui/icons-material/OndemandVideoOutlined';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import ViewCarouselOutlinedIcon from '@mui/icons-material/ViewCarouselOutlined';
import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Popover,
  Skeleton,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { File } from 'components/visual/ArchiveDetail';
import CustomChip from 'components/visual/CustomChip';
import { bytesToSize } from 'helpers/utils';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { useNavigate } from 'react-router';
import { Link, useLocation } from 'react-router-dom';
import FileDownloader from '../FileDownloader';
import InputDialog from '../InputDialog';

const VERDICTS = {
  malicious: {
    className: 'malicious'
  },
  highly_suspicious: {
    className: 'highly_suspicious'
  },
  suspicious: {
    className: 'suspicious'
  },
  safe: {
    className: 'safe'
  },
  info: {
    className: 'info'
  }
};

const useStyles = makeStyles(theme => ({
  border: {
    border: `1px solid ${theme.palette.mode === 'light' ? '#AAA' : '#888'}`,
    [`&.${VERDICTS.malicious.className}`]: {
      border: `1px solid ${theme.palette.mode === 'light' ? theme.palette.error.dark : theme.palette.error.light}`
    },
    [`&.${VERDICTS.highly_suspicious.className}`]: {
      border: `1px solid ${theme.palette.mode === 'light' ? '#ff9d12' : '#ed8b00'}`
    },
    [`&.${VERDICTS.suspicious.className}`]: {
      border: `1px solid ${theme.palette.mode === 'light' ? '#ff9d12' : '#ed8b00'}`
    },
    [`&.${VERDICTS.safe.className}`]: {
      border: `1px solid ${theme.palette.mode === 'light' ? theme.palette.success.dark : theme.palette.success.light}`
    }
  },
  backgroundColor: {
    backgroundColor: '#6e6e6e15',
    [`&.${VERDICTS.malicious.className}`]: {
      backgroundColor: '#f2000015'
    },
    [`&.${VERDICTS.highly_suspicious.className}`]: {
      backgroundColor: '#ff970015'
    },
    [`&.${VERDICTS.suspicious.className}`]: {
      backgroundColor: '#ff970015'
    },
    [`&.${VERDICTS.safe.className}`]: {
      backgroundColor: '#00f20015'
    }
  },
  color: {
    color: theme.palette.mode === 'light' ? '#AAA' : '#888',
    [`&.${VERDICTS.malicious.className}`]: {
      color: theme.palette.mode === 'light' ? theme.palette.error.dark : theme.palette.error.light
    },
    [`&.${VERDICTS.highly_suspicious.className}`]: {
      color: theme.palette.mode === 'light' ? '#ff9d12' : '#ed8b00'
    },
    [`&.${VERDICTS.suspicious.className}`]: {
      color: theme.palette.mode === 'light' ? '#ff9d12' : '#ed8b00'
    },
    [`&.${VERDICTS.safe.className}`]: {
      color: theme.palette.mode === 'light' ? theme.palette.success.dark : theme.palette.success.light
    }
  },
  root: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    alignItems: 'center',
    borderRadius: theme.spacing(1),
    padding: theme.spacing(1)
  },
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto'
  },
  row: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap'
  },
  icon: {
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(4.5),
    fontSize: '400%',
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2.5),
      fontSize: '350%'
    },
    [theme.breakpoints.only('xs')]: {
      display: 'none'
    }
  },
  header: {},
  content: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, auto)',
    gridTemplateRows: 'repeat(2, auto)',
    gridAutoFlow: 'column',
    columnGap: theme.spacing(1),
    margin: `${theme.spacing(1)} 0`,
    '&:hover>div': {
      wordBreak: 'break-word',
      whiteSpace: 'wrap !important'
    },
    '&>div:nth-child(1)': {
      gridRow: 'span 2',
      fontWeight: 500
    },
    '&>div:nth-child(2n + 2)': {
      fontWeight: 500
    },
    '&>div:nth-child(2n + 3)': {
      fontWeight: 400
      // overflowX: 'hidden',
      // whiteSpace: 'nowrap',
      // textOverflow: 'ellipsis'
    },
    [theme.breakpoints.down('md')]: {
      gridAutoFlow: 'row',
      columnGap: theme.spacing(2),
      gridTemplateColumns: 'auto 1fr',
      gridTemplateRows: 'repeat(4, auto)',
      '&>div:nth-child(1)': {
        gridRow: 'span 1',
        gridColumn: 'span 2'
      }
    }
  },
  iconContainer: {
    display: 'grid',
    placeItems: 'center'
  },
  text: {
    wordBreak: 'break-word'
  }
}));

type Props = {
  sha256: string;
  file: File;
  sid?: string;
  force?: boolean;
};

const DEFAULT_LABELS = {
  attribution: [],
  technique: [],
  info: []
};

const LABELS: Record<
  keyof typeof DEFAULT_LABELS,
  { color: 'default' | 'primary' | 'error' | 'info' | 'success' | 'warning' | 'secondary' }
> = {
  attribution: { color: 'primary' },
  technique: { color: 'secondary' },
  info: { color: 'default' }
};

type Labels = Partial<Record<keyof typeof DEFAULT_LABELS, string[]>>;

const WrappedArchiveBanner: React.FC<Props> = ({ sha256 = null, file = null, sid = null, force = false }) => {
  const { t } = useTranslation(['fileDetail']);
  const theme = useTheme();
  const classes = useStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { showSuccessMessage } = useMySnackbar();
  const { user: currentUser, scoreToVerdict } = useALContext();

  const [resubmitAnchor, setResubmitAnchor] = useState<HTMLElement>(null);
  const [safelistDialog, setSafelistDialog] = useState<boolean>(false);
  const [safelistReason, setSafelistReason] = useState<string>('');
  const [waitingDialog, setWaitingDialog] = useState<boolean>(false);

  const params = new URLSearchParams(location.search);
  const fileName = file ? params.get('name') || sha256 : null;
  const popoverOpen = Boolean(resubmitAnchor);

  const { verdicts, currentVerdict } = useMemo<{
    verdicts: Record<keyof typeof VERDICTS, number>;
    currentVerdict: keyof typeof VERDICTS;
  }>(() => {
    let results = [];
    let values = {
      verdicts: { malicious: 0, highly_suspicious: 0, suspicious: 0, safe: 0, info: 0, other: 0 },
      currentVerdict: 'info' as keyof typeof VERDICTS
    };
    if (!file) return values;
    results = file?.results?.map(result => scoreToVerdict(result?.result?.score) as keyof typeof VERDICTS);
    results.forEach(item => {
      if (Object.keys(VERDICTS).includes(item)) values.verdicts[item] += 1;
    });
    let value = Object.entries(values.verdicts).find(([k, v]) => v > 0);
    values.currentVerdict = (value ? value[0] : 'info') as keyof typeof VERDICTS;
    return values;
  }, [file, scoreToVerdict]);

  const sortedLabels = useMemo<Labels>(() => {
    if (!file?.file_info?.label_categories || typeof file?.file_info?.label_categories !== 'object')
      return DEFAULT_LABELS;
    return Object.fromEntries(
      Object.keys(DEFAULT_LABELS).map(category => [
        category,
        Array.isArray(file?.file_info?.label_categories[category])
          ? file?.file_info?.label_categories[category].sort((a, b) => a.localeCompare(b))
          : []
      ])
    );
  }, [file?.file_info?.label_categories]);

  const Icon = useCallback<React.FC<{ variant: keyof typeof VERDICTS }>>(
    ({ variant }) => {
      const className = clsx(classes.icon, classes.color, VERDICTS[variant].className);
      return Object.keys(VERDICTS).includes(variant)
        ? {
            info: <HelpOutlineIcon className={className} />,
            safe: <VerifiedUserOutlinedIcon className={className} />,
            suspicious: <MoodBadIcon className={className} />,
            highly_suspicious: <MoodBadIcon className={className} />,
            malicious: <BugReportOutlinedIcon className={className} />
          }[variant]
        : null;
    },
    [classes.color, classes.icon]
  );

  const resubmit = useCallback(() => {
    apiCall({
      url: `/api/v4/submit/dynamic/${sha256}/${sid ? `?copy_sid=${sid}` : ''}`,
      onSuccess: api_data => {
        showSuccessMessage(t('resubmit.success'));
        setTimeout(() => {
          navigate(`/submission/detail/${api_data.api_response.sid}`);
        }, 500);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sha256]);

  const prepareSafelist = useCallback(() => {
    setSafelistReason('');
    setSafelistDialog(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sha256]);

  const addToSafelist = useCallback(() => {
    const data = {
      hashes: {
        md5: file.file_info.md5,
        sha1: file.file_info.sha1,
        sha256: file.file_info.sha256
      },
      file: {
        name: [],
        size: file.file_info.size,
        type: file.file_info.type
      },
      sources: [
        {
          classification: file.file_info.classification,
          name: currentUser.username,
          reason: [safelistReason],
          type: 'user'
        }
      ],
      type: 'file'
    };

    if (fileName !== sha256) {
      data.file.name.push(fileName);
    }

    apiCall({
      url: `/api/v4/safelist/`,
      method: 'PUT',
      body: data,
      onSuccess: _ => {
        setSafelistDialog(false);
        showSuccessMessage(t('safelist.success'));
      },
      onEnter: () => setWaitingDialog(true),
      onExit: () => setWaitingDialog(false)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sha256, safelistReason, file]);

  return (
    <div className={clsx(classes.root, classes.backgroundColor, classes.border, VERDICTS[currentVerdict].className)}>
      <InputDialog
        open={safelistDialog}
        handleClose={() => setSafelistDialog(false)}
        handleAccept={addToSafelist}
        handleInputChange={event => setSafelistReason(event.target.value)}
        inputValue={safelistReason}
        title={t('safelist.title')}
        cancelText={t('safelist.cancelText')}
        acceptText={t('safelist.acceptText')}
        inputLabel={t('safelist.input')}
        text={t('safelist.text')}
        waiting={waitingDialog}
      />
      {file ? (
        <Icon variant={currentVerdict} />
      ) : (
        <Skeleton className={classes.icon} variant="circular" height="2.5rem" width="2.5rem" />
      )}

      <div className={classes.container}>
        <div className={classes.row} style={{ flexDirection: 'row-reverse' }}>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            {file ? (
              <>
                <Tooltip title={t('related')}>
                  <IconButton
                    component={Link}
                    to={`/search/submission?query=files.sha256:${file.file_info.sha256} OR results:${file.file_info.sha256}* OR errors:${file.file_info.sha256}*`}
                    size="large"
                  >
                    <ViewCarouselOutlinedIcon />
                  </IconButton>
                </Tooltip>
                {currentUser.roles.includes('file_download') && (
                  <FileDownloader
                    icon={<GetAppOutlinedIcon />}
                    link={`/api/v4/file/download/${file.file_info.sha256}/?${
                      fileName && file.file_info.sha256 !== fileName ? `name=${fileName}&` : ''
                    }${sid ? `sid=${sid}&` : ''}`}
                    tooltip={t('download')}
                  />
                )}
                {currentUser.roles.includes('submission_create') && (
                  <>
                    <Tooltip title={t('resubmit')}>
                      <IconButton onClick={event => setResubmitAnchor(event.currentTarget)} size="large">
                        <ReplayOutlinedIcon />
                        {popoverOpen ? (
                          <ExpandLessIcon style={{ position: 'absolute', right: 0, bottom: 10, fontSize: 'medium' }} />
                        ) : (
                          <ExpandMoreIcon style={{ position: 'absolute', right: 0, bottom: 10, fontSize: 'medium' }} />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Popover
                      open={popoverOpen}
                      anchorEl={resubmitAnchor}
                      onClose={() => setResubmitAnchor(null)}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right'
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right'
                      }}
                    >
                      <List disablePadding>
                        <ListItem
                          button
                          component={Link}
                          to="/submit"
                          state={{
                            hash: file.file_info.sha256,
                            tabContext: '1',
                            c12n: file.file_info.classification
                          }}
                          dense
                          onClick={() => setResubmitAnchor(null)}
                        >
                          <ListItemIcon style={{ minWidth: theme.spacing(4.5) }}>
                            <TuneOutlinedIcon />
                          </ListItemIcon>
                          <ListItemText primary={t('resubmit.modify')} />
                        </ListItem>
                        <ListItem button dense onClick={resubmit}>
                          <ListItemIcon style={{ minWidth: theme.spacing(4.5) }}>
                            <OndemandVideoOutlinedIcon />
                          </ListItemIcon>
                          <ListItemText primary={t('resubmit.dynamic')} />
                        </ListItem>
                      </List>
                    </Popover>
                  </>
                )}
                {currentUser.roles.includes('safelist_manage') && (
                  <Tooltip title={t('safelist')}>
                    <IconButton onClick={prepareSafelist} size="large">
                      <PlaylistAddCheckIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </>
            ) : (
              <div style={{ display: 'inline-flex' }}>
                {[...Array(5)].map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="circular"
                    height="2.5rem"
                    width="2.5rem"
                    style={{ margin: theme.spacing(0.5) }}
                  />
                ))}
              </div>
            )}
          </div>
          <div style={{ flex: 1 }} />
          <Typography
            className={clsx(classes.text, classes.color, VERDICTS[currentVerdict].className)}
            children={t(`file.${file ? currentVerdict : 'none'}`)}
            variant="h4"
          />
        </div>
        <div>
          <Typography
            className={classes.text}
            gridColumn="span 2"
            variant="body1"
            children={file ? file?.file_info?.sha256 : <Skeleton style={{ width: '50%' }} />}
          />
        </div>

        <div className={classes.content}>
          <div>
            {!file ? (
              <>
                <Skeleton />
                <Skeleton />
              </>
            ) : verdicts && ['malicious', 'highly_suspicious', 'suspicious'].includes(currentVerdict) ? (
              <>
                <div className={clsx(classes.color, VERDICTS.malicious.className)}>
                  {`${verdicts.malicious} ${t(`file.result${verdicts.malicious > 1 ? 's' : ''}.malicious`)}`}
                </div>
                <div className={clsx(classes.color, VERDICTS.suspicious.className)}>
                  {`${verdicts.suspicious + verdicts.highly_suspicious} ${t(
                    `file.result${verdicts.suspicious + verdicts.highly_suspicious > 1 ? 's' : ''}.suspicious`
                  )}`}
                </div>
              </>
            ) : (
              <div className={clsx(classes.color, VERDICTS.safe.className)}>{t('file.result.info')}</div>
            )}
          </div>
          <div>{t('type')}</div>
          <div>{file ? `${file?.file_info?.type}` : <Skeleton />}</div>
          <div>{t('size')}</div>
          <div>{file ? `${bytesToSize(file?.file_info?.size)}` : <Skeleton />}</div>
          <div>{t('seen.last')}</div>
          <div>{file ? <Moment fromNow>{file?.file_info?.seen?.last}</Moment> : <Skeleton />}</div>
        </div>

        <div>
          {sortedLabels &&
            Object.keys(sortedLabels)?.map(category =>
              sortedLabels[category]?.map((label, i) => (
                <CustomChip
                  key={i}
                  wrap
                  variant="outlined"
                  size="tiny"
                  type="rounded"
                  color={category in LABELS ? LABELS[category].color : 'primary'}
                  label={label}
                  style={{ height: 'auto', minHeight: '20px' }}
                />
              ))
            )}
        </div>
      </div>
    </div>
  );
};

const ArchiveBanner = React.memo(WrappedArchiveBanner);
export default ArchiveBanner;
