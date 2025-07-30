import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MoodBadIcon from '@mui/icons-material/MoodBad';
import OndemandVideoOutlinedIcon from '@mui/icons-material/OndemandVideoOutlined';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import ViewCarouselOutlinedIcon from '@mui/icons-material/ViewCarouselOutlined';
import type { SvgIconProps, Theme } from '@mui/material';
import {
  Box,
  Collapse,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Skeleton,
  styled,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { LabelCategories } from 'components/models/base/file';
import type { File } from 'components/models/ui/file';
import { FileDownloader } from 'components/visual/Buttons/FileDownloader';
import Classification from 'components/visual/Classification';
import CustomChip from 'components/visual/CustomChip';
import InputDialog from 'components/visual/InputDialog';
import Moment from 'components/visual/Moment';
import { bytesToSize } from 'helpers/utils';
import type { CSSProperties } from 'react';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { Link } from 'react-router-dom';

const VERDICTS = {
  malicious: { className: 'malicious' },
  highly_suspicious: { className: 'highly_suspicious' },
  suspicious: { className: 'suspicious' },
  safe: { className: 'safe' },
  info: { className: 'info' }
};

const getColor = (variant: keyof typeof VERDICTS, theme: Theme): CSSProperties => {
  switch (variant) {
    case 'safe':
      return { color: theme.palette.mode === 'light' ? theme.palette.success.dark : theme.palette.success.light };
    case 'suspicious':
      return { color: theme.palette.mode === 'light' ? '#ff9d12' : '#ed8b00' };
    case 'highly_suspicious':
      return { color: theme.palette.mode === 'light' ? '#ff9d12' : '#ed8b00' };
    case 'malicious':
      return { color: theme.palette.mode === 'light' ? theme.palette.error.dark : theme.palette.error.light };
    default:
      return { color: theme.palette.mode === 'light' ? '#AAA' : '#888' };
  }
};

const getBackgroundColor = (variant: keyof typeof VERDICTS, theme: Theme): CSSProperties => {
  switch (variant) {
    case 'safe':
      return { backgroundColor: '#00f20015' };
    case 'suspicious':
      return { backgroundColor: '#ff970015' };
    case 'highly_suspicious':
      return { backgroundColor: '#ff970015' };
    case 'malicious':
      return { backgroundColor: '#f2000015' };
    default:
      return { backgroundColor: '#6e6e6e15' };
  }
};

const getBorderColor = (variant: keyof typeof VERDICTS, theme: Theme): CSSProperties => {
  switch (variant) {
    case 'safe':
      return {
        border: `1px solid ${theme.palette.mode === 'light' ? theme.palette.success.dark : theme.palette.success.light}`
      };
    case 'suspicious':
      return { border: `1px solid ${theme.palette.mode === 'light' ? '#ff9d12' : '#ed8b00'}` };
    case 'highly_suspicious':
      return { border: `1px solid ${theme.palette.mode === 'light' ? '#ff9d12' : '#ed8b00'}` };
    case 'malicious':
      return {
        border: `1px solid ${theme.palette.mode === 'light' ? theme.palette.error.dark : theme.palette.error.light}`
      };
    default:
      return { border: `1px solid ${theme.palette.mode === 'light' ? '#AAA' : '#888'}` };
  }
};

type IconProps = SvgIconProps & { variant: keyof typeof VERDICTS };

const Icon = memo(
  styled(({ variant, ...props }: IconProps) => {
    switch (variant) {
      case 'info':
        return <HelpOutlineIcon {...props} />;
      case 'safe':
        return <VerifiedUserOutlinedIcon {...props} />;
      case 'suspicious':
        return <MoodBadIcon {...props} />;
      case 'highly_suspicious':
        return <MoodBadIcon {...props} />;
      case 'malicious':
        return <BugReportOutlinedIcon {...props} />;
      default:
        return null;
    }
  })<IconProps>(({ theme, variant }) => ({
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
    },

    ...getColor(variant, theme)
  }))
);

const LABELS: Record<
  keyof LabelCategories,
  { color: 'default' | 'primary' | 'error' | 'info' | 'success' | 'warning' | 'secondary' }
