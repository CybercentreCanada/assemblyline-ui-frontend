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
  ListItem,
  ListItemIcon,
  ListItemText,
  Popover,
  Skeleton,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import useALContext from 'components/hooks/useALContext';
import useAssistant from 'components/hooks/useAssistant';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { CustomUser } from 'components/hooks/useMyUser';
import ForbiddenPage from 'components/routes/403';
import { DEFAULT_TAB, TAB_OPTIONS } from 'components/routes/file/viewer';
import AISummarySection from 'components/routes/submission/detail/ai_summary';
import Classification from 'components/visual/Classification';
import type { Error } from 'components/visual/ErrorCard';
import { AlternateResult, Result, emptyResult } from 'components/visual/ResultCard';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Link, useLocation } from 'react-router-dom';
import AttackSection from './FileDetail/attacks';
import ChildrenSection from './FileDetail/childrens';
import Detection from './FileDetail/detection';
import EmptySection from './FileDetail/emptys';
import ErrorSection from './FileDetail/errors';
import FrequencySection from './FileDetail/frequency';
import IdentificationSection from './FileDetail/ident';
import MetadataSection from './FileDetail/metadata';
import ParentSection from './FileDetail/parents';
import ResultSection from './FileDetail/results';
import TagSection from './FileDetail/tags';
import URIIdentificationSection from './FileDetail/uriIdent';
import FileDownloader from './FileDownloader';
import InputDialog from './InputDialog';

type URIInfo = {
  uri: string;
  scheme: string;
  netloc: string;
  path: string;
  params: string;
  query: string;
  fragment: string;
  username: string;
  password: string;
  hostname: string;
  port: number;
};

type FileInfo = {
  archive_ts: string;
  ascii: string;
  classification: string;
  entropy: number;
  expiry_ts: string | null;
  hex: string;
  magic: string;
  md5: string;
  mime: string;
  seen: {
    count: number;
    first: string;
    last: string;
  };
  sha1: string;
  sha256: string;
  size: number;
  ssdeep: string;
  tlsh: string;
  type: string;
  uri_info: URIInfo;
};

type File = {
  alternates: {
    [serviceName: string]: AlternateResult[];
  };
  attack_matrix: {
    [category: string]: string[][];
  };
  classification: string;
  childrens: {
    name: string;
    sha256: string;
  }[];
  emptys: Result[];
  errors: Error[];
  file_info: FileInfo;
  heuristics: {
    [category: string]: string[][];
  };
  metadata: {
    [level: string]: {
      [key: string]: any;
    };
  };
  parents: string[];
  results: Result[];
  signatures: string[][];
  tags: {
    [type: string]: string[][];
  };
};

type FileDetailProps = {
  sha256: string;
  sid?: string;
  liveResultKeys?: string[];
  liveErrors?: Error[];
  force?: boolean;
};

const WrappedFileDetail: React.FC<FileDetailProps> = ({
  sha256,
  sid = null,
  liveResultKeys = null,
  liveErrors = null,
  force = false
}) => {
  const { t } = useTranslation(['fileDetail']);
  const [file, setFile] = useState<File | null>(null);
  const [safelistDialog, setSafelistDialog] = useState<boolean>(false);
  const [safelistReason, setSafelistReason] = useState<string>('');
  const [badlistDialog, setBadlistDialog] = useState<boolean>(false);
  const [badlistReason, setBadlistReason] = useState<string>('');
  const [waitingDialog, setWaitingDialog] = useState(false);
  const { apiCall } = useMyAPI();
  const { c12nDef, configuration, settings } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();
  const theme = useTheme();
  const navigate = useNavigate();
  const { showSuccessMessage } = useMySnackbar();
  const [resubmitAnchor, setResubmitAnchor] = useState(null);
  const [promotedSections, setPromotedSections] = useState([]);
  const popoverOpen = Boolean(resubmitAnchor);
  const sp2 = theme.spacing(2);
  const sp4 = theme.spacing(4);
  const { addInsight, removeInsight } = useAssistant();

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const fileName = file ? params.get('name') || sha256 : null;

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
    return newData;
  };

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

  useEffect(() => {
    setFile(null);

    if (sid && sha256) {
      apiCall({
        method: liveResultKeys ? 'POST' : 'GET',
        url: `/api/v4/submission/${sid}/file/${sha256}/`,
        body: liveResultKeys ? { extra_result_keys: liveResultKeys } : null,
        onSuccess: api_data => {
          scrollToTop('drawerTop');
          setFile(patchFileDetails(api_data.api_response));
        }
      });
    } else if (sha256) {
      apiCall({
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

  return currentUser.roles.includes('submission_view') ? (
    <div id="fileDetailTop" style={{ textAlign: 'left' }}>
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
      />
      {c12nDef.enforce && (
        <div style={{ paddingBottom: sp4, paddingTop: sp2 }}>
          <Classification size="tiny" c12n={file ? file.classification : null} />
        </div>
      )}
      <div style={{ paddingBottom: sp4 }}>
        <Grid container alignItems="center">
          <Grid item xs>
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
          <Grid item xs={12} sm={12} md={4} style={{ display: 'flex', justifyContent: 'flex-end', flexGrow: 0 }}>
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
