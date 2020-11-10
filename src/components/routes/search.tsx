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
import PageCenter from 'commons/components/layout/pages/PageCenter';
import PageHeader from 'commons/components/layout/pages/PageHeader';
import SearchBar from 'components/elements/search/search-bar';
import SearchQuery from 'components/elements/search/search-query';
import useAppContext from 'components/hooks/useAppContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import SearchPager from 'components/visual/SearchPager';
import AlertsTable from 'components/visual/SearchResult/alerts';
import FilesTable from 'components/visual/SearchResult/files';
import ResultsTable from 'components/visual/SearchResult/results';
import SignaturesTable from 'components/visual/SearchResult/signatures';
import SubmissionsTable from 'components/visual/SearchResult/submissions';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useHistory, useLocation, useParams } from 'react-router-dom';

const PAGE_SIZE = 25;
const DEFAULT_SUGGESTION = ['OR', 'AND', 'NOT', 'TO', 'now', 'd', 'M', 'y', 'h', 'm'];

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
  const { indexes } = useAppContext();
  const location = useLocation();
  const history = useHistory();
  const theme = useTheme();
  const classes = useStyles();
  const apiCall = useMyAPI();
  const [query, setQuery] = useState<SearchQuery>(null);
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

  const queryValue = useRef<string>('');

  const handleChangeTab = (event, newTab) => {
    history.push(`${location.pathname}?query=${query.getQuery()}#${newTab}`);
  };

  const onClear = () => {
    history.push(location.pathname);
  };

  const onSearch = () => {
    if (queryValue.current !== '') {
      history.push(`${location.pathname}?query=${queryValue.current}${location.hash}`);
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
    const newSuggestion = [
      ...Object.keys(indexes[index || id] || {}).map(name => {
        return name;
      }),
      ...DEFAULT_SUGGESTION
    ];
    setSearchSuggestion(newSuggestion);
  }, [index, id, indexes]);

  useEffect(() => {
    // On location.search change we need to change the query object and reset the results
    setQuery(new SearchQuery(location.pathname, location.search, pageSize, false));
    resetResults();
  }, [location.pathname, location.search, pageSize]);

  useEffect(() => {
    // On location.hash change, we need to change the tab
    const newTab = location.hash.substring(1, location.hash.length) || index || id || 'submission';
    setTab(newTab);
  }, [id, index, location.hash]);

  useEffect(() => {
    if (query) {
      queryValue.current = query.getQuery() || '';
      if (query.getQuery()) {
        const searchList = [];
        if (!(index || id)) {
          searchList.push(...Object.keys(stateMap));
        } else {
          searchList.push(tab);
          if (!searching) setSearching(true);
        }
        for (const searchIndex of searchList) {
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
                stateMap[searchIndex]({ total: 0, offset: 0, items: [], rows: PAGE_SIZE });
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

  const TabSpacer = props => {
    return <div style={{ flexGrow: 1 }} />;
  };

  const SpecialTab = ({ children, ...otherProps }) => {
    return children;
  };

  return (
    <PageCenter margin={4} width="100%">
      <div style={{ paddingBottom: theme.spacing(2), textAlign: 'left', width: '100%' }}>
        <Typography variant="h4">{t(`title_${index || id || 'all'}`)}</Typography>
      </div>
      <PageHeader isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchBar
            initValue={query ? query.getQuery() : ''}
            searching={searching}
            placeholder={t(`search_${index || id || 'all'}`)}
            suggestions={searchSuggestion}
            onValueChange={onFilterValueChange}
            onClear={onClear}
            onSearch={onSearch}
          />

          {!(index || id) && query && query.getQuery() !== '' && (
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
                <Tab
                  label={`${t('submission')} (${submissionResults ? submissionResults.total : '...'})`}
                  value="submission"
                />
                <Tab label={`${t('file')} (${fileResults ? fileResults.total : '...'})`} value="file" />
                <Tab label={`${t('result')} (${resultResults ? resultResults.total : '...'})`} value="result" />
                <Tab
                  label={`${t('signature')} (${signatureResults ? signatureResults.total : '...'})`}
                  value="signature"
                />
                <Tab label={`${t('alert')} (${alertResults ? alertResults.total : '...'})`} value="alert" />
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
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing(0.5) }}>
            {resMap[tab] && resMap[tab].total !== 0 && (index || id) && (
              <div className={classes.searchresult}>{`${resMap[tab].total} ${t('matching_results')}`}</div>
            )}
            <div style={{ flexGrow: 1 }} />
            {resMap[tab] && (
              <SearchPager
                total={resMap[tab].total}
                setResults={stateMap[tab]}
                page={resMap[tab].offset / resMap[tab].rows + 1}
                pageSize={PAGE_SIZE}
                index={tab}
                query={query}
                setSearching={setSearching}
              />
            )}
          </div>
        </div>
      </PageHeader>
      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        {tab === 'submission' && query && query.getQuery() !== '' && (
          <SubmissionsTable submissionResults={submissionResults} />
        )}
        {tab === 'file' && query && query.getQuery() !== '' && <FilesTable fileResults={fileResults} />}
        {tab === 'result' && query && query.getQuery() !== '' && <ResultsTable resultResults={resultResults} />}
        {tab === 'signature' && query && query.getQuery() !== '' && (
          <SignaturesTable signatureResults={signatureResults} />
        )}
        {tab === 'alert' && query && query.getQuery() !== '' && <AlertsTable alertResults={alertResults} />}
      </div>
    </PageCenter>
  );
}

Search.defaultProps = {
  index: null
};

export default Search;
