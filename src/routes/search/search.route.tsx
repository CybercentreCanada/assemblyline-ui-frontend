import ArchiveIcon from '@mui/icons-material/Archive';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import CenterFocusStrongOutlinedIcon from '@mui/icons-material/CenterFocusStrongOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { IconButton, Pagination, Paper, Tab, Tabs, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useApiQuery } from 'core/api';
import { AppLink, useAppNavigate } from 'core/router';
import { createAppRoute, useAppPathParams, useAppSearchSnapshot } from 'core/routes';
import useALContext from 'deprecated/hooks/useALContext';
import useMySnackbar from 'deprecated/hooks/useMySnackbar';
import type { SearchResult } from 'models/api/search';
import type { IndexDefinition, Indexes } from 'models/api/user';
import type { AlertIndexed } from 'models/base/alert';
import type { FileIndexed } from 'models/base/file';
import type { ResultIndexed } from 'models/base/result';
import type { RetrohuntIndexed } from 'models/base/retrohunt';
import type { SignatureIndexed } from 'models/base/signature';
import type { SubmissionIndexed } from 'models/base/submission';
import type { Role } from 'models/base/user';
import type React from 'react';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ForbiddenPage } from 'routes/forbidden/forbidden';
import { AlertsTable } from 'routes/search/components/alerts';
import { FilesTable } from 'routes/search/components/files';
import { ResultsTable } from 'routes/search/components/results';
import { RetrohuntTable } from 'routes/search/components/retrohunt';
import { SignaturesTable } from 'routes/search/components/signatures';
import { SubmissionsTable } from 'routes/search/components/submissions';
import { searchResultsDisplay } from 'shared/utils/utils';
import Empty from 'ui/Empty';
import { PageContainer } from 'ui/pages/PageContainer';
import { PageFullWidth } from 'ui/pages/PageFullWidth';
import SearchBar from 'ui/SearchBar/search-bar';
import { DEFAULT_SUGGESTION } from 'ui/SearchBar/search-textfield';
import SearchResultCount from 'ui/SearchResultCount';

export const INDEX_OPTIONS = ['submission', 'file', 'result', 'signature', 'alert', 'retrohunt'] as const;

export type Index = (typeof INDEX_OPTIONS)[number];

type SearchIndexes = Pick<Indexes, Index>;

//*****************************************************************************************
// Search Page
//*****************************************************************************************

