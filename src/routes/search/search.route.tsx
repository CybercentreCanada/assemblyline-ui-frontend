import { FingerprintOutlined, ViewCarouselOutlined } from '@mui/icons-material';
import ArchiveIcon from '@mui/icons-material/Archive';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import CenterFocusStrongOutlinedIcon from '@mui/icons-material/CenterFocusStrongOutlined';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import NotificationImportantOutlinedIcon from '@mui/icons-material/NotificationImportantOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { IconButton, Pagination, Paper, Tab, Tabs, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useApiQuery } from 'core/api';
import { AppLink, useAppNavigate } from 'core/router';
import { createAppRoute, useAppPathParams, useAppSearchSnapshot } from 'core/routes';
import { AppPageContainer, AppPageFullWidth } from 'core/template';
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
import { memo, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertsRoute } from 'routes/alerts/alerts.route';
import { ForbiddenPage } from 'routes/forbidden/forbidden';
import { ManageSignaturesRoute } from 'routes/manage-signatures/manage-signatures.route';
import { RetrohuntRoute } from 'routes/retrohunt/retrohunt.route';
import { AlertsTable } from 'routes/search/components/alerts';
import { FilesTable } from 'routes/search/components/files';
import { ResultsTable } from 'routes/search/components/results';
import { RetrohuntTable } from 'routes/search/components/retrohunt';
import { SignaturesTable } from 'routes/search/components/signatures';
import { SubmissionsTable } from 'routes/search/components/submissions';
import { SubmissionsRoute } from 'routes/submissions/submissions.route';
import { searchResultsDisplay } from 'shared/utils/utils';
import Empty from 'ui/Empty';
import SearchBar from 'ui/SearchBar/search-bar';
import { DEFAULT_SUGGESTION } from 'ui/SearchBar/search-textfield';
import SearchResultCount from 'ui/SearchResultCount';

export const SEARCH_INDICES = ['submission', 'file', 'result', 'signature', 'alert', 'retrohunt'] as const;

export type SearchIndex = (typeof SEARCH_INDICES)[number];

export const SEARCH_PERMISSION_MAP: Record<SearchIndex, Role> = {
  submission: 'submission_view',
  file: 'submission_view',
  result: 'submission_view',
  signature: 'signature_view',
  alert: 'alert_view',
  retrohunt: 'retrohunt_view'
} as const;

