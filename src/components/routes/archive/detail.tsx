import { Tab as MuiTab, Tabs as MuiTabs, useTheme } from '@mui/material';
import PageCenter from 'commons/components/pages/PageCenter';
import PageFullSize from 'commons/components/pages/PageFullSize';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import {
  ArchiveBanner,
  ArchivedTagSection,
  CommentSection,
  LabelSection,
  Signature,
  SimilarSection,
  Tag
} from 'components/visual/ArchiveDetail';
import Classification from 'components/visual/Classification';
import { Comments } from 'components/visual/CommentCard';
import Content from 'components/visual/Content';
import { Error } from 'components/visual/ErrorCard';
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
import URIIdentificationSection from 'components/visual/FileDetail/uriIdent';
import { ASCIISection, HexSection, ImageSection, StringsSection } from 'components/visual/FileViewer';
import { AlternateResult, emptyResult, Result } from 'components/visual/ResultCard';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router';
import { useLocation, useParams } from 'react-router-dom';
import ForbiddenPage from '../403';
import NotFoundPage from '../404';

export type FileInfo = {
  archive_ts: string;
  ascii: string;
  classification: string;
  comments: Comments;
  entropy: number;
  expiry_ts: string | null;
  from_archive: boolean;
  hex: string;
  is_section_image: boolean;
  is_supplementary: boolean;
  labels: string[];
  label_categories?: {
    info: string[];
    safe: string[];
    suspicious: string[];
    malicious: string[];
  };
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
  uri_info?: {
    fragment?: string;
    hostname: string;
    netloc: string;
    params?: string;
    password?: string;
    path?: string;
    port: number;
    query?: string;
    scheme: string;
    uri: string;
    username?: string;
  };
};

export type File = {
  alternates: {
    [serviceName: string]: AlternateResult[];
  };
  attack_matrix: {
    [category: string]: string[][];
  };
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
  signatures: Signature[];
  tags: Record<string, Tag[]>;
};

const TABS = {
  details: null,
  detection: null,
  tags: null,
  relations: null,
  ascii: null,
  strings: null,
  hex: null,
  image: null,
  community: null
};

export type Tab = keyof typeof TABS;

const DEFAULT_TAB: Tab = 'details';

type Params = {
  id?: string;
  tab?: Tab;
};

type Props = {
  sha256?: string;
  sid?: string;
  force?: boolean;
};

