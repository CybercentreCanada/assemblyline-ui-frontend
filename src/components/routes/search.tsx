import { Paper, Tab, Tabs, Typography, useTheme } from '@material-ui/core';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import PageHeader from 'commons/components/layout/pages/PageHeader';
import SearchBar from 'components/elements/search/search-bar';
import SearchQuery from 'components/elements/search/search-query';
import useAppContext from 'components/hooks/useAppContext';
import useMyAPI from 'components/hooks/useMyAPI';
import { ALField } from 'components/hooks/useMyUser';
import SearchPager from 'components/visual/SearchPager';
import SubmissionsTable, { SubmissionResult } from 'components/visual/SearchResult/submissions';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation, useParams } from 'react-router-dom';

const PAGE_SIZE = 25;
const DEFAULT_SUGGESTION = ['OR', 'AND', 'NOT', 'TO', 'now', 'd', 'M', 'y', 'h', 'm'];

type SearchProps = {
  index?: string | null;
};

type ParamProps = {
  id: string;
};

type SearchResults = {
  items: SubmissionResult[];
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
  const apiCall = useMyAPI();
  const [query, setQuery] = useState<SearchQuery>(null);
  const [fields, setFields] = useState<ALField[]>(null);
  const [searchSuggestion, setSearchSuggestion] = useState<string[]>(null);
  const usedIndex = index || id || 'all';
  const [tab, setTab] = useState(usedIndex !== 'all' ? usedIndex : 'submission');

  // Result lists
  const [submissionResults, setSubmissionResults] = useState<SearchResults>(null);

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
        if (usedIndex === 'submission' || usedIndex === 'all') {
          if (!searching && usedIndex !== 'all') setSearching(true);
          apiCall({
            method: 'POST',
            url: '/api/v4/search/submission/',
            body: { ...query.getParams(), rows: pageSize, offset: 0 },
            onSuccess: api_data => {
              setSubmissionResults(api_data.api_response);
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
            buttons={
              [
                // {
                //   icon: (
                //     <Tooltip title={t('my_submission')}>
                //       <PersonIcon fontSize={upMD ? 'default' : 'small'} />
                //     </Tooltip>
                //   ),
                //   props: {
                //     onClick: () => {
                //       history.push(`/submissions?query=params.submitter:"${currentUser.username}"`);
                //     }
                //   }
                // }
              ]
            }
          />

          {usedIndex === 'all' && query && query.getQuery() !== '' && (
            <Paper square style={{ marginBottom: theme.spacing(0.5) }}>
              <Tabs
                value={tab}
                onChange={handleChangeTab}
                indicatorColor="primary"
                textColor="primary"
                scrollButtons="auto"
                variant="scrollable"
              >
                <Tab label={t('submission')} value="submission" />
                <Tab label={t('file')} value="file" />
                <Tab label={t('result')} value="result" />
                <Tab label={t('signature')} value="signature" />
                <Tab label={t('alert')} value="alert" />
              </Tabs>
            </Paper>
          )}
          {tab === 'submission' && submissionResults && (
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing(0.5) }}>
              <div style={{ flexGrow: 1 }} />
              <div>
                <SearchPager
                  total={submissionResults.total}
                  setResults={setSubmissionResults}
                  pageSize={PAGE_SIZE}
                  index="submission"
                  query={query}
                  setSearching={setSearching}
                />
              </div>
            </div>
          )}
        </div>
      </PageHeader>
      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        {tab === 'submission' && query && query.getQuery() !== '' && (
          <SubmissionsTable submissionResults={submissionResults} />
        )}
      </div>
    </PageCenter>
  );
}

Search.defaultProps = {
  index: null
};

export default Search;