export const SEARCH_SORTING_MAP: Record<SearchIndex, string> = {
  submission: SubmissionsRoute.search.getDefaultValues().get('sort'),
  file: 'seen.last desc',
  result: 'created desc',
  signature: ManageSignaturesRoute.search.getDefaultValues().get('sort'),
  alert: AlertsRoute.search.getDefaultValues().get('sort'),
  retrohunt: RetrohuntRoute.search.getDefaultValues().get('sort')
} as const;

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

  const queryValue = useRef<string>('');

  const downSM = useMediaQuery(theme.breakpoints.down('md'));

  const tab = useMemo<SearchIndex>(() => {
    const nextAvailableTab = () => {
      for (const curTab of [...Object.keys(SEARCH_PERMISSION_MAP)] as SearchIndex[]) {
        if (currentUser.roles.includes(SEARCH_PERMISSION_MAP[curTab])) return curTab;
      }
      return 'submission';
    };

    return id || index || nextAvailableTab();
  }, [currentUser.roles, id, index]);

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

  const submissionResults = useApiQuery<SearchResult<SubmissionIndexed>>({
    url: `/api/v4/search/submission/`,
    method: 'POST',
    disabled: !currentUser.roles.includes('submission_view') || (!!id && id !== 'submission') || !search.get('query'),
    body: search
      .set(s => ({
        ...s,
        ...((index || id) === 'submission'
          ? null
          : { ...search.defaults().pick(['offset', 'rows']).toObject(), sort: SEARCH_SORTING_MAP.submission })
      }))
      .pick(['query', 'offset', 'rows', 'sort', 'use_archive'])
      .toObject(),
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
    body: search
      .set(s => ({
        ...s,
        ...((index || id) === 'file'
          ? null
          : { ...search.defaults().pick(['offset', 'rows']).toObject(), sort: SEARCH_SORTING_MAP.file })
      }))
      .pick(['query', 'offset', 'rows', 'sort', 'use_archive'])
      .toObject(),
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
    body: search
      .set(s => ({
        ...s,
        ...((index || id) === 'result'
          ? null
          : { ...search.defaults().pick(['offset', 'rows']).toObject(), sort: SEARCH_SORTING_MAP.result })
      }))
      .pick(['query', 'offset', 'rows', 'sort', 'use_archive'])
      .toObject(),
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
    body: search
      .set(s => ({
        ...s,
        ...((index || id) === 'signature'
          ? null
          : { ...search.defaults().pick(['offset', 'rows']).toObject(), sort: SEARCH_SORTING_MAP.signature })
      }))
      .pick(['query', 'offset', 'rows', 'sort', 'use_archive'])
      .toObject(),
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
    body: search
      .set(s => ({
        ...s,
        ...((index || id) === 'alert'
          ? null
          : { ...search.defaults().pick(['offset', 'rows']).toObject(), sort: SEARCH_SORTING_MAP.alert })
      }))
      .pick(['query', 'offset', 'rows', 'sort', 'use_archive'])
      .toObject(),
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
    body: search
      .set(s => ({
        ...s,
        ...((index || id) === 'retrohunt'
          ? null
          : { ...search.defaults().pick(['offset', 'rows']).toObject(), sort: SEARCH_SORTING_MAP.retrohunt })
      }))
      .pick(['query', 'offset', 'rows', 'sort', 'use_archive'])
      .toObject(),
    onFailure: api_data => {
      if (index || id || !api_data.api_error_message.includes('Rewrite first')) {
        showErrorMessage(api_data.api_error_message);
      }
    }
  });

  const resMap = useMemo<Record<SearchIndex, SearchResult<unknown>>>(
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

  return (id && !currentUser.roles.includes(SEARCH_PERMISSION_MAP[index || id])) ||
    (!id && Object.values(SEARCH_PERMISSION_MAP).every(val => !currentUser.roles.includes(val))) ||
    (id === 'retrohunt' && !configuration.retrohunt.enabled) ? (
    <ForbiddenPage />
  ) : (
    <AppPageFullWidth>
      <div style={{ paddingBottom: theme.spacing(2), textAlign: 'left', width: '100%' }}>
        <Typography variant="h4">{t(`title_${index || id || 'all'}`)}</Typography>
      </div>

      <AppPageContainer isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchBar
            initValue={search ? search.get('query') : ''}
            searching={
              tab === 'alert'
                ? alertResults.isFetching
                : tab === 'file'
                  ? fileResults.isFetching
                  : tab === 'result'
                    ? resultResults.isFetching
                    : tab === 'retrohunt'
                      ? retrohuntResults.isFetching
                      : tab === 'signature'
                        ? signatureResults.isFetching
                        : submissionResults.isFetching
            }
            placeholder={t(`search_${index || id || 'all'}`)}
            suggestions={suggestions}
            onValueChange={(inputValue: string) => {
              queryValue.current = inputValue;
            }}
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
                onChange={(e, v: SearchIndex) =>
                  navigate.here<'/search/:index'>().update(s => ({
                    ...s,
                    search: { ...s.search, index: v, offset: 0, sort: SEARCH_SORTING_MAP?.[v] }
                  }))
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
                      !submissionResults.isFetching ? searchResultsDisplay(submissionResults.data.total) : '...'
                    })`}
                    value="submission"
                  />
                ) : (
                  <Empty />
                )}
                {currentUser.roles.includes('submission_view') ? (
                  <Tab
                    label={`${t('file')} (${!fileResults.isFetching ? searchResultsDisplay(fileResults.data.total) : '...'})`}
                    value="file"
                  />
                ) : (
                  <Empty />
                )}
                {currentUser.roles.includes('submission_view') ? (
                  <Tab
                    label={`${t('result')} (${!resultResults.isFetching ? searchResultsDisplay(resultResults.data.total) : '...'})`}
                    value="result"
                  />
                ) : (
                  <Empty />
                )}
                {currentUser.roles.includes('signature_view') ? (
                  <Tab
                    label={`${t('signature')} (${
                      !signatureResults.isFetching ? searchResultsDisplay(signatureResults.data.total) : '...'
                    })`}
                    value="signature"
                  />
                ) : (
                  <Empty />
                )}
                {currentUser.roles.includes('alert_view') ? (
                  <Tab
                    label={`${t('alert')} (${!alertResults.isFetching ? searchResultsDisplay(alertResults.data.total) : '...'})`}
                    value="alert"
                  />
                ) : (
                  <Empty />
                )}
                {currentUser.roles.includes(SEARCH_PERMISSION_MAP.retrohunt) && configuration.retrohunt.enabled ? (
                  <Tab
                    label={`${t('retrohunt')} (${
                      !retrohuntResults.isFetching ? searchResultsDisplay(retrohuntResults.data.total) : '...'
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
                        nav.here<'/search/:index'>().create(s => ({
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
      </AppPageContainer>
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
    </AppPageFullWidth>
  );
};

SearchPage.displayName = 'SearchPage';

//*****************************************************************************************
// Search Route
//*****************************************************************************************

export const SearchRoute = createAppRoute({
  component: memo(() => <SearchPage />),

  path: '/search/:index',
  params: s => ({
    index: s.enum(SEARCH_INDICES, 'submission')
  }),
  search: s => ({
    index: s.enum(null, SEARCH_INDICES).nullable(),
    query: s.string(''),
    offset: s.number(0).min(0).source('transient').ephemeral(),
    rows: s.number(25).locked().source('transient').ephemeral(),
    sort: s.string(null).ephemeral(),
    use_archive: s.boolean(false)
  }),

  ancestor: '/search',
  shortname: location => {
    switch (location?.path?.index) {
      case 'alert':
        return ['app_route.search_index.alert.shortname', { ns: 'search' }];
      case 'file':
        return ['app_route.search_index.file.shortname', { ns: 'search' }];
      case 'result':
        return ['app_route.search_index.result.shortname', { ns: 'search' }];
      case 'retrohunt':
        return ['app_route.search_index.retrohunt.shortname', { ns: 'search' }];
      case 'signature':
        return ['app_route.search_index.signature.shortname', { ns: 'search' }];
      case 'submission':
        return ['app_route.search_index.submission.shortname', { ns: 'search' }];
      default:
        return ['app_route.search_index.shortname', { ns: 'search' }];
    }
  },
  fullname: location => ['app_route.search_index.fullname', { ns: 'search', index: location.path.index }],
  shorticon: location => {
    switch (location?.path?.index) {
      case 'alert':
        return <NotificationImportantOutlinedIcon />;
      case 'file':
        return <DescriptionOutlinedIcon />;
      case 'result':
        return <DescriptionOutlinedIcon />;
      case 'retrohunt':
        return <DataObjectOutlinedIcon />;
      case 'signature':
        return <FingerprintOutlined />;
      case 'submission':
        return <ViewCarouselOutlined />;
      default:
        return <SearchIcon />;
    }
  },
  fullicon: () => <SearchIcon />,

  disabled: () => false,
  forbidden: () => false
});

export const SearchRootRoute = createAppRoute({
  component: memo(() => <SearchPage />),

  path: '/search',
  search: s => ({
    index: s.enum(null, SEARCH_INDICES).nullable(),
    query: s.string(''),
    offset: s.number(0).min(0).source('transient').ephemeral(),
    rows: s.number(25).locked().source('transient').ephemeral(),
    sort: s.string(null).ephemeral(),
    use_archive: s.boolean(false)
  }),

  ancestor: null,
  shortname: () => ['app_route.search_root.shortname', { ns: 'search' }],
  fullname: () => ['app_route.search_root.fullname', { ns: 'search' }],
  shorticon: () => <SearchIcon />,
  fullicon: () => <SearchIcon />,

  disabled: () => false,
  forbidden: () => false
});