export const SearchPage = () => {
  const { t } = useTranslation(['search']);
  const theme = useTheme();
  const id = useAppPathParams<'/search/:index'>()?.index;
  const search = useAppSearchSnapshot<'/search/:index'>();
  const navigate = useAppNavigate();
  const { indexes, user: currentUser, configuration } = useALContext();
  const { showErrorMessage } = useMySnackbar();

  const index = search.get('index');

  const downSM = useMediaQuery(theme.breakpoints.down('md'));

  const permissionMap = useMemo<Record<Index, Role>>(
    () => ({
      submission: 'submission_view',
      file: 'submission_view',
      result: 'submission_view',
      signature: 'signature_view',
      alert: 'alert_view',
      retrohunt: 'retrohunt_view'
    }),
    []
  );

  const tab = useMemo<Index>(() => {
    const nextAvailableTab = () => {
      for (const curTab of [...Object.keys(permissionMap)] as Index[]) {
        if (currentUser.roles.includes(permissionMap[curTab])) return curTab;
      }
      return 'submission';
    };

    return id || index || nextAvailableTab();
  }, [currentUser.roles, id, index, permissionMap]);

  const suggestions = useMemo(() => {
    let indexFields: IndexDefinition = {};
    if (index || id) {
      indexFields = indexes?.[(index || id) as keyof Indexes] || {};
    } else {
      indexFields = Object.values(indexes).reduce(
        (prev, current) => ({
          ...prev,
          ...Object.fromEntries(Object.entries(current).filter(([, value]) => value?.indexed))
        }),
        {}
      );
    }
    return { ...indexFields, ...DEFAULT_SUGGESTION };
  }, [id, index, indexes]);

  const getBody = useCallback(
    (value: Index) =>
      index === value
        ? search.pick(['query', 'offset', 'rows', 'sort', 'use_archive']).toObject()
        : search
            .omit(['index'])
            .set(s => ({ ...s, ...search.defaults().pick(['offset', 'rows', 'sort']).toObject() }))
            .pick(['query', 'offset', 'rows', 'sort', 'use_archive'])
            .toObject(),
    [index, search]
  );

  const submissionResults = useApiQuery<SearchResult<SubmissionIndexed>>({
    url: `/api/v4/search/submission/`,
    method: 'POST',
    disabled: !currentUser.roles.includes('submission_view') || (!!id && id !== 'submission') || !search.get('query'),
    body: getBody('submission'),
    onFailure: api_data => {
      if (index || id || !api_data.api_error_message.includes('Rewrite first')) {
        showErrorMessage(api_data.api_error_message);
      }
    }
  });

  const fileResults = useApiQuery<SearchResult<FileIndexed>>({
    url: `/api/v4/search/file/`,
    method: 'POST',
    disabled: !currentUser.roles.includes('submission_view') || (!!id && id !== 'file') || !search.get('query'),
    body: getBody('file'),
    onFailure: api_data => {
      if (index || id || !api_data.api_error_message.includes('Rewrite first')) {
        showErrorMessage(api_data.api_error_message);
      }
    }
  });

  const resultResults = useApiQuery<SearchResult<ResultIndexed>>({
    url: `/api/v4/search/result/`,
    method: 'POST',
    disabled: !currentUser.roles.includes('submission_view') || (!!id && id !== 'result') || !search.get('query'),
    body: getBody('result'),
    onFailure: api_data => {
      if (index || id || !api_data.api_error_message.includes('Rewrite first')) {
        showErrorMessage(api_data.api_error_message);
      }
    }
  });

  const signatureResults = useApiQuery<SearchResult<SignatureIndexed>>({
    url: `/api/v4/search/signature/`,
    method: 'POST',
    disabled: !currentUser.roles.includes('signature_view') || (!!id && id !== 'signature') || !search.get('query'),
    body: getBody('signature'),
    onFailure: api_data => {
      if (index || id || !api_data.api_error_message.includes('Rewrite first')) {
        showErrorMessage(api_data.api_error_message);
      }
    }
  });

  const alertResults = useApiQuery<SearchResult<AlertIndexed>>({
    url: `/api/v4/search/alert/`,
    method: 'POST',
    disabled: !currentUser.roles.includes('alert_view') || (!!id && id !== 'alert') || !search.get('query'),
    body: getBody('alert'),
    onFailure: api_data => {
      if (index || id || !api_data.api_error_message.includes('Rewrite first')) {
        showErrorMessage(api_data.api_error_message);
      }
    }
  });

  const retrohuntResults = useApiQuery<SearchResult<RetrohuntIndexed>>({
    url: `/api/v4/search/retrohunt/`,
    method: 'POST',
    disabled:
      !currentUser.roles.includes('retrohunt_view') ||
      !configuration?.retrohunt?.enabled ||
      (!!id && id !== 'retrohunt') ||
      !search.get('query'),
    body: getBody('retrohunt'),
    onFailure: api_data => {
      if (index || id || !api_data.api_error_message.includes('Rewrite first')) {
        showErrorMessage(api_data.api_error_message);
      }
    }
  });

  const resMap = useMemo<Record<Index, SearchResult<unknown>>>(
    () => ({
      submission: submissionResults.data,
      file: fileResults.data,
      result: resultResults.data,
      signature: signatureResults.data,
      alert: alertResults.data,
      retrohunt: retrohuntResults.data
    }),
    [alertResults, fileResults, resultResults, retrohuntResults, signatureResults, submissionResults]
  );

  const TabSpacer = useCallback(() => <div style={{ flexGrow: 1 }} />, []);

  const SpecialTab = useCallback(({ children }: { children: React.ReactNode }) => children, []);

  return (id && !currentUser.roles.includes(permissionMap[(index || id) as keyof SearchIndexes])) ||
    (!id && Object.values(permissionMap).every(val => !currentUser.roles.includes(val))) ||
    (id === 'retrohunt' && !configuration.retrohunt.enabled) ? (
    <ForbiddenPage />
  ) : (
    <PageFullWidth margin={4}>
      <div style={{ paddingBottom: theme.spacing(2), textAlign: 'left', width: '100%' }}>
        <Typography variant="h4">{t(`title_${index || id || 'all'}`)}</Typography>
      </div>

      <PageContainer isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchBar
            initValue={search ? search.get('query') : ''}
            // searching={searching}
            placeholder={t(`search_${index || id || 'all'}`)}
            suggestions={suggestions}
            onClear={() =>
              navigate.here<'/search/:index'>().update(s => ({ ...s, search: { ...s.search, query: '', offset: 0 } }))
            }
            onSearch={value =>
              navigate
                .here<'/search/:index'>()
                .update(s => ({ ...s, search: { ...s.search, query: value, offset: 0 } }))
            }
            buttons={
              configuration.datastore.archive.enabled &&
              currentUser.roles.includes('archive_view') &&
              ['submission', 'result', 'file', 'all'].includes((index || id || 'all') as string)
                ? [
                    {
                      icon:
                        search && search.get('use_archive') ? (
                          <ArchiveIcon fontSize={downSM ? 'small' : 'medium'} />
                        ) : (
                          <ArchiveOutlinedIcon fontSize={downSM ? 'small' : 'medium'} />
                        ),
                      tooltip:
                        search && search.get('use_archive') ? t('use_archive.turn_off') : t('use_archive.turn_on'),
                      props: {
                        onClick: () => {
                          navigate.here<'/search/:index'>().update(s => ({
                            ...s,
                            search: { ...s.search, offset: 0, use_archive: !s.search.use_archive }
                          }));
                        }
                      }
                    }
                  ]
                : []
            }
          />

          {!id && search.get('query') && (
            <Paper square style={{ marginBottom: theme.spacing(0.5) }}>
              <Tabs
                value={tab}
                onChange={(e, v: Index) =>
                  navigate
                    .here<'/search/:index'>()
                    .update(s => ({ ...s, search: { ...s.search, index: v, offset: 0, sort: null } }))
                }
                allowScrollButtonsMobile
                indicatorColor="primary"
                scrollButtons="auto"
                textColor="primary"
                variant="scrollable"
                sx={{
                  minHeight: 'unset',
                  [theme.breakpoints.up('md')]: {
                    '& [role=tab]': {
                      padding: '8px 20px',
                      fontSize: '13px',
                      minHeight: 'unset',
                      minWidth: 'unset'
                    }
                  },
                  [theme.breakpoints.down('sm')]: {
                    minHeight: 'unset',
                    '& [role=tab]': {
                      fontSize: '12px',
                      minHeight: 'unset',
                      minWidth: 'unset'
                    }
                  }
                }}
              >
                {currentUser.roles.includes('submission_view') ? (
                  <Tab
                    label={`${t('submission')} (${
                      !submissionResults.isPending ? searchResultsDisplay(submissionResults.data.total) : '...'
                    })`}
                    value="submission"
                  />
                ) : (
                  <Empty />
                )}
                {currentUser.roles.includes('submission_view') ? (
                  <Tab
                    label={`${t('file')} (${!fileResults.isPending ? searchResultsDisplay(fileResults.data.total) : '...'})`}
                    value="file"
                  />
                ) : (
                  <Empty />
                )}
                {currentUser.roles.includes('submission_view') ? (
                  <Tab
                    label={`${t('result')} (${!resultResults.isPending ? searchResultsDisplay(resultResults.data.total) : '...'})`}
                    value="result"
                  />
                ) : (
                  <Empty />
                )}
                {currentUser.roles.includes('signature_view') ? (
                  <Tab
                    label={`${t('signature')} (${
                      !signatureResults.isPending ? searchResultsDisplay(signatureResults.data.total) : '...'
                    })`}
                    value="signature"
                  />
                ) : (
                  <Empty />
                )}
                {currentUser.roles.includes('alert_view') ? (
                  <Tab
                    label={`${t('alert')} (${!alertResults.isPending ? searchResultsDisplay(alertResults.data.total) : '...'})`}
                    value="alert"
                  />
                ) : (
                  <Empty />
                )}
                {currentUser.roles.includes(permissionMap.retrohunt) && configuration.retrohunt.enabled ? (
                  <Tab
                    label={`${t('retrohunt')} (${
                      !retrohuntResults.isPending ? searchResultsDisplay(retrohuntResults.data.total) : '...'
                    })`}
                    value="retrohunt"
                  />
                ) : (
                  <Empty />
                )}
                <TabSpacer />
                <SpecialTab>
                  <Tooltip title={t('focus_search')}>
                    <IconButton
                      size={downSM ? 'small' : 'medium'}
                      component={AppLink}
                      nav={nav =>
                        nav.here().create(s => ({
                          route: '/search/:index',
                          path: { index: tab },
                          search: { ...s.search, index: null }
                        }))
                      }
                      navDeps={[tab, location.search]}
                    >
                      <CenterFocusStrongOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </SpecialTab>
              </Tabs>
            </Paper>
          )}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginBottom: theme.spacing(0.5),
              justifyContent: 'flex-end'
            }}
          >
            {resMap[tab] && resMap[tab].total !== 0 && id && (
              <div
                style={{
                  paddingLeft: theme.spacing(1),
                  color: theme.palette.primary.main,
                  fontStyle: 'italic'
                }}
              >
                <SearchResultCount count={resMap[tab].total} />
                {t(resMap[tab].total === 1 ? 'matching_result' : 'matching_results')}
              </div>
            )}
            <div style={{ flexGrow: 1 }} />
            {resMap[tab] && resMap[tab].total > search.get('rows') && (
              <Pagination
                page={(search.get('offset') ?? 0) / search.get('rows') + 1}
                count={Math.ceil(Math.min(resMap[tab].total, 10000) / search.get('rows'))}
                shape="rounded"
                size="small"
                onChange={(_e, page) =>
                  navigate
                    .here<'/search/:index'>()
                    .update(s => ({ ...s, search: { ...s.search, offset: (page - 1) * search.get('rows') } }))
                }
              />
            )}
          </div>
        </div>
      </PageContainer>
      {search.get('query') && (
        <div
          style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}
        >
          {tab === 'alert' && <AlertsTable alertResults={alertResults.data} />}
          {tab === 'file' && <FilesTable fileResults={fileResults.data} />}
          {tab === 'result' && <ResultsTable resultResults={resultResults.data} />}
          {tab === 'retrohunt' && <RetrohuntTable retrohuntResults={retrohuntResults.data} />}
          {tab === 'signature' && <SignaturesTable signatureResults={signatureResults.data} />}
          {tab === 'submission' && <SubmissionsTable submissionResults={submissionResults.data} ignoreFilters />}
        </div>
      )}
    </PageFullWidth>
  );
};