const WrappedArchiveDetail: React.FC<Props> = ({ sha256: propSha256, force = false }) => {
  const { t } = useTranslation(['fileDetail', 'archive']);
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { id: paramSha256, tab: paramTab } = useParams<Params>();

  const { apiCall } = useMyAPI();
  const { showErrorMessage } = useMySnackbar();
  const { user: currentUser, c12nDef, configuration } = useALContext();

  const [file, setFile] = useState<File | null>(null);
  const [stateTab, setStateTab] = useState<Tab>(null);
  const [promotedSections, setPromotedSections] = useState([]);

  const inDrawer = useMemo<boolean>(() => (propSha256 ? true : paramSha256 ? false : null), [paramSha256, propSha256]);
  const sha256 = useMemo<string>(() => paramSha256 || propSha256, [paramSha256, propSha256]);

  const tab = useMemo<Tab>(() => {
    const currentTab = inDrawer ? stateTab : paramTab;
    return !file ||
      (currentTab === 'image' && file?.file_info?.is_section_image === true) ||
      Object.keys(TABS)
        .filter(v => v !== 'image')
        .includes(currentTab)
      ? currentTab
      : DEFAULT_TAB;
  }, [file, inDrawer, paramTab, stateTab]);

  const handleTabChange = useCallback(
    (event: React.SyntheticEvent<Element, Event>, value: Tab) => {
      if (!inDrawer) navigate(`/archive/${sha256}/${value}${location.search}${location.hash}`, { replace: true });
      else setStateTab(value);
    },
    [inDrawer, location.hash, location.search, navigate, sha256]
  );

  const patchFileDetails = useCallback((data: File) => {
    const newData = { ...data };
    newData.results.sort((a, b) => (a.response.service_name > b.response.service_name ? 1 : -1));
    newData.emptys = data.results.filter(result => emptyResult(result));
    newData.results = data.results.filter(result => !emptyResult(result));
    newData.errors = data.errors;
    return newData;
  }, []);

  useEffect(() => {
    if (!sha256) return;
    apiCall({
      url: `/api/v4/file/result/${sha256}/`,
      onEnter: () => setFile(null),
      onSuccess: api_data => setFile(patchFileDetails(api_data.api_response)),
      onFailure: api_data => showErrorMessage(api_data.api_response)
    });
    // eslint-disable-next-line
  }, [patchFileDetails, sha256]);

  useEffect(() => {
    return () => {
      setFile(null);
    };
  }, [sha256]);

  useEffect(() => {
    if (!inDrawer && paramTab !== tab) {
      navigate(`/archive/${sha256}/${tab}${location.search}${location.hash}`, { replace: true });
    } else if (inDrawer && stateTab !== tab) {
      setStateTab(tab);
    }
  }, [inDrawer, location.hash, location.search, navigate, paramTab, sha256, stateTab, tab]);

  const Layout: React.FC<{ children: React.ReactNode }> = useCallback(
    ({ children }) =>
      inDrawer ? (
        <PageFullSize styles={{ paper: { textAlign: 'left', minHeight: null } }}>{children}</PageFullSize>
      ) : (
        <PageCenter width="100%" height="100%" textAlign="left">
          <PageFullSize>{children}</PageFullSize>
        </PageCenter>
      ),
    [inDrawer]
  );

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

  if (!configuration?.datastore?.archive?.enabled)
    return inDrawer ? <NotFoundPage /> : <Navigate to="/notfound" replace />;
  else if (!currentUser.roles.includes('archive_view'))
    return inDrawer ? <ForbiddenPage /> : <Navigate to="/forbidden" replace />;
  else
    return (
      <Layout>
        {c12nDef.enforce && (
          <div style={{ paddingBottom: theme.spacing(4), paddingTop: theme.spacing(2) }}>
            <Classification size="tiny" c12n={file ? file.file_info.classification : null} />
          </div>
        )}

        <ArchiveBanner sha256={sha256} file={file} sid={null} force={force} />

        <div
          style={{
            position: 'sticky',
            top: '63px',
            zIndex: 1000,
            backgroundColor: inDrawer ? theme.palette.background.paper : theme.palette.background.default
          }}
        >
          <MuiTabs
            value={tab || 'details'}
            variant="scrollable"
            scrollButtons="auto"
            onChange={handleTabChange}
            sx={{
              backgroundColor: inDrawer ? theme.palette.background.default : theme.palette.background.paper,
              margin: `${theme.spacing(2)} 0`
            }}
          >
            <MuiTab label={t('details')} value={'details'} sx={{ minWidth: '120px' }} />
            <MuiTab label={t('detection')} value={'detection'} sx={{ minWidth: '120px' }} />
            <MuiTab label={t('tags')} value={'tags'} sx={{ minWidth: '120px' }} />
            <MuiTab label={t('relations')} value={'relations'} sx={{ minWidth: '120px' }} />
            <MuiTab label={t('ascii')} value={'ascii'} sx={{ minWidth: '120px' }} />
            <MuiTab label={t('strings')} value={'strings'} sx={{ minWidth: '120px' }} />
            <MuiTab label={t('hex')} value={'hex'} sx={{ minWidth: '120px' }} />
            {file?.file_info?.is_section_image !== false && (
              <MuiTab label={t('image')} value={'image'} sx={{ minWidth: '120px' }} />
            )}
            <MuiTab label={t('community')} value={'community'} sx={{ minWidth: '120px' }} />
          </MuiTabs>
        </div>

        <Content visible={tab === 'details'} name="details">
          {file?.file_info?.type.startsWith('uri/') ? (
            <URIIdentificationSection fileinfo={file ? file.file_info : null} promotedSections={promotedSections} />
          ) : (
            <IdentificationSection fileinfo={file ? file.file_info : null} promotedSections={promotedSections} />
          )}
          <FrequencySection seen={file ? file.file_info?.seen : null} />
          <MetadataSection metadata={file ? file.metadata : null} />
        </Content>

        <Content visible={tab === 'detection'} name="detection">
          <Detection results={file ? file.results : null} heuristics={file ? file.heuristics : null} force={force} />
          <AttackSection attacks={file ? file.attack_matrix : null} force={force} />
          <ResultSection
            results={file ? file.results : null}
            sid={null}
            alternates={file ? file.alternates : null}
            force={force}
          />
          <EmptySection emptys={file ? file.emptys : null} sid={null} />
          <ErrorSection errors={file ? file.errors : null} />
        </Content>

        <Content visible={tab === 'tags'} name="tags">
          <ArchivedTagSection
            sha256={sha256}
            signatures={file ? file.signatures : null}
            tags={file ? file.tags : null}
            force={force}
            drawer={inDrawer}
          />
        </Content>

        <Content visible={tab === 'relations'} name="relations">
          <ChildrenSection
            childrens={file ? file.childrens : null}
            title={t('childrens', { ns: 'archive' })}
            show={true}
          />
          <ParentSection parents={file ? file.parents : null} title={t('parents', { ns: 'archive' })} show={true} />
          <SimilarSection file={file ? file : null} show={true} drawer={inDrawer} onTabChange={handleTabChange} />
        </Content>

        <Content visible={tab === 'ascii'} name="ascii">
          <ASCIISection sha256={sha256} type={file?.file_info?.type} />
        </Content>

        <Content visible={tab === 'strings'} name="strings">
          <StringsSection sha256={sha256} type={file?.file_info?.type} />
        </Content>

        <Content visible={tab === 'hex'} name="hex">
          <HexSection sha256={sha256} />
        </Content>

        <Content visible={tab === 'image' && file?.file_info?.is_section_image} name="image">
          <ImageSection sha256={sha256} name={sha256} />
        </Content>

        <Content visible={tab === 'community'} name="community">
          <LabelSection sha256={sha256} labels={file?.file_info?.label_categories} />
          <CommentSection
            sha256={file?.file_info?.sha256}
            comments={file ? file?.file_info?.comments : null}
            drawer={inDrawer}
          />
        </Content>
      </Layout>
    );
};

export const ArchiveDetail = React.memo(WrappedArchiveDetail);

export default ArchiveDetail;
