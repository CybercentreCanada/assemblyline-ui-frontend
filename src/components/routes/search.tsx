import { createStyles, makeStyles, Paper, Tab, Tabs, Theme, Typography, useTheme } from '@material-ui/core';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import PageHeader from 'commons/components/layout/pages/PageHeader';
import SearchBar from 'components/elements/search/search-bar';
import SearchQuery from 'components/elements/search/search-query';
import useAppContext from 'components/hooks/useAppContext';
import useMyAPI from 'components/hooks/useMyAPI';
import { ALField } from 'components/hooks/useMyUser';
import SearchPager from 'components/visual/SearchPager';
import AlertsTable from 'components/visual/SearchResult/alerts';
import SubmissionsTable from 'components/visual/SearchResult/submissions';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation, useParams } from 'react-router-dom';

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
  total: number;
};

function Search({ index }: SearchProps) {
  const { id } = useParams<ParamProps>();
  const { t } = useTranslation(['search']);
  const [pageSize] = useState(PAGE_SIZE);
  const [searching, setSearching] = useState(false);
  const { user: currentUser, indexes } = useAppContext();
  const location = useLocation();
  const history = useHistory();
  const theme = useTheme();
  const classes = useStyles();
  const apiCall = useMyAPI();
  const [query, setQuery] = useState<SearchQuery>(null);
  const [fields, setFields] = useState<ALField[]>(null);
  const [searchSuggestion, setSearchSuggestion] = useState<string[]>(null);
  const usedIndex = index || id || 'all';
  const [tab, setTab] = useState(usedIndex !== 'all' ? usedIndex : 'submission');

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

  const queryValue = useRef<string>('');

  const handleChangeTab = (event, newTab) => {
    setTab(newTab);
  };

  const onClear = () => {
    history.push(location.pathname);
  };

  const onSearch = () => {
    if (queryValue.current !== '') {
      history.push(`${location.pathname}?query=${queryValue.current}`);
    } else {
      onClear();
    }
  };

  const onFilterValueChange = (inputValue: string) => {
    queryValue.current = inputValue;
  };

  const resetResults = () => {
    setSubmissionResults(null);
  };

  useEffect(() => {
    setFields(
      Object.keys(indexes[index || id] || {}).map(name => {
        return { ...indexes[index || id][name], name };
      })
    );
  }, [index, id, indexes]);

  useEffect(() => {
    if (fields && fields.length !== 0) {
      const _fields = fields.map(f => f.name);
      setSearchSuggestion([..._fields, ...DEFAULT_SUGGESTION]);
    } else {
      setSearchSuggestion(DEFAULT_SUGGESTION);
    }
  }, [fields]);

  useEffect(() => {
    setQuery(new SearchQuery(location.pathname, location.search, pageSize, false));
    resetResults();
    // eslint-disable-next-line
  }, [location.search]);

  useEffect(() => {
    if (query) {
      queryValue.current = query.getQuery() || '';
      if (query.getQuery()) {
        const searchList = [];
        if (usedIndex === 'all') {
          searchList.push(...Object.keys(stateMap));
        } else {
          searchList.push(usedIndex);
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
            onFinalize: () => {
              if (usedIndex !== 'all') {
                setSearching(false);
              }
            }
          });
        }
      }
    }
    // eslint-disable-next-line
  }, [query]);

  return (
    <PageCenter margin={4} width="100%">
      <div style={{ paddingBottom: theme.spacing(2), textAlign: 'left', width: '100%' }}>
        <Typography variant="h4">{t(`title_${usedIndex}`)}</Typography>
      </div>
      <PageHeader isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchBar
            initValue={query ? query.getQuery() : ''}
            searching={searching}
            placeholder={t(`search_${usedIndex}`)}
            suggestions={searchSuggestion}
            onValueChange={onFilterValueChange}
            onClear={onClear}
            onSearch={onSearch}
          />

          {usedIndex === 'all' && query && query.getQuery() !== '' && (
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
              </Tabs>
            </Paper>
          )}
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing(0.5) }}>
            <div style={{ flexGrow: 1 }} />
            {tab === 'submission' && submissionResults && (
              <SearchPager
                total={submissionResults.total}
                setResults={setSubmissionResults}
                pageSize={PAGE_SIZE}
                index="submission"
                query={query}
                setSearching={setSearching}
              />
            )}
            {tab === 'alert' && alertResults && (
              <SearchPager
                total={alertResults.total}
                setResults={setAlertResults}
                pageSize={PAGE_SIZE}
                index="alert"
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
        {tab === 'file' && query && query.getQuery() !== '' && (
          <SubmissionsTable submissionResults={submissionResults} />
        )}
        {tab === 'result' && query && query.getQuery() !== '' && (
          <SubmissionsTable submissionResults={submissionResults} />
        )}
        {tab === 'signature' && query && query.getQuery() !== '' && (
          <SubmissionsTable submissionResults={submissionResults} />
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
