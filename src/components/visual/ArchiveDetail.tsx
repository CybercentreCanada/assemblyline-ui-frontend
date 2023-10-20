import { Tab as MuiTab, Tabs as MuiTabs, useTheme } from '@mui/material';
import PageFullSize from 'commons/components/pages/PageFullSize';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import ForbiddenPage from 'components/routes/403';
import Classification from 'components/visual/Classification';
import { Error } from 'components/visual/ErrorCard';
import { AlternateResult, emptyResult, Result } from 'components/visual/ResultCard';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Banner from './ArchiveDetail/banner';
import CommentSection from './ArchiveDetail/comments';
import { DiscoverSection } from './ArchiveDetail/discover';
import HexSection from './ArchiveDetail/viewer/hex';
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

type ArchiveDetailProps = {
  sha256: string;
  sid?: string;
  liveResultKeys?: string[];
  liveErrors?: Error[];
  force?: boolean;
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

type Tab = keyof typeof TABS;

const WrappedArchiveDetail: React.FC<ArchiveDetailProps> = ({
  sha256,
  sid = null,
  liveResultKeys = null,
  liveErrors = null,
  force = false
}) => {
  const { t } = useTranslation(['fileDetail']);
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const { user: currentUser, c12nDef } = useALContext();

  const [file, setFile] = useState<File | null>(null);
  const [tab, setTab] = useState<Tab>('details');

  const ref = useRef<HTMLDivElement>(null);

  const inDrawer = useMemo<boolean>(
    () => document.getElementById('drawerContent')?.contains(ref.current),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ref?.current]
  );

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

  const handleTabChange = useCallback((event: React.SyntheticEvent<Element, Event>, value: any) => {
    setTab(value);
  }, []);

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

  return currentUser.roles.includes('submission_view') ? (
    <PageFullSize id="fileDetailTop" ref={ref} styles={{ paper: { textAlign: 'left' } }}>
      {c12nDef.enforce && (
        <div style={{ paddingBottom: theme.spacing(4), paddingTop: theme.spacing(2) }}>
          <Classification size="tiny" c12n={file ? file.file_info.classification : null} />
        </div>
      )}

      <Banner sha256={sha256} file={file} sid={sid} force={force} />

      <MuiTabs
        value={tab}
        variant="scrollable"
        scrollButtons="auto"
        onChange={handleTabChange}
        sx={{ backgroundColor: theme.palette.background.default }}
        // sx={{ backgroundColor: inDrawer ? theme.palette.background.default : theme.palette.background.paper }}
      >
        {Object.keys(TABS).map((title, i) => (
          <MuiTab key={`${i}`} label={t(title)} value={title} sx={{ minWidth: '120px' }} />
        ))}
      </MuiTabs>

      {tab === 'details' && (
        <>
          <IdentificationSection fileinfo={file ? file.file_info : null} />
          <FrequencySection fileinfo={file ? file.file_info : null} />
          <MetadataSection metadata={file ? file.metadata : null} />
        </>
      )}

      {tab === 'detection' && (
        <>
          <Detection results={file ? file.results : null} heuristics={file ? file.heuristics : null} force={force} />
          <AttackSection attacks={file ? file.attack_matrix : null} force={force} />
          <ResultSection
            results={file ? file.results : null}
            sid={sid}
            alternates={file ? file.alternates : null}
            force={force}
          />
          <EmptySection emptys={file ? file.emptys : null} sid={sid} />
          <ErrorSection errors={file ? file.errors : null} />
        </>
      )}

      {tab === 'tags' && (
        <>
          <TagSection signatures={file ? file.signatures : null} tags={file ? file.tags : null} force={force} />
        </>
      )}

      {tab === 'relations' && (
        <>
          <ChildrenSection childrens={file ? file.childrens : null} />
          <ParentSection parents={file ? file.parents : null} />
          <DiscoverSection file={file} />
        </>
      )}

      {tab === 'ascii' && <>ascii</>}

      {tab === 'strings' && <>strings</>}

      {tab === 'hex' && (
        <>
          <HexSection sha256={sha256} />
        </>
      )}

      {tab === 'community' && (
        <>
          <CommentSection sha256={file?.file_info?.sha256} comments={file ? file?.file_info?.comments : null} />
        </>
      )}
    </PageFullSize>
  ) : (
    <ForbiddenPage />
  );
};

const ArchiveDetail = React.memo(WrappedArchiveDetail);

export default ArchiveDetail;
