import BlockIcon from '@mui/icons-material/Block';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import RecordVoiceOverOutlinedIcon from '@mui/icons-material/RecordVoiceOverOutlined';
import { useTheme } from '@mui/material';
import useMyAPI from 'core/api/hooks/useMyAPI';
import useALContext from 'core/config/useALContext';
import { createAppRoute, useAppNavigate, useAppSearchSnapshot } from 'core/router';
import PageContainer from 'core/template/branding/AppPageContainer';
import { useAppUser } from 'core/template/components/app/hooks';
import PageFullWidth from 'core/template/components/pages/PageFullWidth';
import type { SearchResult } from 'models/api/search';
import type { CustomUser, IndexDefinition } from 'models/api/user';
import type { Signature } from 'models/base/signature';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ForbiddenPage } from 'routes/forbidden/forbidden.page';
import SignaturesTable from 'routes/search/components/signatures';
import { FileDownloader } from 'ui/buttons/FileDownloader';
import { PageHeader } from 'ui/layouts/PageHeader';
import { DEFAULT_SUGGESTION } from 'ui/SearchBar/search-textfield';
import SearchHeader from 'ui/SearchBar/SearchHeader';

export const ManageSignaturesContent = memo(() => {
  const { t } = useTranslation(['manageSignatures']);
  const theme = useTheme();
  const navigate = useAppNavigate<'/manage/signatures'>();
  const search = useAppSearchSnapshot<'/manage/signatures'>();
  const { apiCall } = useMyAPI();

  const { indexes } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();

  const [signatureResults, setSignatureResults] = useState<SearchResult<Signature>>(null);
  const [searching, setSearching] = useState<boolean>(false);

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
      navigate.here().update(s => ({
        ...s,
        search: {
          ...s.search,
          offset: 0,
          filters: s.search.filters.includes(filter)
            ? s.search.filters.filter(value => value !== filter)
            : [...s.search.filters, filter]
        }
      }));
    },
    [navigate]
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

  useEffect(() => {
    handleReload(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleReload, search.toString()]);

  useEffect(() => {
    function reload() {
      navigate.here().update(s => ({ ...s, search: { ...s.search, offset: 0, refresh: !s.search.refresh } }));
    }

    window.addEventListener('reloadSignatures', reload);
    return () => {
      window.removeEventListener('reloadSignatures', reload);
    };
  }, [navigate]);

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
            onChange={values =>
              navigate.here().update(s => ({
                ...s,
                search: { ...s.search, ...ManageSignaturesRoute.search.full(values).toObject() }
              }))
            }
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
        <SignaturesTable signatureResults={signatureResults} />
      </div>
    </PageFullWidth>
  ) : (
    <ForbiddenPage />
  );
});

export const ManageSignaturesPage = memo(() => <ManageSignaturesContent />);
ManageSignaturesPage.displayName = 'ManageSignaturesPage';

export const ManageSignaturesRoute = createAppRoute({
  component: ManageSignaturesPage,

  path: '/manage/signatures',
  search: s => ({
    query: s.string(''),
    offset: s.number(0).min(0).source('transient').ephemeral(),
    rows: s.number(25).locked().source('transient').ephemeral(),
    sort: s.string('type asc').ephemeral(),
    filters: s.filters([]),
    track_total_hits: s.number(10000).nullable().ephemeral(),
    refresh: s.boolean(false).source('transient').ephemeral()
  }),

  ancestor: '/manage',
  shortname: () => ['app_route.manage_signatures.shortname', { ns: 'manageSignatures' }],
  fullname: () => ['app_route.manage_signatures.fullname', { ns: 'manageSignatures' }],
  shorticon: () => <FingerprintOutlinedIcon />,
  fullicon: () => <FingerprintOutlinedIcon />,

  disabled: () => false,
  forbidden: (_location, config) => !config.user.roles.includes('signature_view')
});
