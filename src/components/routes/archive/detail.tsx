import { AlertTitle, useTheme } from '@mui/material';
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
import InformativeAlert from 'components/visual/InformativeAlert';
import { AlternateResult, emptyResult, Result } from 'components/visual/ResultCard';
import { TabContainer } from 'components/visual/TabContainer';
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

type Params = {
  id?: string;
  tab?: string;
};

type Props = {
  sha256?: string;
  sid?: string;
  force?: boolean;
};

const WrappedArchiveDetail: React.FC<Props> = ({ sha256: propSha256, force = false }) => {
  const { t } = useTranslation(['archive']);
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { id: paramSha256, tab: paramTab } = useParams<Params>();

  const { apiCall } = useMyAPI();
  const { showErrorMessage } = useMySnackbar();
  const { user: currentUser, c12nDef, configuration } = useALContext();

  const [file, setFile] = useState<File | null>(null);
  const [promotedSections, setPromotedSections] = useState([]);

  const inDrawer = useMemo<boolean>(() => (propSha256 ? true : paramSha256 ? false : null), [paramSha256, propSha256]);
  const sha256 = useMemo<string>(() => paramSha256 || propSha256, [paramSha256, propSha256]);

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
      url: `/api/v4/file/result/${sha256}/?archive_only=true`,
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
          <div style={{ paddingBottom: theme.spacing(2), paddingTop: theme.spacing(0) }}>
            <Classification size="tiny" c12n={file ? file.file_info.classification : null} />
          </div>
        )}

        <ArchiveBanner sha256={sha256} file={file} sid={null} force={force} />

        <TabContainer
          value={inDrawer ? null : paramTab}
          paper={!inDrawer}
          defaultTab="details"
          selectionFollowsFocus
          stickyTop={63}
          onChange={
            inDrawer
              ? null
              : (_event, value) =>
                  navigate(`/archive/${sha256}/${value}${location.search}${location.hash}`, { replace: true })
          }
          tabs={{
            details: {
              label: t('details'),
              content: (
                <>
                  {file?.file_info?.type.startsWith('uri/') ? (
                    <URIIdentificationSection
                      fileinfo={file ? file.file_info : null}
                      promotedSections={promotedSections}
                      nocollapse
                    />
                  ) : (
                    <IdentificationSection
                      fileinfo={file ? file.file_info : null}
                      promotedSections={promotedSections}
                      nocollapse
                    />
                  )}
                  <FrequencySection seen={file ? file.file_info?.seen : null} nocollapse />
                  <MetadataSection metadata={file ? file.metadata : null} nocollapse />
                </>
              )
            },
            detection: {
              label: t('detection'),
              content:
                file &&
                file.results.length === 0 &&
                Object.keys(file.heuristics).length === 0 &&
                Object.keys(file.attack_matrix).length === 0 &&
                file.emptys.length === 0 &&
                file.errors.length === 0 ? (
                  <div style={{ width: '100%' }}>
                    <InformativeAlert>
                      <AlertTitle>{t('no_detection_title', { ns: 'archive' })}</AlertTitle>
                      {t('no_detection_desc', { ns: 'archive' })}
                    </InformativeAlert>
                  </div>
                ) : (
                  <>
                    <Detection
                      results={file ? file.results : null}
                      heuristics={file ? file.heuristics : null}
                      force={force}
                      nocollapse
                    />
                    <AttackSection attacks={file ? file.attack_matrix : null} force={force} nocollapse />
                    <ResultSection
                      results={file ? file.results : null}
                      sid={null}
                      alternates={file ? file.alternates : null}
                      force={force}
                      nocollapse
                    />
                    <EmptySection emptys={file ? file.emptys : null} sid={null} nocollapse />
                    <ErrorSection errors={file ? file.errors : null} nocollapse />
                  </>
                )
            },
            tags: {
              label: t('tags'),
              content: (
                <ArchivedTagSection
                  sha256={sha256}
                  signatures={file ? file.signatures : null}
                  tags={file ? file.tags : null}
                  force={force}
                  drawer={inDrawer}
                  nocollapse
                />
              )
            },
            relations: {
              label: t('relations'),
              content: (
                <>
                  <ChildrenSection
                    childrens={file ? file.childrens : null}
                    title={t('childrens', { ns: 'archive' })}
                    show
                    nocollapse
                  />
                  <ParentSection
                    parents={file ? file.parents : null}
                    title={t('parents', { ns: 'archive' })}
                    show
                    nocollapse
                  />
                  <SimilarSection file={file ? file : null} drawer={inDrawer} show nocollapse />
                </>
              )
            },
            ascii: {
              label: t('ascii'),
              content: <ASCIISection sha256={sha256} type={file?.file_info?.type} />
            },
            strings: { label: t('strings'), content: <StringsSection sha256={sha256} type={file?.file_info?.type} /> },
            hex: { label: t('hex'), content: <HexSection sha256={sha256} /> },
            image: {
              label: t('image'),
              disabled: !file?.file_info?.is_section_image,
              content: <ImageSection sha256={sha256} name={sha256} />
            },
            community: {
              label: t('community'),
              content: (
                <>
                  <LabelSection sha256={sha256} labels={file?.file_info?.label_categories} nocollapse />
                  <CommentSection
                    sha256={file?.file_info?.sha256}
                    comments={file ? file?.file_info?.comments : null}
                    drawer={inDrawer}
                    nocollapse
                  />
                </>
              )
            }
          }}
        />
      </Layout>
    );
};

export const ArchiveDetail = React.memo(WrappedArchiveDetail);

export default ArchiveDetail;
