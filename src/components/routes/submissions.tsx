import { CircularProgress, createStyles, makeStyles, Theme, Tooltip, withStyles } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import PersonIcon from '@material-ui/icons/Person';
import PageFullWidth from 'commons/components/layout/pages/PageFullWidth';
import PageHeader from 'commons/components/layout/pages/PageHeader';
import SearchBar from 'components/elements/search/search-bar';
import SearchQuery from 'components/elements/search/search-query';
import useAppContext from 'components/hooks/useAppContext';
import useMyAPI from 'components/hooks/useMyAPI';
import { ALField } from 'components/hooks/useMyUser';
import Classification from 'components/visual/Classification';
import SearchPager from 'components/visual/SearchPager';
import SubmissionState from 'components/visual/SubmissionState';
import Verdict from 'components/visual/Verdict';
import 'moment/locale/fr';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { Link, useHistory, useLocation } from 'react-router-dom';

const PAGE_SIZE = 25;

const useStyles = makeStyles(theme => ({
  searchresult: {
    fontStyle: 'italic',
    paddingTop: theme.spacing(0.5),
    display: 'flex',
    flexWrap: 'wrap'
  }
}));

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    root: {
      paddingRight: '8px',
      paddingLeft: '8px'
    },
    head: {
      backgroundColor: theme.palette.type === 'dark' ? '#404040' : '#EEE'
    },
    body: {
      wordBreak: 'break-word'
    }
  })
)(TableCell);

const DivTD = ({ children, ...other }) => {
  return (
    <StyledTableCell {...other} component="div">
      {children}
    </StyledTableCell>
  );
};

export default function Submissions() {
  const { t, i18n } = useTranslation(['submissions']);
  const [submissions, setSubmissions] = useState(null);
  const [pageSize] = useState(PAGE_SIZE);
  const [total, setTotal] = useState(null);
  const [searching, setSearching] = useState(false);
  const { user: currentUser, indexes } = useAppContext();
  const history = useHistory();
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
                <Typography variant="subtitle1" color="secondary" style={{ flexGrow: 1 }}>
                  {searching ? (
                    <span>{t('searching')}</span>
                  ) : (
                    <span>
                      {total}&nbsp;{query.getQuery() ? t('filtered') : t('total')}
                    </span>
                  )}
                </Typography>

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
        }
      />

      <div style={{ paddingBottom: '1rem', paddingLeft: '4px', paddingRight: '4px' }}>
        {submissions !== null ? (
          <TableContainer component={Paper}>
            <Table component="div" size="small">
              <TableHead component="div">
                <TableRow component="div" style={{ whiteSpace: 'nowrap' }}>
                  <DivTD>{t('header.starttime')}</DivTD>
                  <DivTD>{t('header.verdict')}</DivTD>
                  <DivTD>{t('header.description')}</DivTD>
                  <DivTD>{t('header.user')}</DivTD>
                  <DivTD>{t('header.numfiles')}</DivTD>
                  <DivTD>{t('header.classification')}</DivTD>
                  <DivTD>{t('header.status')}</DivTD>
                </TableRow>
              </TableHead>
              <TableBody component="div">
                {submissions.map(submission => (
                  <TableRow
                    key={submission.id}
                    component={Link}
                    to={
                      submission.state === 'completed'
                        ? `/submission/${submission.id}`
                        : `/submission/detail/${submission.id}`
                    }
                    hover
                    style={{ textDecoration: 'none' }}
                  >
                    <DivTD>
                      <Tooltip title={submission.times.submitted}>
                        <Moment fromNow locale={i18n.language}>
                          {submission.times.submitted}
                        </Moment>
                      </Tooltip>
                    </DivTD>
                    <DivTD>
                      <Verdict score={submission.max_score} />
                    </DivTD>
                    <DivTD>
                      {submission.params.description.length > 150
                        ? `${submission.params.description.substr(0, 147)}...`
                        : submission.params.description}
                    </DivTD>
                    <DivTD style={{ whiteSpace: 'nowrap' }}>{submission.params.submitter}</DivTD>
                    <DivTD>{submission.file_count}</DivTD>
                    <DivTD>
                      <Classification type="text" size="tiny" c12n={submission.classification} format="short" />
                    </DivTD>
                    <DivTD style={{ textAlign: 'center' }}>
                      <SubmissionState state={submission.state} error_count={submission.error_count} />
                    </DivTD>
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
      </div>
    </PageFullWidth>
  );
}