> = {
  attribution: { color: 'primary' },
  technique: { color: 'secondary' },
  info: { color: 'default' }
};

type Props = {
  sha256: string;
  file: File;
  sid?: string;
  force?: boolean;
};

const WrappedArchiveBanner: React.FC<Props> = ({ sha256 = null, file = null, sid = null, force = false }) => {
  const { t } = useTranslation(['fileDetail', 'archive']);
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { showSuccessMessage } = useMySnackbar();
  const { user: currentUser, scoreToVerdict } = useALContext();

  const [resubmitAnchor, setResubmitAnchor] = useState<HTMLElement>(null);
  const [safelistDialog, setSafelistDialog] = useState<boolean>(false);
  const [safelistReason, setSafelistReason] = useState<string>('');
  const [badlistDialog, setBadlistDialog] = useState<boolean>(false);
  const [badlistReason, setBadlistReason] = useState<string>('');
  const [waitingDialog, setWaitingDialog] = useState<boolean>(false);
  const [showMoreLabels, setShowMoreLabels] = useState<boolean>(false);
  const [collapseLabels, setCollapseLabels] = useState<boolean>(false);

  const params = new URLSearchParams(location.search);
  const fileName = file ? params.get('name') || sha256 : null;
  const popoverOpen = Boolean(resubmitAnchor);

  const ref = useRef<HTMLDivElement>(null);

  const isURI = useMemo<boolean>(() => file?.file_info?.type.startsWith('uri/'), [file?.file_info?.type]);

  const { verdicts, currentVerdict } = useMemo<{
    verdicts: Record<keyof typeof VERDICTS, number>;
    currentVerdict: keyof typeof VERDICTS;
  }>(() => {
    let results = [];
    const values = {
      verdicts: { malicious: 0, highly_suspicious: 0, suspicious: 0, safe: 0, info: 0, other: 0 },
      currentVerdict: 'info' as keyof typeof VERDICTS
    };
    if (!file) return values;
    results = file?.results?.map(result => scoreToVerdict(result?.result?.score) as keyof typeof VERDICTS);
    results.forEach(item => {
      if (Object.keys(VERDICTS).includes(item)) values.verdicts[item] += 1;
    });
    const value = Object.entries(values.verdicts).find(([k, v]) => v > 0);
    values.currentVerdict = (value ? value[0] : 'info') as keyof typeof VERDICTS;
    return values;
  }, [file, scoreToVerdict]);

  const labels = useMemo<{ category: string; label: string }[]>(
    () =>
      file?.file_info?.label_categories &&
      ['attribution', 'technique', 'info'].flatMap(
        category =>
          category in file?.file_info?.label_categories &&
          file?.file_info?.label_categories[category]
            .sort((a: string, b: string) => a.valueOf().localeCompare(b.valueOf()))
            .map(label => ({ category, label }))
      ),
    [file?.file_info?.label_categories]
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

  const prepareBadlist = useCallback(() => {
    setBadlistReason('');
    setBadlistDialog(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sha256]);

  const addToBadlist = useCallback(() => {
    const data = {
      attribution: {
        actor: (file.tags['attribution.actor'] || []).map(item => item[0]),
        campaign: (file.tags['attribution.campaign'] || []).map(item => item[0]),
        category: (file.tags['attribution.category'] || []).map(item => item[0]),
        exploit: (file.tags['attribution.exploit'] || []).map(item => item[0]),
        implant: (file.tags['attribution.implant'] || []).map(item => item[0]),
        family: (file.tags['attribution.family'] || []).map(item => item[0]),
        network: (file.tags['attribution.network'] || []).map(item => item[0])
      },
      hashes: {
        md5: file.file_info.md5,
        sha1: file.file_info.sha1,
        sha256: file.file_info.sha256,
        ssdeep: file.file_info.ssdeep,
        tlsh: file.file_info.tlsh
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
          reason: [badlistReason],
          type: 'user'
        }
      ],
      type: 'file'
    };

    if (fileName !== sha256) {
      data.file.name.push(fileName);
    }

    apiCall({
      url: `/api/v4/badlist/`,
      method: 'PUT',
      body: data,
      onSuccess: _ => {
        setBadlistDialog(false);
        showSuccessMessage(t('badlist.success'));
      },
      onEnter: () => setWaitingDialog(true),
      onExit: () => setWaitingDialog(false)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sha256, badlistReason, file]);

  const [initiated, setInitiated] = useState<boolean>(false);

  const initiate = useCallback(() => {
    if (!ref.current) setTimeout(() => initiate(), 100);
    else setInitiated(true);
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element || !initiated) {
      initiate();
      return;
    }

    setShowMoreLabels(element.clientHeight > 30);

    const resizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
        setShowMoreLabels(entry.contentRect.height > 30);
      });
    });
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
      setInitiated(false);
    };
  }, [initiate, initiated, sha256]);

  return (
    <div
      style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        alignItems: 'center',
        borderRadius: theme.spacing(1),
        padding: theme.spacing(1),

        ...getBackgroundColor(currentVerdict, theme),
        ...getBorderColor(currentVerdict, theme)
      }}
    >
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
        extra={
          <Classification
            size="tiny"
            type="outlined"
            c12n={file?.file_info?.classification ? file.file_info.classification : null}
          />
        }
      />
      <InputDialog
        open={badlistDialog}
        handleClose={() => setBadlistDialog(false)}
        handleAccept={addToBadlist}
        handleInputChange={event => setBadlistReason(event.target.value)}
        inputValue={badlistReason}
        title={t('badlist.title')}
        cancelText={t('badlist.cancelText')}
        acceptText={t('badlist.acceptText')}
        inputLabel={t('badlist.input')}
        text={t('badlist.text')}
        waiting={waitingDialog}
        extra={
          <Classification
            size="tiny"
            type="outlined"
            c12n={file?.file_info?.classification ? file.file_info.classification : null}
          />
        }
      />
      {file ? (
        <Icon variant={currentVerdict} />
      ) : (
        <Skeleton
          variant="circular"
          height="2.5rem"
          width="2.5rem"
          sx={{
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
          }}
        />
      )}

      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto'
        }}
      >
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'flex-start',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ flex: 1 }}>
            <Typography
              children={
                !file ? (
                  <Skeleton style={{ width: '100%' }} />
                ) : (
                  t(`${isURI ? 'uri' : 'file'}.${file ? currentVerdict : 'none'}`, { ns: 'archive' })
                )
              }
              variant="h4"
              sx={{
                flex: 1,
                whiteSpace: 'nowrap',
                marginRight: theme.spacing(2),
                wordBreak: 'break-word',
                ...getColor(currentVerdict, theme)
              }}
            />
            <Typography
              variant="body2"
              children={
                !file ? (
                  <Skeleton style={{ width: '50%' }} />
                ) : isURI ? (
                  file?.file_info?.uri_info?.uri
                ) : (
                  file?.file_info?.sha256
                )
              }
              sx={{ wordBreak: 'break-word' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
            {file ? (
              <>
                <Tooltip title={t('related')}>
                  <IconButton
                    component={Link}
                    to={`/search/submission?query=files.sha256:${file.file_info.sha256} OR results:${file.file_info.sha256}* OR errors:${file.file_info.sha256}*&use_archive`}
                    size="large"
                  >
                    <ViewCarouselOutlinedIcon />
                  </IconButton>
                </Tooltip>
                <FileDownloader
                  link={`/api/v4/file/download/${file.file_info.sha256}/?${
                    fileName && file.file_info.sha256 !== fileName ? `name=${fileName}&` : ''
                  }${sid ? `sid=${sid}&` : ''}`}
                  tooltip={t('download')}
                  preventRender={!currentUser.roles.includes('archive_download')}
                />
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
                        <ListItemButton
                          component={Link}
                          to={`/submit?hash=${file.file_info.sha256}`}
                          state={{
                            c12n: file.file_info.classification
                          }}
                          dense
                          onClick={() => setResubmitAnchor(null)}
                        >
                          <ListItemIcon style={{ minWidth: theme.spacing(4.5) }}>
                            <TuneOutlinedIcon />
                          </ListItemIcon>
                          <ListItemText primary={t('resubmit.modify')} />
                        </ListItemButton>
                        <ListItemButton dense onClick={resubmit}>
                          <ListItemIcon style={{ minWidth: theme.spacing(4.5) }}>
                            <OndemandVideoOutlinedIcon />
                          </ListItemIcon>
                          <ListItemText primary={t('resubmit.dynamic')} />
                        </ListItemButton>
                      </List>
                    </Popover>
                  </>
                )}
                {currentUser.roles.includes('safelist_manage') && (
                  <Tooltip title={t('safelist')}>
                    <IconButton onClick={prepareSafelist} size="large">
                      <VerifiedUserOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {currentUser.roles.includes('badlist_manage') && (
                  <Tooltip title={t('badlist')}>
                    <IconButton onClick={prepareBadlist} size="large">
                      <BugReportOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </>
            ) : (
              <div style={{ display: 'inline-flex' }}>
                {Array.from({ length: 5 }).map((_, i) => (
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
        </div>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '3fr repeat(3, auto)',
            gridTemplateRows: 'repeat(2, auto)',
            gridAutoFlow: 'column',
            columnGap: theme.spacing(4),
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
          }}
        >
          <div>
            {!file ? (
              <>
                <Skeleton />
                <Skeleton />
              </>
            ) : verdicts && ['malicious', 'highly_suspicious', 'suspicious'].includes(currentVerdict) ? (
              <>
                <div style={{ ...getColor('malicious', theme) }}>
                  {`${verdicts.malicious} ${t(
                    `${isURI ? 'uri' : 'file'}.result${verdicts.malicious > 1 ? 's' : ''}.malicious`,
                    {
                      ns: 'archive'
                    }
                  )}`}
                </div>
                <div style={{ ...getColor('suspicious', theme) }}>
                  {`${verdicts.suspicious + verdicts.highly_suspicious} ${t(
                    `${isURI ? 'uri' : 'file'}.result${
                      verdicts.suspicious + verdicts.highly_suspicious > 1 ? 's' : ''
                    }.suspicious`,
                    {
                      ns: 'archive'
                    }
                  )}`}
                </div>
              </>
            ) : (
              <div style={{ ...getColor('safe', theme) }}>
                {t(`${isURI ? 'uri' : 'file'}.result.info`, {
                  ns: 'archive'
                })}
              </div>
            )}
          </div>
          <div>{t('type')}</div>
          <div>{file ? `${file?.file_info?.type}` : <Skeleton />}</div>
          {!isURI && (
            <>
              <div>{t('size')}</div>
              <div>{file ? `${bytesToSize(file?.file_info?.size)}` : <Skeleton />}</div>
            </>
          )}
          <div>{t('seen.last')}</div>
          <div>{file ? <Moment variant="fromNow">{file?.file_info?.seen?.last}</Moment> : <Skeleton />}</div>
        </Box>

        {labels?.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'row', gap: theme.spacing(1) }}>
            <Collapse in={collapseLabels} timeout="auto" style={{ flex: 1 }} collapsedSize={27}>
              <div ref={ref}>
                {labels.map(({ category, label }, j) => (
                  <CustomChip
                    key={`${j}`}
                    wrap
                    variant="outlined"
                    size="tiny"
                    type="rounded"
                    color={category in LABELS ? LABELS[category].color : 'primary'}
                    label={label}
                    style={{ height: 'auto', minHeight: '20px' }}
                  />
                ))}
              </div>
            </Collapse>
            <div style={{ visibility: showMoreLabels ? 'visible' : 'hidden' }}>
              <Tooltip title={showMoreLabels ? t('show_more', { ns: 'archive' }) : t('show_less', { ns: 'archive' })}>
                <IconButton size="large" onClick={() => setCollapseLabels(v => !v)} style={{ padding: 0 }}>
                  {!collapseLabels ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                </IconButton>
              </Tooltip>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const ArchiveBanner = React.memo(WrappedArchiveBanner);
export default ArchiveBanner;
