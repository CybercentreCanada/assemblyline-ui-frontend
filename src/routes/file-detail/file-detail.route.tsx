import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OndemandVideoOutlinedIcon from '@mui/icons-material/OndemandVideoOutlined';
import PageviewOutlinedIcon from '@mui/icons-material/PageviewOutlined';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import ViewCarouselOutlinedIcon from '@mui/icons-material/ViewCarouselOutlined';
import { List, ListItemButton, ListItemIcon, ListItemText, Popover, useTheme } from '@mui/material';
import { AppLink, useAppNavigate } from 'core/router';
import { createAppRoute, useAppPathParams, useAppSearchSnapshot } from 'core/routes';
import { AppPageCenter } from 'core/template';
import useALContext from 'deprecated/hooks/useALContext';
import useMyAPI from 'deprecated/hooks/useMyAPI';
import useMySnackbar from 'deprecated/hooks/useMySnackbar';
import { useAssistant } from 'layout/assistant';
import type { File } from 'models/api/file';
import type { Error } from 'models/base/error';
import type { Submission } from 'models/base/submission';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AttackSection from 'routes/file-detail/components/attacks';
import ChildrenSection from 'routes/file-detail/components/childrens';
import Detection from 'routes/file-detail/components/detection';
import EmptySection from 'routes/file-detail/components/emptys';
import ErrorSection from 'routes/file-detail/components/errors';
import FrequencySection from 'routes/file-detail/components/frequency';
import IdentificationSection from 'routes/file-detail/components/ident';
import { default as MetadataSection } from 'routes/file-detail/components/metadata';
import ParentSection from 'routes/file-detail/components/parents';
import ResultSection from 'routes/file-detail/components/results';
import TagSection from 'routes/file-detail/components/tags';
import URIIdentificationSection from 'routes/file-detail/components/uriIdent';
import { ForbiddenPage } from 'routes/forbidden/forbidden';
import AISummarySection from 'routes/submission-detail/components/ai_summary';
import { FileDownloader } from 'ui/buttons/FileDownloader';
import { IconButton } from 'ui/buttons/IconButton';
import Classification from 'ui/Classification';
import InputDialog from 'ui/InputDialog';
import { PageHeader } from 'ui/layouts/PageHeader';
import { emptyResult } from 'ui/ResultCard';

