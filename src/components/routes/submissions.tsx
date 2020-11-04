import { CircularProgress, makeStyles, Tooltip, useTheme } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import PersonIcon from '@material-ui/icons/Person';
import PageFullWidth from 'commons/components/layout/pages/PageFullWidth';
import PageHeader from 'commons/components/layout/pages/PageHeader';
import SearchBar from 'components/elements/search/search-bar';
import SearchQuery from 'components/elements/search/search-query';
import useAppContext from 'components/hooks/useAppContext';
import useMyAPI from 'components/hooks/useMyAPI';
import { ALField } from 'components/hooks/useMyUser';
import SearchPager from 'components/visual/SearchPager';
import SubmissionsTable, { SubmissionResult } from 'components/visual/SearchResult/submissions';
import 'moment/locale/fr';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';

const PAGE_SIZE = 25;

const useStyles = makeStyles(theme => ({
  searchresult: {
    fontStyle: 'italic',
    paddingTop: theme.spacing(0.5),
    display: 'flex',
    flexWrap: 'wrap'
  }
}));

export default function Submissions() {
  const { t } = useTranslation(['submissions']);
  const [submissions, setSubmissions] = useState<SubmissionResult[]>(null);
  const [pageSize] = useState(PAGE_SIZE);
  const [total, setTotal] = useState(null);
  const [searching, setSearching] = useState(false);
  const { user: currentUser, indexes } = useAppContext();
  const history = useHistory();
  const apiCall = useMyAPI();
  const classes = useStyles();
  const theme = useTheme();
  const location = useLocation();
  const [query, setQuery] = useState<SearchQuery>(null);
  const [fields] = useState<ALField[]>(
    Object.keys(indexes.submission).map(name => {
      return { ...indexes.submission[name], name };
    })
  );
  const filterValue = useRef<string>('');

  // The SearchBar contentassist suggesions.
  const buildSearchSuggestions = () => {
    const _fields = fields.map(f => f.name);
    const words = ['OR', 'AND', 'NOT', 'TO', 'now', 'd', 'M', 'y', 'h', 'm'];
    return [..._fields, ...words];
  };

  const onClear = () => {
    history.push('/submissions');
  };
  const onSearch = () => {
    if (filterValue.current !== '') {
      history.push(`/submissions?query=${filterValue.current}`);
    } else {
      onClear();
    }
  };
  const onFilterValueChange = (inputValue: string) => {
    filterValue.current = inputValue;
  };

  useEffect(() => {
    setSearching(true);
    setQuery(new SearchQuery(location.pathname, location.search, pageSize, false));
    // eslint-disable-next-line
  }, [location.search]);

  useEffect(() => {
    if (query) {
      filterValue.current = query.getQuery() || '';
      apiCall({
        method: 'POST',
        url: '/api/v4/search/submission/',
        body: { query: '*', ...query.getParams(), rows: pageSize, offset: 0 },
        onSuccess: api_data => {
          const { items, total: newTotal } = api_data.api_response;
          setTotal(newTotal);
          setSubmissions(items);
        },
        onFinalize: () => {
          setSearching(false);
        }
      });
    }
    // eslint-disable-next-line
  }, [query]);

  return (
    <PageFullWidth margin={4}>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Typography variant="h4">{t('title')}</Typography>
      </div>
      <PageHeader isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchBar
            initValue={query ? query.getQuery() : ''}
            placeholder={t('filter')}
            searching={searching}
            suggestions={buildSearchSuggestions()}
            onValueChange={onFilterValueChange}
            onClear={onClear}
            onSearch={onSearch}
            buttons={[
              {
                icon: (
                  <Tooltip title={t('my_submission')}>
                    <PersonIcon />
                  </Tooltip>
                ),
                props: {
                  onClick: () => {
                    history.push(`/submissions?query=params.submitter:"${currentUser.username}"`);
                  }
                }
              }
            ]}
          >
            {submissions !== null && (
              <div className={classes.searchresult}>
                {submissions.length !== 0 && (
                  <Typography variant="subtitle1" color="secondary" style={{ flexGrow: 1 }}>
                    {searching ? (
                      <span>{t('searching')}</span>
                    ) : (
                      <span>
                        {total}&nbsp;{query.getQuery() ? t('filtered') : t('total')}
                      </span>
                    )}
                  </Typography>
                )}

                <SearchPager
                  total={total}
                  setTotal={setTotal}
                  pageSize={PAGE_SIZE}
                  index="submission"
                  query={query}
                  setData={setSubmissions}
                  setSearching={setSearching}
                />
              </div>
            )}
          </SearchBar>
        </div>
      </PageHeader>
      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        {submissions !== null ? (
          <SubmissionsTable submissions={submissions} />
        ) : (
          <div style={{ width: '100%', textAlign: 'center' }}>
            <CircularProgress />
          </div>
        )}
      </div>
    </PageFullWidth>
  );
}
