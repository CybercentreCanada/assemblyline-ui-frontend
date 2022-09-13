import {
  createStyles,
  IconButton,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  Theme,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@material-ui/core';
import CenterFocusStrongOutlinedIcon from '@material-ui/icons/CenterFocusStrongOutlined';
import FolderIcon from '@material-ui/icons/Folder';
import FolderOutlinedIcon from '@material-ui/icons/FolderOutlined';
import PageFullWidth from 'commons/components/layout/pages/PageFullWidth';
import PageHeader from 'commons/components/layout/pages/PageHeader';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import Empty from 'components/visual/Empty';
import SearchBar from 'components/visual/SearchBar/search-bar';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import SearchPager from 'components/visual/SearchPager';
import AlertsTable from 'components/visual/SearchResult/alerts';
import FilesTable from 'components/visual/SearchResult/files';
import ResultsTable from 'components/visual/SearchResult/results';
import SignaturesTable from 'components/visual/SearchResult/signatures';
import SubmissionsTable from 'components/visual/SearchResult/submissions';
import SearchResultCount from 'components/visual/SearchResultCount';
import { searchResultsDisplay } from 'helpers/utils';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useHistory, useLocation, useParams } from 'react-router-dom';
import ForbiddenPage from './403';

const PAGE_SIZE = 25;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tweaked_tabs: {
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
    },
    searchresult: {
      paddingLeft: theme.spacing(1),
      color: theme.palette.primary.main,
      fontStyle: 'italic'
    }
  })
);

type SearchProps = {
  index?: string | null;
};

type ParamProps = {
  id: string;
};

type SearchResults = {
  items: any[];
  offset: number;
  rows: number;
  total: number;
};