SearchPage.displayName = 'SearchPage';

//*****************************************************************************************
// Search Route
//*****************************************************************************************

export const SearchRoute = createAppRoute({
  title: {
    ns: 'app',
    key: 'drawer.search'
  },
  icon: {
    primary: <SearchIcon />
  },
  ancestor: null,
  component: memo(() => <SearchPage />),
  path: '/search/:index',
  params: s => ({
    index: s.enum(INDEX_OPTIONS, 'submission')
  }),
  search: s => ({
    index: s.enum(null, INDEX_OPTIONS).nullable(),
    query: s.string(''),
    offset: s.number(0).min(0).source('transient').ephemeral(),
    rows: s.number(25).locked().source('transient').ephemeral(),
    sort: s.string(null).ephemeral(),
    use_archive: s.boolean(false)
  })
});

export const SearchRootRoute = createAppRoute({
  title: {
    ns: 'app',
    key: 'drawer.search'
  },
  icon: {
    primary: <SearchIcon />
  },
  ancestor: null,
  component: memo(() => <SearchPage />),
  path: '/search',
  search: s => ({
    index: s.enum(null, INDEX_OPTIONS).nullable(),
    query: s.string(''),
    offset: s.number(0).min(0).source('transient').ephemeral(),
    rows: s.number(25).locked().source('transient').ephemeral(),
    sort: s.string(null).ephemeral(),
    use_archive: s.boolean(false)
  })
});
