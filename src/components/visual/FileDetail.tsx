import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import OndemandVideoOutlinedIcon from '@mui/icons-material/OndemandVideoOutlined';
import PageviewOutlinedIcon from '@mui/icons-material/PageviewOutlined';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import ViewCarouselOutlinedIcon from '@mui/icons-material/ViewCarouselOutlined';
import {
  Grid,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Skeleton,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { useAppUser } from 'commons/components/app/hooks';
import useALContext from 'components/hooks/useALContext';
import useAssistant from 'components/hooks/useAssistant';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { Error } from 'components/models/base/error';
import type { Submission } from 'components/models/base/submission';
import type { File } from 'components/models/ui/file';
import type { CustomUser } from 'components/models/ui/user';
import ForbiddenPage from 'components/routes/403';
import { DEFAULT_TAB, TAB_OPTIONS } from 'components/routes/file/viewer';
import HeuristicDetail from 'components/routes/manage/heuristic_detail';
import SignatureDetail from 'components/routes/manage/signature_detail';
import AISummarySection from 'components/routes/submission/detail/ai_summary';
import Classification from 'components/visual/Classification';
import AttackSection from 'components/visual/FileDetail/attacks';
import ChildrenSection from 'components/visual/FileDetail/childrens';
import Detection from 'components/visual/FileDetail/detection';
import EmptySection from 'components/visual/FileDetail/emptys';
import ErrorSection from 'components/visual/FileDetail/errors';
import FrequencySection from 'components/visual/FileDetail/frequency';
import IdentificationSection from 'components/visual/FileDetail/ident';
import MetadataSection from 'components/visual/FileDetail/metadata';
import ParentSection from 'components/visual/FileDetail/parents';
import ResultSection from 'components/visual/FileDetail/results';
import TagSection from 'components/visual/FileDetail/tags';
import URIIdentificationSection from 'components/visual/FileDetail/uriIdent';
import FileDownloader from 'components/visual/FileDownloader';
import InputDialog from 'components/visual/InputDialog';
import { emptyResult } from 'components/visual/ResultCard';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { Link } from 'react-router-dom';

type Props = {
  sha256: string;
  sid?: string;
  metadata?: Record<string, string>;
  liveResultKeys?: string[];
  liveErrors?: Error[];
  force?: boolean;
};

const WrappedFileDetail: React.FC<Props> = ({
  sha256,
  sid = null,
  metadata = null,
  liveResultKeys = null,
  liveErrors = null,
  force = false
}) => {
  const { t } = useTranslation(['fileDetail']);
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { c12nDef, configuration, settings } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();
  const { showSuccessMessage } = useMySnackbar();
  const { addInsight, removeInsight } = useAssistant();
  const { setGlobalDrawer, globalDrawerOpened } = useDrawer();

  const [file, setFile] = useState<File | null>(null);
  const [safelistDialog, setSafelistDialog] = useState<boolean>(false);
  const [safelistReason, setSafelistReason] = useState<string>('');
  const [badlistDialog, setBadlistDialog] = useState<boolean>(false);
  const [badlistReason, setBadlistReason] = useState<string>('');
  const [waitingDialog, setWaitingDialog] = useState<boolean>(false);
  const [resubmitAnchor, setResubmitAnchor] = useState(null);
  const [promotedSections, setPromotedSections] = useState([]);
  const [insideDrawer, setInsideDrawer] = useState<boolean>(null);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [heuristics, setHeuristics] = useState<string[]>([]);

  const ref = useRef(null);

  const sp2 = useMemo(() => theme.spacing(2), [theme]);
  const sp4 = useMemo(() => theme.spacing(4), [theme]);

  const popoverOpen = Boolean(resubmitAnchor);

  const submissionProfiles: Record<string, string> = useMemo<Record<string, string>>(() => {
    let profileMap = {};
    Object.entries(configuration.submission.profiles).map(([name, config]) => {
      profileMap = { ...profileMap, [name]: config.display_name };
    });
    return profileMap;
  }, [configuration]);

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const fileName = useMemo(() => (file ? params.get('name') || sha256 : null), [file, params, sha256]);

  const fileViewerPath = useMemo<string>(() => {
    const tab = TAB_OPTIONS.find(option => location.pathname.indexOf(option) >= 0);
    if (!location.pathname.startsWith('/file/viewer') || !tab)
      return `/file/viewer/${file?.file_info?.sha256}/${DEFAULT_TAB}/${location.search}${location.hash}`;
    else return `/file/viewer/${file?.file_info?.sha256}/${tab}/${location.search}${location.hash}`;
  }, [file?.file_info?.sha256, location.hash, location.pathname, location.search]);

  const elementInViewport = element => {
    const bounding = element.getBoundingClientRect();
    const myElementHeight = element.offsetHeight;
    const myElementWidth = element.offsetWidth;

    if (
      bounding.top >= -myElementHeight &&
      bounding.left >= -myElementWidth &&
      bounding.right <= (window.innerWidth || document.documentElement.clientWidth) + myElementWidth &&
      bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) + myElementHeight
    ) {
      return true;
    }
    return false;
  };

  const scrollToTop = scrollToItem => {
    const element = document.getElementById(scrollToItem);
    if (element && !elementInViewport(element)) {
      element.scrollIntoView();
    }
  };

  const patchFileDetails = (data: File) => {
    const newData = { ...data };
    newData.results.sort((a, b) => (a.response.service_name > b.response.service_name ? 1 : -1));
    newData.emptys = data.results.filter(result => emptyResult(result));
    newData.results = data.results.filter(result => !emptyResult(result));
    newData.errors = liveErrors ? [...data.errors, ...liveErrors] : data.errors;

    // Compile a simplified list of heuristics for later reference
    const heurs = [];
    Object.values(newData?.heuristics || {}).map(hs => {
      hs.map(h => {
        heurs.push(h[0]);
      });
    });
    setHeuristics(heurs);
    return newData;
  };

  const resubmit = useCallback(
    (resubmit_type: string, isProfile: boolean) => {
      apiCall<Submission>({
        method: isProfile ? 'PUT' : 'GET',
        url: `/api/v4/submit/${resubmit_type}/${sha256}/${sid ? `?copy_sid=${sid}` : ''}`,
        onSuccess: api_data => {
          showSuccessMessage(t('resubmit.success'));
          setTimeout(() => {
            navigate(`/submission/detail/${api_data.api_response.sid}`);
          }, 500);
        }
      });
      setResubmitAnchor(null);
    },
    [sha256]
  );

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

  useEffect(() => {
    setFile(null);

    if (sid && sha256) {
      apiCall<File>({
        method: liveResultKeys ? 'POST' : 'GET',
        url: `/api/v4/submission/${sid}/file/${sha256}/`,
        body: liveResultKeys ? { extra_result_keys: liveResultKeys } : null,
        onSuccess: api_data => {
          scrollToTop('drawerTop');
          setFile(patchFileDetails(api_data.api_response));
        }
      });
    } else if (sha256) {
      apiCall<File>({
        url: `/api/v4/file/result/${sha256}/`,
        onSuccess: api_data => {
          scrollToTop('fileDetailTop');
          setFile(patchFileDetails(api_data.api_response));
        }
      });
    }
    // eslint-disable-next-line
  }, [sha256, sid]);

  useEffect(() => {
    if (file === null) {
      setPromotedSections(null);
    } else {
      setPromotedSections(
        file.results
          .map(serviceResult => serviceResult.result.sections.filter(section => section.promote_to !== null))
          .flat()
      );
    }
  }, [file]);

  useEffect(() => {
    addInsight({ type: 'file', value: sha256 });

    return () => {
      removeInsight({ type: 'file', value: sha256 });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sha256]);

  useEffect(() => {
    if (file && file.file_info.type.indexOf('code/') === 0) {
      addInsight({ type: 'code', value: sha256 });
    }

    return () => {
      removeInsight({ type: 'code', value: sha256 });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  useEffect(() => {
    setInsideDrawer(document.getElementById('drawerContent')?.contains(ref.current) || false);
  }, [file]);

  useEffect(() => {
    if (insideDrawer === false) {
      setLoaded(true);
      if (!location.hash) {
        setGlobalDrawer(null);
      } else if (file) {
        // Set the drawer content based on the hash
        const id = location.hash.slice(1);
        if (heuristics.includes(id)) {
          setGlobalDrawer(<HeuristicDetail heur_id={id} />);
        } else {
          setGlobalDrawer(<SignatureDetail signature_id={id} />);
        }
      }
    }
  }, [insideDrawer, location.hash, setGlobalDrawer, file]);

  useEffect(() => {
    if (loaded && insideDrawer === false && !globalDrawerOpened && location.hash) {
      navigate(`${location.pathname}${location.search ? location.search : ''}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insideDrawer, globalDrawerOpened]);

  return currentUser.roles.includes('submission_view') ? (
    <div id="fileDetailTop" ref={ref} style={{ textAlign: 'left' }}>
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
      {c12nDef.enforce && (
        <div style={{ paddingBottom: sp4, paddingTop: sp2 }}>
          <Classification size="tiny" c12n={file ? file.classification : null} />
        </div>
      )}
      <div style={{ paddingBottom: sp4 }}>
        <Grid container alignItems="center">
          <Grid flexGrow={1}>
            <Typography variant="h4">
              {file?.file_info?.type.startsWith('uri/') ? t('uri_title') : t('title')}
            </Typography>
            <Typography variant="caption" style={{ wordBreak: 'break-word' }}>
              {file?.file_info?.type.startsWith('uri/') && file?.file_info?.uri_info?.uri ? (
                file?.file_info?.uri_info?.uri
              ) : file ? (
                fileName
              ) : (
                <Skeleton style={{ width: '10rem' }} />
              )}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 12, md: 4 }} style={{ display: 'flex', justifyContent: 'flex-end', flexGrow: 0 }}>
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
                    <IconButton component={Link} to={fileViewerPath} size="large">
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
                        <ListItemButton dense onClick={() => resubmit('dynamic', false)}>
                          <ListItemIcon style={{ minWidth: theme.spacing(4.5) }}>
                            <OndemandVideoOutlinedIcon />
                          </ListItemIcon>
                          <ListItemText primary={t('resubmit.dynamic')} />
                        </ListItemButton>
                        {submissionProfiles &&
                          Object.entries(submissionProfiles).map(([name, display]) => (
                            <ListItemButton key={name} dense onClick={() => resubmit(name, true)}>
                              <ListItemIcon style={{ minWidth: theme.spacing(4.5) }}>
                                <OndemandVideoOutlinedIcon />
                              </ListItemIcon>
                              <ListItemText primary={`${t('resubmit.with')} "${display}"`} />
                            </ListItemButton>
                          ))}
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
          </Grid>
        </Grid>
      </div>
      <div style={{ paddingBottom: sp2 }}>
        {file?.file_info?.type.startsWith('uri/') ? (
          <URIIdentificationSection fileinfo={file ? file.file_info : null} promotedSections={promotedSections} />
        ) : (
          <IdentificationSection fileinfo={file ? file.file_info : null} promotedSections={promotedSections} />
        )}
        <FrequencySection seen={file ? file.file_info?.seen : null} />
        <MetadataSection metadata={file ? file.metadata : null} />
        {configuration.ui.ai.enabled && settings.executive_summary && !liveErrors && !liveResultKeys && (
          <AISummarySection type="file" id={file ? file.file_info.sha256 : null} />
        )}
        <ChildrenSection childrens={file ? file.childrens : null} />
        <ParentSection parents={file ? file.parents : null} />
        <Detection results={file ? file.results : null} heuristics={file ? file.heuristics : null} force={force} />
        <AttackSection attacks={file ? file.attack_matrix : null} force={force} />
        <TagSection signatures={file ? file.signatures : null} tags={file ? file.tags : null} force={force} />
        <ResultSection
          results={file ? file.results : null}
          sid={sid}
          alternates={file ? file.alternates : null}
          force={force}
        />
        <EmptySection emptys={file ? file.emptys : null} sid={sid} />
        <ErrorSection errors={file ? file.errors : null} />
      </div>
    </div>
  ) : (
    <ForbiddenPage />
  );
};

const FileDetail = React.memo(WrappedFileDetail);

export default FileDetail;
