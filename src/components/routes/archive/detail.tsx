import { Tab as MuiTab, Tabs as MuiTabs, useTheme } from '@mui/material';
import PageCenter from 'commons/components/pages/PageCenter';
import PageFullSize from 'commons/components/pages/PageFullSize';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { ArchiveBanner, CommentSection, LabelSection, SimilarSection } from 'components/visual/ArchiveDetail';
import Classification from 'components/visual/Classification';
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
import TagSection from 'components/visual/FileDetail/tags';
import ASCIISection from 'components/visual/FileViewer/ascii';
import HexSection from 'components/visual/FileViewer/hex';
import StringsSection from 'components/visual/FileViewer/strings';
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
  comments: {
    cid: string;
    uname: string;
    date: string;
    text: string;
  }[];
  entropy: number;
  expiry_ts: string | null;
  hex: string;
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
  signatures: string[][];
  tags: {
    [type: string]: string[][];
  };
};

const TABS = {
  details: null,
  detection: null,
  tags: null,
  relations: null,
  ascii: null,
  strings: null,
  hex: null,
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

  const inDrawer = useMemo<boolean>(() => (propSha256 ? true : paramSha256 ? false : null), [paramSha256, propSha256]);
  const sha256 = useMemo<string>(() => paramSha256 || propSha256, [paramSha256, propSha256]);
  const tab = useMemo<Tab>(
    () => (Object.keys(TABS).includes(inDrawer ? stateTab : paramTab) ? (inDrawer ? stateTab : paramTab) : DEFAULT_TAB),
    [inDrawer, paramTab, stateTab]
  );

  const handleTabChange = useCallback(
    (event: React.SyntheticEvent<Element, Event>, value: Tab) => {
      if (!inDrawer) navigate(`/archive/${sha256}/${value}${location.search}${location.hash}`);
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
    if (!inDrawer && paramTab !== tab) navigate(`/archive/${sha256}/${tab}${location.search}${location.hash}`);
    else if (inDrawer && stateTab !== tab) setStateTab(tab);
  }, [inDrawer, location.hash, location.search, navigate, paramTab, sha256, stateTab, tab]);

  const Layout: React.FC<{ children: React.ReactNode }> = useCallback(
    ({ children }) =>
      inDrawer ? (
        <PageFullSize styles={{ paper: { textAlign: 'left' } }}>{children}</PageFullSize>
      ) : (
        <PageCenter width="100%" height="100%" textAlign="left">
          <PageFullSize>{children}</PageFullSize>
        </PageCenter>
      ),
    [inDrawer]
  );

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
            top: '64px',
            zIndex: 1,
            backgroundColor: inDrawer ? theme.palette.background.paper : theme.palette.background.default
          }}
        >
          <MuiTabs
            value={tab}
            variant="scrollable"
            scrollButtons="auto"
            onChange={handleTabChange}
            sx={{
              backgroundColor: inDrawer ? theme.palette.background.default : theme.palette.background.paper,
              margin: `${theme.spacing(2)} 0`
            }}
          >
            {Object.keys(TABS).map((title, i) => (
              <MuiTab key={`${i}`} label={t(title)} value={title} sx={{ minWidth: '120px' }} />
            ))}
          </MuiTabs>
        </div>

        <div style={{ display: tab === 'details' ? 'contents' : 'none' }}>
          <IdentificationSection fileinfo={file ? file.file_info : null} />
          <FrequencySection fileinfo={file ? file.file_info : null} />
          <MetadataSection metadata={file ? file.metadata : null} />
        </div>

        <div style={{ display: tab === 'detection' ? 'contents' : 'none' }}>
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
        </div>

        <div style={{ display: tab === 'tags' ? 'contents' : 'none' }}>
          <TagSection signatures={file ? file.signatures : null} tags={file ? file.tags : null} force={force} />
        </div>

        <div style={{ display: tab === 'relations' ? 'contents' : 'none' }}>
          <ChildrenSection
            childrens={file ? file.childrens : null}
            title={t('childrens', { ns: 'archive' })}
            show={true}
          />
          <ParentSection parents={file ? file.parents : null} title={t('parents', { ns: 'archive' })} show={true} />
          <SimilarSection
            file={file ? file : null}
            show={true}
            visible={tab === 'relations'}
            onTabChange={handleTabChange}
          />
        </div>

        <div style={{ display: tab === 'ascii' ? 'contents' : 'none' }}>
          <ASCIISection sha256={sha256} type={file?.file_info?.type} visible={tab === 'ascii'} />
        </div>

        <div style={{ display: tab === 'strings' ? 'contents' : 'none' }}>
          <StringsSection sha256={sha256} type={file?.file_info?.type} visible={tab === 'strings'} />
        </div>

        <div style={{ display: tab === 'hex' ? 'contents' : 'none' }}>
          <HexSection sha256={sha256} visible={tab === 'hex'} />
        </div>

        <div style={{ display: tab === 'community' ? 'contents' : 'none' }}>
          <LabelSection sha256={sha256} labels={file?.file_info?.label_categories} />
          <CommentSection sha256={file?.file_info?.sha256} comments={file ? file?.file_info?.comments : null} />
        </div>
      </Layout>
    );
};

export const ArchiveDetail = React.memo(WrappedArchiveDetail);

export default ArchiveDetail;
