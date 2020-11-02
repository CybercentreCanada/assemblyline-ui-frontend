import { CircularProgress, makeStyles, Tooltip, useTheme } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import PageFullWidth from 'commons/components/layout/pages/PageFullWidth';
import PageHeader from 'commons/components/layout/pages/PageHeader';
import Book from 'components/elements/lists/booklist/book';
import Booklist from 'components/elements/lists/booklist/booklist';
import { LineItem } from 'components/elements/lists/list-item';
import SearchBar from 'components/elements/search/search-bar';
import SearchQuery from 'components/elements/search/search-query';
import useAppContext from 'components/hooks/useAppContext';
import useMyAPI from 'components/hooks/useMyAPI';
import { ALField } from 'components/hooks/useMyUser';
import Classification from 'components/visual/Classification';
import SubmissionState from 'components/visual/SubmissionState';
import Verdict from 'components/visual/Verdict';
import 'moment/locale/fr';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { useHistory, useLocation } from 'react-router-dom';

const PAGE_SIZE = 25;

const useStyles = makeStyles(theme => ({
  searchresult: {
    fontStyle: 'italic'
  }
}));

export default function Submissions() {
  const { t, i18n } = useTranslation(['submissions']);
  const [submissions, setSubmissions] = useState(null);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [searching, setSearching] = useState(false);
  const { indexes } = useAppContext();
  const history = useHistory();
  const theme = useTheme();
  const [book, setBook] = useState(new Book([], pageSize));
  const apiCall = useMyAPI();
  const classes = useStyles();
  const location = useLocation();
  const [query, setQuery] = useState<SearchQuery>(null);
  const [fields] = useState<ALField[]>(
    Object.keys(indexes.submission).map(name => {
      return { ...indexes.submission[name], name };
    })
  );
  const filterValue = useRef<string>('');

  function handleClick(submission) {
    if (submission.state === 'completed') {
      history.push(`/submission/${submission.id}`);
    } else {
      history.push(`/submission/detail/${submission.id}`);
    }
  }

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
    history.push(`/submissions?q=${filterValue.current}`);
  };
  const onFilterValueChange = (inputValue: string) => {
    filterValue.current = inputValue;
  };

  const onItemSelected = () => {};
  const updateBook = () => {};
  const onRenderListRow = (item: LineItem) => {
    return <div>{item.id}</div>;
  };
  const _onLoadMore = () => {};

  useEffect(() => {
    setQuery(new SearchQuery(location.pathname, location.search, pageSize));
    // eslint-disable-next-line
  }, [location.search]);

  useEffect(() => {
    if (query) {
      filterValue.current = query.getQuery() || '';
      setSearching(true);
      apiCall({
        method: 'POST',
        url: '/api/v4/search/submission/',
        body: { query: query.getQuery() || '*', rows: query.getRows() },
        onSuccess: api_data => {
          console.log(api_data);
          const { items, total, offset } = api_data.api_response;
          const parsedItems = items.map((item, index) => ({ ...item, id: item.sid, index: index + offset }));
          window.scrollTo(0, 0);
          setBook(book.addAll(parsedItems));
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
    <PageFullWidth>
      <PageHeader
        isSticky
        mode="provided"
        title={
          <SearchBar
            initValue={query ? query.getQuery() : ''}
            placeholder={t('filter')}
            searching={searching}
            suggestions={buildSearchSuggestions()}
            onValueChange={onFilterValueChange}
            onClear={onClear}
            onSearch={onSearch}
          >
            <div className={classes.searchresult}>
              <Typography variant="subtitle1" color="secondary">
                {submissions !== null && `${submissions.length} ${t('subtitle')}`}
              </Typography>
            </div>
          </SearchBar>
        }
      />

      <Booklist
        loading={searching}
        book={book}
        onItemSelected={onItemSelected}
        onPageChange={updateBook}
        onRenderRow={onRenderListRow}
        onLoadNext={_onLoadMore}
      />

      {submissions !== null ? (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow style={{ whiteSpace: 'nowrap' }}>
                <TableCell>{t('header.starttime')}</TableCell>
                <TableCell>{t('header.verdict')}</TableCell>
                <TableCell>{t('header.description')}</TableCell>
                <TableCell>{t('header.user')}</TableCell>
                <TableCell>{t('header.numfiles')}</TableCell>
                <TableCell>{t('header.classification')}</TableCell>
                <TableCell>{t('header.status')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.map(submission => (
                <TableRow key={submission.id} onClick={() => handleClick(submission)} hover>
                  <TableCell style={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title={submission.times.submitted}>
                      <Moment fromNow locale={i18n.language}>
                        {submission.times.submitted}
                      </Moment>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Verdict score={submission.max_score} />
                  </TableCell>
                  <TableCell style={{ wordBreak: 'break-word' }}>{submission.params.description}</TableCell>
                  <TableCell style={{ whiteSpace: 'nowrap' }}>{submission.params.submitter}</TableCell>
                  <TableCell>{submission.file_count}</TableCell>
                  <TableCell>
                    <Classification type="text" size="tiny" c12n={submission.classification} format="short" />
                  </TableCell>
                  <TableCell style={{ textAlign: 'center' }}>
                    <SubmissionState state={submission.state} error_count={submission.error_count} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <div style={{ width: '100%', textAlign: 'center' }}>
          <CircularProgress />
        </div>
      )}
    </PageFullWidth>
  );
}
