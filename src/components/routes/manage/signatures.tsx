import { Grid, IconButton, Link, makeStyles, Tooltip, useMediaQuery, useTheme } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import BlockIcon from '@material-ui/icons/Block';
import GetAppOutlinedIcon from '@material-ui/icons/GetAppOutlined';
import RecordVoiceOverOutlinedIcon from '@material-ui/icons/RecordVoiceOverOutlined';
import PageFullWidth from 'commons/components/layout/pages/PageFullWidth';
import PageHeader from 'commons/components/layout/pages/PageHeader';
import SearchBar from 'components/elements/search/search-bar';
import SimpleSearchQuery from 'components/elements/search/simple-search-query';
import useAppContext from 'components/hooks/useAppContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import SearchPager from 'components/visual/SearchPager';
import SignaturesTable from 'components/visual/SearchResult/signatures';
import 'moment/locale/fr';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import SignatureDetail from './signature_detail';

const PAGE_SIZE = 25;
const DEFAULT_SUGGESTION = ['OR', 'AND', 'NOT', 'TO', 'now', 'd', 'M', 'y', 'h', 'm'];

const useStyles = makeStyles(theme => ({
  searchresult: {
    fontStyle: 'italic',
    paddingTop: theme.spacing(0.5),
    display: 'flex',
    flexWrap: 'wrap'
  },
  drawerPaper: {
    width: '80%',
    maxWidth: '800px',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  }
}));

type SearchResults = {
  items: any[];
  offset: number;
  rows: number;
  total: number;
};

export default function Signatures() {
  const { t } = useTranslation(['manageSignatures']);
  const [pageSize] = useState(PAGE_SIZE);
  const [searching, setSearching] = useState(false);
  const { indexes } = useAppContext();
  const [signatureResults, setSignatureResults] = useState<SearchResults>(null);
  const location = useLocation();
  const [query, setQuery] = useState<SimpleSearchQuery>(null);
  const history = useHistory();
  const theme = useTheme();
  const apiCall = useMyAPI();
  const classes = useStyles();
  const { closeGlobalDrawer, setGlobalDrawer } = useDrawer();
  const upMD = useMediaQuery(theme.breakpoints.up('md'));
  const isXL = useMediaQuery(theme.breakpoints.only('xl'));
  const [suggestions] = useState([
    ...Object.keys(indexes.signature).filter(name => {
      return indexes.signature[name].indexed;
    }),
    ...DEFAULT_SUGGESTION
  ]);
  const filterValue = useRef<string>('');

  useEffect(() => {
    setQuery(new SimpleSearchQuery(location.search, `query=*&rows=${pageSize}&offset=0`));
  }, [location.pathname, location.search, pageSize]);

  useEffect(() => {
    if (query) {
      reload(0);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const reload = offset => {
    query.set('rows', PAGE_SIZE);
    query.set('offset', offset);
    apiCall({
      method: 'POST',
      url: '/api/v4/search/signature/',
      body: query.getParams(),
      onSuccess: api_data => {
        if (
          api_data.api_response.items.length === 0 &&
          api_data.api_response.offset !== 0 &&
          api_data.api_response.offset >= api_data.api_response.total
        ) {
          reload(Math.max(0, api_data.api_response.offset - api_data.api_response.rows));
        } else {
          setSignatureResults(api_data.api_response);
        }
      },
      onEnter: () => setSearching(true),
      onExit: () => setSearching(false)
    });
  };

  const onClear = () => {
    history.push(location.pathname);
  };

  const onSearch = () => {
    if (filterValue.current !== '') {
      query.set('query', filterValue.current);
      history.push(`${location.pathname}?${query.toString()}`);
    } else {
      onClear();
    }
  };

  const onFilterValueChange = (inputValue: string) => {
    filterValue.current = inputValue;
  };

  const setSignatureID = (sig_id: string) => {
    setGlobalDrawer(
      <SignatureDetail signature_id={sig_id} onUpdated={handleSignatureUpdated} onDeleted={handleSignatureDeleted} />
    );
  };

  const handleSignatureUpdated = () => {
    if (!isXL) closeGlobalDrawer();
    setTimeout(() => reload(signatureResults ? signatureResults.offset : 0), 1000);
  };

  const handleSignatureDeleted = () => {
    closeGlobalDrawer();
    setTimeout(() => reload(signatureResults ? signatureResults.offset : 0), 1000);
  };

  return (
    <PageFullWidth margin={4}>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Grid container alignItems="center">
          <Grid item xs>
            <Typography variant="h4">{t('title')}</Typography>
          </Grid>
          <Grid item xs style={{ textAlign: 'right' }}>
            <Tooltip title={t('download_desc')}>
              <IconButton
                component={Link}
                style={{ color: theme.palette.action.active }}
                href={`/api/v4/signature/download/?query=${query ? query.get('query', '*') : '*'}`}
              >
                <GetAppOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </div>

      <PageHeader isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchBar
            initValue={query ? query.get('query', '') : ''}
            placeholder={t('filter')}
            searching={searching}
            suggestions={suggestions}
            onValueChange={onFilterValueChange}
            onClear={onClear}
            onSearch={onSearch}
            buttons={[
              {
                icon: (
                  <Tooltip title={t('noisy')}>
                    <RecordVoiceOverOutlinedIcon fontSize={upMD ? 'default' : 'small'} />
                  </Tooltip>
                ),
                props: {
                  onClick: () => {
                    query.set('query', 'status:NOISY');
                    history.push(`${location.pathname}?${query.toString()}`);
                  }
                }
              },

              {
                icon: (
                  <Tooltip title={t('disabled')}>
                    <BlockIcon fontSize={upMD ? 'default' : 'small'} />
                  </Tooltip>
                ),
                props: {
                  onClick: () => {
                    query.set('query', 'status:DISABLED');
                    history.push(`${location.pathname}?${query.toString()}`);
                  }
                }
              }
            ]}
          >
            {signatureResults !== null && (
              <div className={classes.searchresult}>
                {signatureResults.total !== 0 && (
                  <Typography variant="subtitle1" color="secondary" style={{ flexGrow: 1 }}>
                    {searching ? (
                      <span>{t('searching')}</span>
                    ) : (
                      <span>
                        {signatureResults.total}&nbsp;
                        {query.get('query')
                          ? t(`filtered${signatureResults.total === 1 ? '' : 's'}`)
                          : t(`total${signatureResults.total === 1 ? '' : 's'}`)}
                      </span>
                    )}
                  </Typography>
                )}

                <SearchPager
                  total={signatureResults.total}
                  setResults={setSignatureResults}
                  pageSize={pageSize}
                  index="signature"
                  query={query}
                  setSearching={setSearching}
                />
              </div>
            )}
          </SearchBar>
        </div>
      </PageHeader>

      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        <SignaturesTable signatureResults={signatureResults} setSignatureID={setSignatureID} />
      </div>
    </PageFullWidth>
  );
}
