import ArchiveIcon from '@mui/icons-material/Archive';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import CenterFocusStrongOutlinedIcon from '@mui/icons-material/CenterFocusStrongOutlined';
import { IconButton, Paper, Tab, Tabs, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { createAppRoute } from 'core/routes';
import useALContext from 'deprecated/hooks/useALContext';
import useMyAPI from 'deprecated/hooks/useMyAPI';
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
import AlertsTable from 'pages/search/components/alerts';
import FilesTable from 'pages/search/components/files';
import ResultsTable from 'pages/search/components/results';
import RetrohuntTable from 'pages/search/components/retrohunt';
import SignaturesTable from 'pages/search/components/signatures';
import SubmissionsTable from 'pages/search/components/submissions';
import type { Dispatch, SetStateAction } from 'react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { searchResultsDisplay } from 'shared/utils/utils';
import Empty from 'ui/Empty';
import { PageContainer } from 'ui/pages/PageContainer';
import { PageFullWidth } from 'ui/pages/PageFullWidth';
import SearchBar from 'ui/SearchBar/search-bar';
import { DEFAULT_SUGGESTION } from 'ui/SearchBar/search-textfield';
import SimpleSearchQuery from 'ui/SearchBar/simple-search-query';
import SearchPager from 'ui/SearchPager';
import SearchResultCount from 'ui/SearchResultCount';

const PAGE_SIZE = 25;

type SearchIndexes = Pick<Indexes, 'submission' | 'file' | 'result' | 'signature' | 'alert' | 'retrohunt'>;

type Params = {
  id: string;
};

//*****************************************************************************************
// Search Page
//*****************************************************************************************

type SearchPageProps = {
  index?: string | null;
};

export const SearchPage = memo(({ index = null }: SearchPageProps) => {
  const { id } = useParams<Params>();
  const { t } = useTranslation(['search']);
  const [pageSize] = useState<number>(PAGE_SIZE);
  const [searching, setSearching] = useState<boolean>(false);
  const { indexes, user: currentUser, configuration } = useALContext();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const [query, setQuery] = useState<SimpleSearchQuery>(null);
  const [searchSuggestion, setSearchSuggestion] = useState<IndexDefinition>(null);
  const [tab, setTab] = useState(null);
  const { showErrorMessage } = useMySnackbar();
  const downSM = useMediaQuery(theme.breakpoints.down('md'));

  // Result lists
  const [submissionResults, setSubmissionResults] = useState<SearchResult<SubmissionIndexed>>(null);
  const [fileResults, setFileResults] = useState<SearchResult<FileIndexed>>(null);
  const [resultResults, setResultResults] = useState<SearchResult<ResultIndexed>>(null);
  const [signatureResults, setSignatureResults] = useState<SearchResult<SignatureIndexed>>(null);
  const [alertResults, setAlertResults] = useState<SearchResult<AlertIndexed>>(null);
  const [retrohuntResults, setRetrohuntResults] = useState<SearchResult<RetrohuntIndexed>>(null);

  // Current index
  const currentIndex = index || id;

  const stateMap = useMemo<Record<keyof SearchIndexes, Dispatch<SetStateAction<SearchResult<unknown>>>>>(
    () => ({
      submission: setSubmissionResults,
      file: setFileResults,
      result: setResultResults,
      signature: setSignatureResults,
      alert: setAlertResults,
      retrohunt: setRetrohuntResults
    }),
    []
  );

  const resMap = useMemo<Record<keyof SearchIndexes, SearchResult<unknown>>>(
    () => ({
      submission: submissionResults,
      file: fileResults,
      result: resultResults,
      signature: signatureResults,
      alert: alertResults,
      retrohunt: retrohuntResults
    }),
    [alertResults, fileResults, resultResults, retrohuntResults, signatureResults, submissionResults]
  );

  const permissionMap = useMemo<Record<keyof SearchIndexes, Role>>(
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

  const queryValue = useRef<string>('');

  const handleChangeTab = useCallback(
    (event, newTab) => {
      navigate(`${location.pathname}?${query.toString()}#${newTab}`);
    },
    [location.pathname, navigate, query]
  );

  const onClear = useCallback(() => {
    query.delete('query');
    navigate(`${location.pathname}?${query.toString()}${location.hash}`);
  }, [location.hash, location.pathname, navigate, query]);

  const onSearch = useCallback(() => {
    if (queryValue.current !== '') {
      query.set('query', queryValue.current);
      navigate(`${location.pathname}?${query.toString()}${location.hash}`);
    } else {
      onClear();
    }
  }, [location.hash, location.pathname, navigate, onClear, query]);

  const onFilterValueChange = useCallback((inputValue: string) => {
    queryValue.current = inputValue;
  }, []);

  const resetResults = useCallback(() => {
    setAlertResults(null);
    setFileResults(null);
    setResultResults(null);
    setRetrohuntResults(null);
    setSignatureResults(null);
    setSubmissionResults(null);
  }, []);

  useEffect(() => {
    // On index change we need to update the search suggestion
    let indexFields: IndexDefinition = {};
    if (index || id) {
      // Retrieve the fields specific to the index of interest
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
    setSearchSuggestion({ ...indexFields, ...DEFAULT_SUGGESTION });
  }, [index, id, indexes, permissionMap, currentUser.roles]);

  useEffect(() => {
    // On location.search change we need to change the query object and reset the results
    setQuery(new SimpleSearchQuery(location.search, `rows=${pageSize}&offset=0&filters=NOT%20to_be_deleted:true`));
    resetResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, pageSize]);

  useEffect(() => {
    const nextAvailableTab = () => {
      for (const curTab of [...Object.keys(stateMap)]) {
        if (currentUser.roles.includes(permissionMap[curTab])) return curTab;
      }
      return 'submission';
    };
    // On location.hash change, we need to change the tab
    const newTab = location.hash.substring(1, location.hash.length) || index || id || nextAvailableTab();
    setTab(newTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, index, location.hash]);

  useEffect(() => {
    if (query) {
      queryValue.current = query.get('query', '');
      if (query.get('query')) {
        const searchList = [];
        if (!currentIndex) {
          searchList.push(...Object.keys(stateMap));
        } else {
          searchList.push(tab);
          if (!searching) setSearching(true);
        }
        for (const searchIndex of searchList) {
          // Do no perform search if user has no rights
          if (
            !currentUser.roles.includes(permissionMap[searchIndex]) ||
            (searchIndex === 'retrohunt' && !configuration.retrohunt.enabled)
          )
            continue;

          apiCall({
            method: 'POST',
            url: `/api/v4/search/${searchIndex}/`,
            body: { ...query.getParams(), rows: pageSize, offset: 0 },
            onSuccess: api_data => {
              stateMap[searchIndex](api_data.api_response);
            },
            onFailure: api_data => {
              if (index || id || !api_data.api_error_message.includes('Rewrite first')) {
                showErrorMessage(api_data.api_error_message);
              } else {
                stateMap[searchIndex]({ total: 0, offset: 0, items: [], rows: pageSize });
              }
            },
            onFinalize: () => {
              if (currentIndex) {
                setSearching(false);
              }
            }
          });
        }
      }
    }
    // eslint-disable-next-line
  }, [query]);

  const TabSpacer = useCallback(props => <div style={{ flexGrow: 1 }} />, []);

  const SpecialTab = useCallback(({ children, ...otherProps }) => children, []);

  return (currentIndex && !currentUser.roles.includes(permissionMap[index || id])) ||
    (!currentIndex && Object.values(permissionMap).every(val => !currentUser.roles.includes(val))) ||
    (currentIndex === 'retrohunt' && !configuration.retrohunt.enabled) ? (
    <SearchPage />
  ) : (
    <PageFullWidth margin={4}>
      <div style={{ paddingBottom: theme.spacing(2), textAlign: 'left', width: '100%' }}>
        <Typography variant="h4">{t(`title_${index || id || 'all'}`)}</Typography>
      </div>

      <PageContainer isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchBar
            initValue={query ? query.get('query', '') : ''}
            searching={searching}
            placeholder={t(`search_${index || id || 'all'}`)}
            suggestions={searchSuggestion}
            onValueChange={onFilterValueChange}
            onClear={onClear}
            onSearch={onSearch}
            buttons={
              configuration.datastore.archive.enabled &&
              currentUser.roles.includes('archive_view') &&
              ['submission', 'result', 'file', 'all'].includes(index || id || 'all')
                ? [
                    {
                      icon:
                        query && query.get('use_archive') === 'true' ? (
                          <ArchiveIcon fontSize={downSM ? 'small' : 'medium'} />
                        ) : (
                          <ArchiveOutlinedIcon fontSize={downSM ? 'small' : 'medium'} />
                        ),
                      tooltip:
                        query && query.get('use_archive') === 'true'
                          ? t('use_archive.turn_off')
                          : t('use_archive.turn_on'),
                      props: {
                        onClick: () => {
                          query.set(
                            'use_archive',
                            !query.has('use_archive') ? 'true' : query.get('use_archive') === 'false'
                          );
                          navigate(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
                        }
                      }
                    }
                  ]
                : []
            }
          />

          {!currentIndex && query && query.get('query') && (
            <Paper square style={{ marginBottom: theme.spacing(0.5) }}>
              <Tabs
                value={tab}
                onChange={handleChangeTab}
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
                {currentUser.roles.includes(permissionMap.submission) ? (
                  <Tab
                    label={`${t('submission')} (${
                      submissionResults ? searchResultsDisplay(submissionResults.total) : '...'
                    })`}
                    value="submission"
                  />
                ) : (
                  <Empty />
                )}
                {currentUser.roles.includes(permissionMap.file) ? (
                  <Tab
                    label={`${t('file')} (${fileResults ? searchResultsDisplay(fileResults.total) : '...'})`}
                    value="file"
                  />
                ) : (
                  <Empty />
                )}
                {currentUser.roles.includes(permissionMap.result) ? (
                  <Tab
                    label={`${t('result')} (${resultResults ? searchResultsDisplay(resultResults.total) : '...'})`}
                    value="result"
                  />
                ) : (
                  <Empty />
                )}
                {currentUser.roles.includes(permissionMap.signature) ? (
                  <Tab
                    label={`${t('signature')} (${
                      signatureResults ? searchResultsDisplay(signatureResults.total) : '...'
                    })`}
                    value="signature"
                  />
                ) : (
                  <Empty />
                )}
                {currentUser.roles.includes(permissionMap.alert) ? (
                  <Tab
                    label={`${t('alert')} (${alertResults ? searchResultsDisplay(alertResults.total) : '...'})`}
                    value="alert"
                  />
                ) : (
                  <Empty />
                )}
                {currentUser.roles.includes(permissionMap.retrohunt) && configuration.retrohunt.enabled ? (
                  <Tab
                    label={`${t('retrohunt')} (${
                      retrohuntResults ? searchResultsDisplay(retrohuntResults.total) : '...'
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
                      component={Link}
                      to={`/search/${tab}${location.search}`}
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
            {resMap[tab] && resMap[tab].total !== 0 && currentIndex && (
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
            {resMap[tab] && (
              <SearchPager
                total={resMap[tab].total}
                setResults={stateMap[tab]}
                page={resMap[tab].offset / resMap[tab].rows + 1}
                pageSize={pageSize}
                index={tab}
                query={query}
                setSearching={setSearching}
              />
            )}
          </div>
        </div>
      </PageContainer>
      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        {tab === 'alert' && query && query.get('query') && (
          <AlertsTable alertResults={alertResults} allowSort={!!currentIndex} />
        )}
        {tab === 'file' && query && query.get('query') && (
          <FilesTable fileResults={fileResults} allowSort={!!currentIndex} />
        )}
        {tab === 'result' && query && query.get('query') && (
          <ResultsTable resultResults={resultResults} allowSort={!!currentIndex} />
        )}
        {tab === 'retrohunt' && query && query.get('query') && (
          <RetrohuntTable retrohuntResults={retrohuntResults} allowSort={!!currentIndex} />
        )}
        {tab === 'signature' && query && query.get('query') && (
          <SignaturesTable signatureResults={signatureResults} allowSort={!!currentIndex} />
        )}
        {tab === 'submission' && query && query.get('query') && (
          <SubmissionsTable submissionResults={submissionResults} allowSort={!!currentIndex} />
        )}
      </div>
    </PageFullWidth>
  );
});

SearchPage.displayName = 'SearchPage';

//*****************************************************************************************
// Search Route
//*****************************************************************************************

export const SearchRoute = createAppRoute({
  component: SearchPage,
  path: '/search'
});