function Search({ index }: SearchProps) {
  const { id } = useParams<ParamProps>();
  const { t } = useTranslation(['search']);
  const [pageSize] = useState(PAGE_SIZE);
  const [searching, setSearching] = useState(false);
  const { indexes, user: currentUser } = useALContext();
  const location = useLocation();
  const history = useHistory();
  const theme = useTheme();
  const classes = useStyles();
  const { apiCall } = useMyAPI();
  const [query, setQuery] = useState<SimpleSearchQuery>(null);
  const [searchSuggestion, setSearchSuggestion] = useState<string[]>(null);
  const [tab, setTab] = useState(null);
  const { showErrorMessage } = useMySnackbar();
  const downSM = useMediaQuery(theme.breakpoints.down('sm'));

  // Result lists
  const [submissionResults, setSubmissionResults] = useState<SearchResults>(null);
  const [fileResults, setFileResults] = useState<SearchResults>(null);
  const [resultResults, setResultResults] = useState<SearchResults>(null);
  const [signatureResults, setSignatureResults] = useState<SearchResults>(null);
  const [alertResults, setAlertResults] = useState<SearchResults>(null);

  const stateMap = {
    submission: setSubmissionResults,
    file: setFileResults,
    result: setResultResults,
    signature: setSignatureResults,
    alert: setAlertResults
  };

  const resMap = {
    submission: submissionResults,
    file: fileResults,
    result: resultResults,
    signature: signatureResults,
    alert: alertResults
  };

  const permissionMap = {
    submission: 'submission_view',
    file: 'submission_view',
    result: 'submission_view',
    signature: 'signature_view',
    alert: 'alert_view'
  };

  const queryValue = useRef<string>('');

  const handleChangeTab = (event, newTab) => {
    history.push(`${location.pathname}?${query.toString()}#${newTab}`);
  };

  const onClear = () => {
    query.delete('query');
    history.push(`${location.pathname}?${query.toString()}${location.hash}`);
  };

  const onSearch = () => {
    if (queryValue.current !== '') {
      query.set('query', queryValue.current);
      history.push(`${location.pathname}?${query.toString()}${location.hash}`);
    } else {
      onClear();
    }
  };

  const onFilterValueChange = (inputValue: string) => {
    queryValue.current = inputValue;
  };

  const resetResults = () => {
    setSubmissionResults(null);
    setFileResults(null);
    setResultResults(null);
    setSignatureResults(null);
    setAlertResults(null);
  };

  useEffect(() => {
    // On index change we need to update the search suggestion
    setSearchSuggestion([
      ...Object.keys(indexes[index || id] || {}).filter(name => indexes[index || id][name].indexed),
      ...DEFAULT_SUGGESTION
    ]);
  }, [index, id, indexes]);

  useEffect(() => {
    // On location.search change we need to change the query object and reset the results
    setQuery(new SimpleSearchQuery(location.search, `rows=${pageSize}&offset=0`));
    resetResults();
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
        if (!(index || id)) {
          searchList.push(...Object.keys(stateMap));
        } else {
          searchList.push(tab);
          if (!searching) setSearching(true);
        }
        for (const searchIndex of searchList) {
          // Do no perform search if user has no rights
          if (!currentUser.roles.includes(permissionMap[searchIndex])) continue;

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
              if (index || id) {
                setSearching(false);
              }
            }
          });
        }
      }
    }
    // eslint-disable-next-line
  }, [query]);

  const TabSpacer = props => <div style={{ flexGrow: 1 }} />;

  const SpecialTab = ({ children, ...otherProps }) => children;

  return ((index || id) && !currentUser.roles.includes(permissionMap[index || id])) ||
    (!(index || id) && Object.values(permissionMap).every(val => !currentUser.roles.includes(val))) ? (
    <ForbiddenPage />
  ) : (
    <PageFullWidth margin={4}>
      <div style={{ paddingBottom: theme.spacing(2), textAlign: 'left', width: '100%' }}>
        <Typography variant="h4">{t(`title_${index || id || 'all'}`)}</Typography>
      </div>
      <PageHeader isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchBar
            initValue={query ? query.get('query', '') : ''}
            searching={searching}
            placeholder={t(`search_${index || id || 'all'}`)}
            suggestions={searchSuggestion}
            onValueChange={onFilterValueChange}
            onClear={onClear}
            onSearch={onSearch}
            buttons={[
              {
                icon:
                  query && query.get('use_archive') === 'true' ? (
                    <FolderIcon fontSize={downSM ? 'small' : 'medium'} />
                  ) : (
                    <FolderOutlinedIcon fontSize={downSM ? 'small' : 'medium'} />
                  ),
                tooltip:
                  query && query.get('use_archive') === 'true' ? t('use_archive.turn_off') : t('use_archive.turn_on'),
                props: {
                  onClick: () => {
                    query.set('use_archive', !query.has('use_archive') ? 'true' : query.get('use_archive') === 'false');
                    history.push(`${location.pathname}?${query.getDeltaString()}${location.hash}`);
                  }
                }
              }
            ]}
          />

          {!(index || id) && query && query.get('query') && (
            <Paper square style={{ marginBottom: theme.spacing(0.5) }}>
              <Tabs
                className={classes.tweaked_tabs}
                value={tab}
                onChange={handleChangeTab}
                indicatorColor="primary"
                textColor="primary"
                scrollButtons="auto"
                variant="scrollable"
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
            {resMap[tab] && resMap[tab].total !== 0 && (index || id) && (
              <div className={classes.searchresult}>
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
      </PageHeader>
      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        {tab === 'submission' && query && query.get('query') && (
          <SubmissionsTable submissionResults={submissionResults} allowSort={!!(index || id)} />
        )}
        {tab === 'file' && query && query.get('query') && (
          <FilesTable fileResults={fileResults} allowSort={!!(index || id)} />
        )}
        {tab === 'result' && query && query.get('query') && (
          <ResultsTable resultResults={resultResults} allowSort={!!(index || id)} />
        )}
        {tab === 'signature' && query && query.get('query') && (
          <SignaturesTable signatureResults={signatureResults} allowSort={!!(index || id)} />
        )}
        {tab === 'alert' && query && query.get('query') && (
          <AlertsTable alertResults={alertResults} allowSort={!!(index || id)} />
        )}
      </div>
    </PageFullWidth>
  );
}

Search.defaultProps = {
  index: null
};

export default Search;
