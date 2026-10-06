import BlockIcon from '@mui/icons-material/Block';
import RecordVoiceOverOutlinedIcon from '@mui/icons-material/RecordVoiceOverOutlined';
import { useMediaQuery, useTheme } from '@mui/material';
import useALContext from 'core/config/useALContext';
import PageContainer from 'core/template/branding/AppPageContainer';
import { useAppUser } from 'core/template/components/app/hooks';
import PageFullWidth from 'core/template/components/pages/PageFullWidth';
import useMyAPI from 'deprecated/hooks/useMyAPI';
import { createSearchParams, SearchParamsProvider, useSearchParams } from 'features/SearchParams/createSearchParams';
import useDrawer from 'layout/drawer/useDrawer';
import type { SearchResult } from 'models/api/search';
import type { CustomUser, IndexDefinition } from 'models/api/user';
import type { Signature } from 'models/base/signature';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import ForbiddenPage from 'routes/forbidden/forbidden';
import SignatureDetail from 'routes/manage-signature-detail/manage-signature-detail.route';
import SignaturesTable from 'routes/search/components/signatures';
import { FileDownloader } from 'ui/buttons/FileDownloader';
import { PageHeader } from 'ui/layouts/PageHeader';
import { DEFAULT_SUGGESTION } from 'ui/SearchBar/search-textfield';
import SearchHeader from 'ui/SearchBar/SearchHeader';

export const SIGNATURES_PARAMS = createSearchParams(p => ({
  query: p.string(''),
  offset: p.number(0).min(0).origin('snapshot').ephemeral(),
  rows: p.number(25).locked().origin('snapshot').ephemeral(),
  sort: p.string('type asc').ephemeral(),
  filters: p.filters([]),
  track_total_hits: p.number(10000).nullable().ephemeral(),
  refresh: p.boolean(false).origin('snapshot').ephemeral()
}));

export type SignaturesParams = typeof SIGNATURES_PARAMS;

const SignaturesSearch = () => {
  const { t } = useTranslation(['manageSignatures']);
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();

  const { indexes } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();
  const { globalDrawerOpened, setGlobalDrawer, closeGlobalDrawer } = useDrawer();
  const { search, setSearchParams, setSearchObject } = useSearchParams<SignaturesParams>();

  const [signatureResults, setSignatureResults] = useState<SearchResult<Signature>>(null);
  const [searching, setSearching] = useState<boolean>(false);

  const isXL = useMediaQuery(theme.breakpoints.only('xl'));

  const suggestions = useMemo<IndexDefinition>(
    () => ({ ...indexes.signature, ...DEFAULT_SUGGESTION }),
    [indexes.signature]
  );

  const downloadLink = useMemo<string>(
    () =>
      search
        .set(o => ({ ...o, query: [o.query || '*', ...o.filters].join(' && ') }))
        .pick(['query'])
        .toString(),
    [search]
  );

  const handleToggleFilter = useCallback(
    (filter: string) => {
      setSearchObject(o => {
        const filters = o.filters.includes(filter) ? o.filters.filter(f => f !== filter) : [...o.filters, filter];
        return { ...o, offset: 0, filters };
      });
    },
    [setSearchObject]
  );

  const handleReload = useCallback(
    (body: typeof search) => {
      if (!currentUser.roles.includes('signature_view')) return;

      apiCall<SearchResult<Signature>>({
        url: '/api/v4/search/signature/',
        method: 'POST',
        body: body
          .set(o => ({ ...o, query: o.query || '*' }))
          .omit(['refresh'])
          .toObject(),
        onSuccess: ({ api_response }) => setSignatureResults(api_response),
        onEnter: () => setSearching(true),
        onExit: () => setSearching(false)
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser.roles]
  );

  const setSignatureID = useCallback(
    (sig_id: string) => navigate(`${location.pathname}${location.search || ''}#${sig_id}`),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.search]
  );

  const handleSignatureUpdated = () => {
    if (!isXL) closeGlobalDrawer();
    setTimeout(() => window.dispatchEvent(new CustomEvent('reloadSignatures')), 1000);
  };

  const handleSignatureDeleted = () => {
    closeGlobalDrawer();
    setTimeout(() => window.dispatchEvent(new CustomEvent('reloadSignatures')), 1000);
  };

  useEffect(() => {
    if (!location.hash || globalDrawerOpened || !signatureResults) return;
    navigate(`${location.pathname}${location.search || ''}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDrawerOpened]);

  useEffect(() => {
    if (location.hash) {
      setGlobalDrawer(
        <SignatureDetail
          signature_id={location.hash.substr(1)}
          onUpdated={handleSignatureUpdated}
          onDeleted={handleSignatureDeleted}
        />
      );
    } else {
      closeGlobalDrawer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  useEffect(() => {
    handleReload(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleReload, search.toString()]);

  useEffect(() => {
    function reload() {
      setSearchObject(o => ({ ...o, offset: 0, refresh: !o.refresh }));
    }

    window.addEventListener('reloadSignatures', reload);
    return () => {
      window.removeEventListener('reloadSignatures', reload);
    };
  }, [setSearchObject]);

  return currentUser.roles.includes('signature_view') ? (
    <PageFullWidth margin={4}>
      <PageHeader
        primary={t('title')}
        slotProps={{
          root: { style: { marginBottom: theme.spacing(2) } }
        }}
        actions={
          <FileDownloader
            link={`/api/v4/signature/download/?${downloadLink}`}
            preventRender={!currentUser.roles.includes('signature_download')}
            tooltip={t('download_desc')}
          />
        }
      />

      <PageContainer isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchHeader
            params={search.toParams()}
            loading={searching}
            results={signatureResults}
            resultLabel={
              search.get('query')
                ? t(`filtered${signatureResults?.total === 1 ? '' : 's'}`)
                : t(`total${signatureResults?.total === 1 ? '' : 's'}`)
            }
            onChange={v => setSearchParams(v)}
            paramDefaults={search.defaults().toObject()}
            searchInputProps={{ placeholder: t('filter'), options: suggestions }}
            actionProps={[
              {
                tooltip: {
                  title: search.has('filters', 'status:NOISY') ? t('filter.noisy.remove') : t('filter.noisy.add')
                },
                icon: { children: <RecordVoiceOverOutlinedIcon /> },
                button: {
                  color: search.has('filters', 'status:NOISY') ? 'primary' : 'default',
                  onClick: () => handleToggleFilter('status:NOISY')
                }
              },
              {
                tooltip: {
                  title: search.has('filters', 'status:DISABLED')
                    ? t('filter.disabled.remove')
                    : t('filter.disabled.add')
                },
                icon: { children: <BlockIcon /> },
                button: {
                  color: search.has('filters', 'status:DISABLED') ? 'primary' : 'default',
                  onClick: () => handleToggleFilter('status:DISABLED')
                }
              }
            ]}
          />
        </div>
      </PageContainer>

      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        <SignaturesTable signatureResults={signatureResults} setSignatureID={setSignatureID} />
      </div>
    </PageFullWidth>
  ) : (
    <ForbiddenPage />
  );
};

const WrappedSignaturesPage = () => (
  <SearchParamsProvider params={SIGNATURES_PARAMS}>
    <SignaturesSearch />
  </SearchParamsProvider>
);

export const SignaturesPage = React.memo(WrappedSignaturesPage);
export default SignaturesPage;