const FileDetailPage = React.memo(() => {
  const { t } = useTranslation(['fileDetail']);
  const theme = useTheme();
  const { id: sha256 } = useAppPathParams<'/file/detail/:id'>();
  const search = useAppSearchSnapshot<'/file/detail/:id'>();
  const navigate = useAppNavigate();
  const { apiCall } = useMyAPI();
  const { user: currentUser, configuration, settings } = useALContext();
  const { showSuccessMessage } = useMySnackbar();
  const { addInsight, removeInsight } = useAssistant();

  const [file, setFile] = useState<File | null>(null);
  const [safelistDialog, setSafelistDialog] = useState<boolean>(false);
  const [safelistReason, setSafelistReason] = useState<string>('');
  const [badlistDialog, setBadlistDialog] = useState<boolean>(false);
  const [badlistReason, setBadlistReason] = useState<string>('');
  const [waitingDialog, setWaitingDialog] = useState<boolean>(false);
  const [resubmitAnchor, setResubmitAnchor] = useState(null);
  const [promotedSections, setPromotedSections] = useState([]);

  const sid = useMemo(() => search?.get('sid'), [search?.get('sid')]);
  const metadata = useMemo(() => search?.get('metadata'), [search?.get('metadata')]);
  const liveResultKeys = useMemo(() => search?.get('liveResultKeys'), [search?.get('liveResultKeys')]);
  const liveErrors = useMemo(() => search?.get('liveErrors'), [search?.get('liveErrors')]);
  const force = useMemo(() => search?.get('force'), [search?.get('force')]);

  const ref = useRef(null);

  const sp2 = useMemo(() => theme.spacing(2), [theme]);

  const popoverOpen = Boolean(resubmitAnchor);

  const submissionProfiles: Record<string, string> = useMemo<Record<string, string>>(() => {
    let profileMap = {};
    Object.entries(configuration.submission.profiles).map(([name, config]) => {
      profileMap = { ...profileMap, [name]: config.display_name };
    });
    return profileMap;
  }, [configuration]);

  const fileName = useMemo(() => (file ? search.get('name') || sha256 : null), [file, search?.toString(), sha256]);

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

  const resubmit = useCallback(
    (resubmit_type: string, isProfile: boolean) => {
      apiCall<Submission>({
        method: isProfile ? 'PUT' : 'GET',
        url: `/api/v4/submit/${resubmit_type}/${sha256}/${sid ? `?copy_sid=${sid}` : ''}`,
        onSuccess: api_data => {
          showSuccessMessage(t('resubmit.success'));
          setTimeout(() => {
            navigate.to().create({ route: '/submission/detail/:id', path: { id: api_data.api_response.sid } });
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

  return currentUser.roles.includes('submission_view') ? (
    <AppPageCenter>
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

        <PageHeader
          classification={() => file.classification}
          primary={file?.file_info?.type.startsWith('uri/') ? t('uri_title') : t('title')}
          secondary={() =>
            file?.file_info?.type.startsWith('uri/') && file?.file_info?.uri_info?.uri
              ? file?.file_info?.uri_info?.uri
              : fileName
          }
          secondaryLoading={!file}
          slotProps={{ root: { style: { marginBottom: theme.spacing(2) } } }}
          actions={
            <>
              <IconButton
                loading={!file}
                size="large"
                nav={
                  !file
                    ? null
                    : nav =>
                        nav.to().create({
                          route: '/search/:index',
                          path: { index: 'submission' },
                          search: {
                            query: `files.sha256:${file.file_info.sha256} OR results:${file.file_info.sha256}* OR errors:${file.file_info.sha256}*`
                          }
                        })
                }
                navDeps={[file?.file_info?.sha256]}
                tooltip={t('related')}
              >
                <ViewCarouselOutlinedIcon />
              </IconButton>
              <FileDownloader
                link={() =>
                  `/api/v4/file/download/${file.file_info.sha256}/?${
                    fileName && file.file_info.sha256 !== fileName ? `name=${encodeURIComponent(fileName)}&` : ''
                  }${sid ? `sid=${sid}&` : ''}`
                }
                loading={!file}
                preventRender={!currentUser.roles.includes('file_download')}
                tooltip={t('download')}
              />
              <IconButton
                loading={!file}
                size="large"
                nav={nav =>
                  nav.to().create(prev => ({
                    route: '/file/viewer/:id/:tab',
                    path: {
                      id: file?.file_info?.sha256,
                      tab: prev.route === '/file/viewer/:id/:tab' ? prev.path.tab : null
                    }
                  }))
                }
                navDeps={[file?.file_info?.sha256]}
                tooltip={t('file_viewer')}
                preventRender={
                  !currentUser.roles.includes('file_detail') ||
                  (file?.file_info?.type.startsWith('uri/') && !currentUser.is_admin)
                }
              >
                <PageviewOutlinedIcon />
              </IconButton>
              <IconButton
                loading={!file}
                size="large"
                tooltip={t('resubmit')}
                preventRender={!currentUser.roles.includes('submission_create')}
                onClick={event => setResubmitAnchor(event.currentTarget)}
              >
                <ReplayOutlinedIcon />
                {popoverOpen ? (
                  <ExpandLessIcon style={{ position: 'absolute', right: 0, bottom: 10, fontSize: 'medium' }} />
                ) : (
                  <ExpandMoreIcon style={{ position: 'absolute', right: 0, bottom: 10, fontSize: 'medium' }} />
                )}
              </IconButton>
              {!file || !currentUser.roles.includes('submission_create') ? null : (
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
                      component={AppLink}
                      nav={nav =>
                        nav.to().create({
                          route: '/submit',
                          search: {
                            classification: file.file_info.classification,
                            hash: file.file_info.sha256,
                            metadata: metadata
                          }
                        })
                      }
                      navDeps={[file.file_info.sha256, file.file_info.classification, metadata]}
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
              )}
              <IconButton
                loading={!file}
                size="large"
                tooltip={t('safelist')}
                preventRender={!currentUser.roles.includes('safelist_manage')}
                onClick={prepareSafelist}
              >
                <VerifiedUserOutlinedIcon />
              </IconButton>
              <IconButton
                loading={!file}
                size="large"
                tooltip={t('badlist')}
                preventRender={!currentUser.roles.includes('badlist_manage')}
                onClick={prepareBadlist}
              >
                <BugReportOutlinedIcon />
              </IconButton>
            </>
          }
        />

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
    </AppPageCenter>
  ) : (
    <ForbiddenPage />
  );
});

export const FileDetailRoute = createAppRoute({
  component: FileDetailPage,

  path: '/file/detail/:id',
  params: s => ({
    id: s.string()
  }),
  search: s => ({
    force: s.boolean(false).source('transient'),
    liveErrors: s.object(null as Error[]).source('transient'),
    liveResultKeys: s.object(null as string[]).source('transient'),
    metadata: s.object(null as Record<string, string>).source('transient'),
    name: s.string(null),
    sid: s.string(null).source('transient')
  }),

  ancestor: null,
  shortname: () => ({ i18nKey: 'breadcrumb.file.detail', ns: 'app' }),
  fullname: () => ({ i18nKey: 'breadcrumb.file.detail', ns: 'app' }),
  shorticon: () => <DescriptionOutlinedIcon />,
  fullicon: () => <DescriptionOutlinedIcon />,

  disabled: () => false,
  forbidden: (_location, config) => !config.user.roles.includes('submission_view')
});
