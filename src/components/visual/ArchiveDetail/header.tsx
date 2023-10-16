import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MoodBadIcon from '@mui/icons-material/MoodBad';
import OndemandVideoOutlinedIcon from '@mui/icons-material/OndemandVideoOutlined';
import PageviewOutlinedIcon from '@mui/icons-material/PageviewOutlined';
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
import { Error } from 'components/visual/ErrorCard';
import { VerdictDoughnut } from 'components/visual/Graph';
import { bytesToSize } from 'helpers/utils';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { useNavigate } from 'react-router';
import { Link, useLocation } from 'react-router-dom';
import AutoHideTagList from '../AutoHideTagList';
import FileDownloader from '../FileDownloader';

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

const useStyles = makeStyles(theme => {
  const isLight = theme.palette.mode === 'light';

  const colors = {
    info: {
      bgColor: '#6e6e6e15',
      textColor: isLight ? '#AAA' : '#888'
    },
    safe: {
      bgColor: '#00f20015',
      textColor: isLight ? theme.palette.success.dark : theme.palette.success.light
    },
    suspicious: {
      bgColor: '#ff970015',
      textColor: isLight ? '#ff9d12' : '#ed8b00'
      // textColor: isLight ? theme.palette.warning.dark : theme.palette.warning.light
    },
    highly_suspicious: {
      bgColor: '#ff970015',
      textColor: isLight ? '#ff9d12' : '#ed8b00'
      // textColor: isLight ? theme.palette.warning.dark : theme.palette.warning.light
    },
    malicious: {
      bgColor: '#f2000015',
      textColor: isLight ? theme.palette.error.dark : theme.palette.error.light
    }
  };

  return {
    root: {
      display: 'flex',
      flexDirection: 'row',
      columnGap: theme.spacing(2),
      marginBottom: theme.spacing(2)
    },

    container: {
      flex: 1,
      borderRadius: theme.spacing(0.5),
      marginBottom: theme.spacing(0.25),
      overflow: 'hidden',
      border: `1px solid ${colors.info.textColor}`,
      backgroundColor: colors.info.bgColor,
      [`&.${VERDICTS.malicious.className}`]: {
        border: `1px solid ${colors.malicious.textColor}`,
        backgroundColor: colors.malicious.bgColor
      },
      [`&.${VERDICTS.highly_suspicious.className}`]: {
        border: `1px solid ${colors.highly_suspicious.textColor}`,
        backgroundColor: colors.highly_suspicious.bgColor
      },
      [`&.${VERDICTS.suspicious.className}`]: {
        border: `1px solid ${colors.suspicious.textColor}`,
        backgroundColor: colors.suspicious.bgColor
      },
      [`&.${VERDICTS.safe.className}`]: {
        border: `1px solid ${colors.safe.textColor}`,
        backgroundColor: colors.safe.bgColor
      }
    },
    header: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: theme.spacing(1),
      padding: theme.spacing(1),
      textTransform: 'capitalize',
      color: colors.info.textColor,
      backgroundColor: colors.info.bgColor,
      [`&.${VERDICTS.malicious.className}`]: {
        color: colors.malicious.textColor,
        backgroundColor: colors.malicious.bgColor
      },
      [`&.${VERDICTS.highly_suspicious.className}`]: {
        color: colors.highly_suspicious.textColor,
        backgroundColor: colors.highly_suspicious.bgColor
      },
      [`&.${VERDICTS.suspicious.className}`]: {
        color: colors.suspicious.textColor,
        backgroundColor: colors.suspicious.bgColor
      },
      [`&.${VERDICTS.safe.className}`]: {
        color: colors.safe.textColor,
        backgroundColor: colors.safe.bgColor
      }
    },
    content: {
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      columnGap: theme.spacing(2),
      padding: theme.spacing(1)
    },
    icon: {
      // marginLeft: theme.spacing(),
      // marginRight: theme.spacing(4.5),
      fontSize: '300%',
      [theme.breakpoints.only('xs')]: {
        // marginLeft: theme.spacing(2),
        // marginRight: theme.spacing(2.5),
        fontSize: '100%'
      }
    },
    title: {
      display: 'flex',
      alignItems: 'center'
    },
    label: {
      fontWeight: 500,
      marginRight: theme.spacing(0.5)
    },
    doughnut: {
      position: 'relative',
      display: 'flex'
    },
    verdictContainer: {
      width: '100%',
      height: '100%',
      position: 'absolute',
      display: 'grid',
      placeItems: 'center'
    },
    verdictItems: {
      display: 'grid',
      gridTemplateColumns: 'repeat(1fr, 3)',
      justifyItems: 'center',
      columnGap: theme.spacing(1)
    },
    maliciousText: {
      color: isLight ? theme.palette.error.light : theme.palette.error.dark
    },
    suspiciousText: {
      color: isLight ? theme.palette.warning.light : theme.palette.warning.dark
    },
    infoText: {
      color: colors.info.textColor
    },
    chip: {}
  };
});

type Props = {
  sha256: string;
  file: File;
  sid?: string;
  liveResultKeys?: string[];
  liveErrors?: Error[];
  force?: boolean;
};

const WrappedHeader: React.FC<Props> = ({
  sha256 = null,
  file = null,
  sid = null,
  liveResultKeys = null,
  liveErrors = null,
  force = false
}) => {
  const { t } = useTranslation(['fileDetail']);
  const theme = useTheme();
  const classes = useStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { showSuccessMessage } = useMySnackbar();
  const { user: currentUser, c12nDef, scoreToVerdict } = useALContext();

  const [resubmitAnchor, setResubmitAnchor] = useState<HTMLElement>(null);
  const [safelistDialog, setSafelistDialog] = useState<boolean>(false);
  const [safelistReason, setSafelistReason] = useState<string>('');
  const [waitingDialog, setWaitingDialog] = useState<boolean>(false);

  const params = new URLSearchParams(location.search);
  const fileName = file ? params.get('name') || sha256 : null;
  const popoverOpen = Boolean(resubmitAnchor);

  const resultVerdicts = useMemo<(keyof typeof VERDICTS)[]>(
    () => (!file ? null : file?.results?.map(result => scoreToVerdict(result?.result?.score) as keyof typeof VERDICTS)),
    [file, scoreToVerdict]
  );

  const verdicts = useMemo<Record<keyof typeof VERDICTS, number>>(() => {
    if (!resultVerdicts) return null;
    let values = { malicious: 0, highly_suspicious: 0, suspicious: 0, safe: 0, info: 0, other: 0 };
    resultVerdicts.forEach(item => {
      if (Object.keys(VERDICTS).includes(item)) values[item] += 1;
    });
    return values;
  }, [resultVerdicts]);

  const fileVerdict = useMemo<keyof typeof VERDICTS>(() => {
    if (!verdicts) return 'info';
    const value = Object.entries(verdicts).find(([k, v]) => v > 0);
    if (!value) return 'info';
    return value[0] as keyof typeof VERDICTS;
  }, [verdicts]);

  const Icon = useCallback<React.FC<{ variant: keyof typeof VERDICTS }>>(
    ({ variant }) =>
      Object.keys(VERDICTS).includes(variant)
        ? {
            icon: <HelpOutlineIcon className={classes.icon} />,
            safe: <VerifiedUserOutlinedIcon className={classes.icon} />,
            suspicious: <MoodBadIcon className={classes.icon} />,
            highly_suspicious: <MoodBadIcon className={classes.icon} />,
            malicious: <BugReportOutlinedIcon className={classes.icon} />
          }[variant]
        : null,
    [classes.icon]
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
    <div className={classes.root}>
      <VerdictDoughnut verdicts={verdicts} />
      <div className={clsx(classes.container, VERDICTS[fileVerdict].className)}>
        <div className={clsx(classes.header, VERDICTS[fileVerdict].className)}>
          <Icon variant={fileVerdict} />
          <Typography children={`${fileVerdict} File`} noWrap variant="h4" sx={{ flex: 1 }} />
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
              {currentUser.roles.includes('file_detail') && (
                <Tooltip title={t('file_viewer')}>
                  <IconButton component={Link} to={`/file/viewer/${file.file_info.sha256}`} size="large">
                    <PageviewOutlinedIcon />
                  </IconButton>
                </Tooltip>
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
        <div className={classes.content}>
          <Typography
            fontWeight={500}
            gridColumn="span 2"
            marginBottom={1}
            noWrap
            variant="body1"
            children={file?.file_info?.sha256}
          />
          <div style={{ fontWeight: 500 }}>{t('type')}</div>
          <div>{`${file?.file_info?.type}`}</div>
          <div style={{ fontWeight: 500 }}>{t('size')}</div>
          <div>{`${bytesToSize(file?.file_info?.size)}`}</div>
          <div style={{ fontWeight: 500 }}>{t('seen.last')}</div>
          <div>
            <Moment fromNow>{file?.file_info?.seen?.last}</Moment>
          </div>
          <div style={{ marginTop: theme.spacing(1), gridColumn: 'span 2' }}>
            {file &&
              Object.entries(file?.tags)
                .filter(([k, v]) => k.includes('attribution'))
                .map(([tag_type, items]: [string, any[]], i) => (
                  <AutoHideTagList
                    key={i}
                    tag_type={tag_type}
                    items={items.map(item => ({
                      value: item[0],
                      lvl: item[1],
                      safelisted: item[2],
                      classification: item[3]
                    }))}
                    force={force}
                  />
                ))}
          </div>
        </div>
      </div>
    </div>
  );

  // return (
  //   <>
  //     <InputDialog
  //       open={safelistDialog}
  //       handleClose={() => setSafelistDialog(false)}
  //       handleAccept={addToSafelist}
  //       handleInputChange={event => setSafelistReason(event.target.value)}
  //       inputValue={safelistReason}
  //       title={t('safelist.title')}
  //       cancelText={t('safelist.cancelText')}
  //       acceptText={t('safelist.acceptText')}
  //       inputLabel={t('safelist.input')}
  //       text={t('safelist.text')}
  //       waiting={waitingDialog}
  //     />
  //     {c12nDef.enforce && (
  //       <div style={{ paddingBottom: theme.spacing(4), paddingTop: theme.spacing(4) }}>
  //         <Classification size="tiny" c12n={file ? file.file_info.classification : null} />
  //       </div>
  //     )}
  //     <div style={{ paddingBottom: theme.spacing(4) }}>
  //       <Grid container alignItems="center">
  //         <Grid item xs>
  //           <Typography variant="h4">{t('title')}</Typography>
  //           <Typography variant="caption" style={{ wordBreak: 'break-word' }}>
  //             {file ? fileName : <Skeleton style={{ width: '10rem' }} />}
  //           </Typography>
  //         </Grid>
  //         <Grid item xs={12} sm={12} md={4} style={{ display: 'flex', justifyContent: 'flex-end', flexGrow: 0 }}>
  //           {file ? (
  //             <>
  //               <Tooltip title={t('related')}>
  //                 <IconButton
  //                   component={Link}
  //                   to={`/search/submission?query=files.sha256:${file.file_info.sha256} OR results:${file.file_info.sha256}* OR errors:${file.file_info.sha256}*`}
  //                   size="large"
  //                 >
  //                   <ViewCarouselOutlinedIcon />
  //                 </IconButton>
  //               </Tooltip>
  //               {currentUser.roles.includes('file_download') && (
  //                 <FileDownloader
  //                   icon={<GetAppOutlinedIcon />}
  //                   link={`/api/v4/file/download/${file.file_info.sha256}/?${
  //                     fileName && file.file_info.sha256 !== fileName ? `name=${fileName}&` : ''
  //                   }${sid ? `sid=${sid}&` : ''}`}
  //                   tooltip={t('download')}
  //                 />
  //               )}
  //               {currentUser.roles.includes('file_detail') && (
  //                 <Tooltip title={t('file_viewer')}>
  //                   <IconButton component={Link} to={`/file/viewer/${file.file_info.sha256}`} size="large">
  //                     <PageviewOutlinedIcon />
  //                   </IconButton>
  //                 </Tooltip>
  //               )}
  //               {currentUser.roles.includes('submission_create') && (
  //                 <>
  //                   <Tooltip title={t('resubmit')}>
  //                     <IconButton onClick={event => setResubmitAnchor(event.currentTarget)} size="large">
  //                       <ReplayOutlinedIcon />
  //                       {popoverOpen ? (
  //                         <ExpandLessIcon style={{ position: 'absolute', right: 0, bottom: 10, fontSize: 'medium' }} />
  //                       ) : (
  //                         <ExpandMoreIcon style={{ position: 'absolute', right: 0, bottom: 10, fontSize: 'medium' }} />
  //                       )}
  //                     </IconButton>
  //                   </Tooltip>
  //                   <Popover
  //                     open={popoverOpen}
  //                     anchorEl={resubmitAnchor}
  //                     onClose={() => setResubmitAnchor(null)}
  //                     anchorOrigin={{
  //                       vertical: 'bottom',
  //                       horizontal: 'right'
  //                     }}
  //                     transformOrigin={{
  //                       vertical: 'top',
  //                       horizontal: 'right'
  //                     }}
  //                   >
  //                     <List disablePadding>
  //                       <ListItem
  //                         button
  //                         component={Link}
  //                         to="/submit"
  //                         state={{
  //                           hash: file.file_info.sha256,
  //                           tabContext: '1',
  //                           c12n: file.file_info.classification
  //                         }}
  //                         dense
  //                         onClick={() => setResubmitAnchor(null)}
  //                       >
  //                         <ListItemIcon style={{ minWidth: theme.spacing(4.5) }}>
  //                           <TuneOutlinedIcon />
  //                         </ListItemIcon>
  //                         <ListItemText primary={t('resubmit.modify')} />
  //                       </ListItem>
  //                       <ListItem button dense onClick={resubmit}>
  //                         <ListItemIcon style={{ minWidth: theme.spacing(4.5) }}>
  //                           <OndemandVideoOutlinedIcon />
  //                         </ListItemIcon>
  //                         <ListItemText primary={t('resubmit.dynamic')} />
  //                       </ListItem>
  //                     </List>
  //                   </Popover>
  //                 </>
  //               )}
  //               {currentUser.roles.includes('safelist_manage') && (
  //                 <Tooltip title={t('safelist')}>
  //                   <IconButton onClick={prepareSafelist} size="large">
  //                     <PlaylistAddCheckIcon />
  //                   </IconButton>
  //                 </Tooltip>
  //               )}
  //             </>
  //           ) : (
  //             <div style={{ display: 'inline-flex' }}>
  //               {[...Array(5)].map((_, i) => (
  //                 <Skeleton
  //                   key={i}
  //                   variant="circular"
  //                   height="2.5rem"
  //                   width="2.5rem"
  //                   style={{ margin: theme.spacing(0.5) }}
  //                 />
  //               ))}
  //             </div>
  //           )}
  //         </Grid>
  //       </Grid>
  //     </div>
  //   </>
  // );
};

const Header = React.memo(WrappedHeader);
export default Header;
