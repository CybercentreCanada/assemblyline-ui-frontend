import { Grid, IconButton, Link, makeStyles, Tooltip, useMediaQuery, useTheme } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import BlockIcon from '@material-ui/icons/Block';
import GetAppOutlinedIcon from '@material-ui/icons/GetAppOutlined';
import RecordVoiceOverOutlinedIcon from '@material-ui/icons/RecordVoiceOverOutlined';
import PageFullWidth from 'commons/components/layout/pages/PageFullWidth';
import PageHeader from 'commons/components/layout/pages/PageHeader';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import SearchBar from 'components/visual/SearchBar/search-bar';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import SearchPager from 'components/visual/SearchPager';
import SignaturesTable from 'components/visual/SearchResult/signatures';
import SearchResultCount from 'components/visual/SearchResultCount';
import 'moment/locale/fr';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import SignatureDetail from './signature_detail';

const PAGE_SIZE = 25;

const useStyles = makeStyles(theme => ({
  searchresult: {
    fontStyle: 'italic',
    paddingTop: theme.spacing(0.5),
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-end'
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
  const { indexes } = useALContext();
  const [signatureResults, setSignatureResults] = useState<SearchResults>(null);
  const location = useLocation();
  const [query, setQuery] = useState<SimpleSearchQuery>(null);
  const history = useHistory();
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const classes = useStyles();
  const { closeGlobalDrawer, setGlobalDrawer, globalDrawer } = useDrawer();
  const upMD = useMediaQuery(theme.breakpoints.up('md'));
  const isXL = useMediaQuery(theme.breakpoints.only('xl'));
  const [suggestions] = useState([
    ...Object.keys(indexes.signature).filter(name => indexes.signature[name].indexed),
    ...DEFAULT_SUGGESTION
  ]);
  const filterValue = useRef<string>('');

  useEffect(() => {
    setQuery(new SimpleSearchQuery(location.search, `query=*&rows=${pageSize}&offset=0`));
  }, [location.pathname, location.search, pageSize]);

  useEffect(() => {
    if (signatureResults !== null && globalDrawer === null && location.hash) {
      history.push(`${location.pathname}${location.search ? location.search : ''}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDrawer]);

  useEffect(() => {
    if (location.hash) {
      setGlobalDrawer(
        <SignatureDetail
          signature_id={location.hash.substr(1)}
          onUpdated={handleSignatureUpdated}
          onDeleted={handleSignatureDeleted}
        />
      );
    } else {
      closeGlobalDrawer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  useEffect(() => {
    if (query) {
      reload(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    function handleReload() {
      reload(signatureResults ? signatureResults.offset : 0);
    }

    window.addEventListener('reloadSignatures', handleReload);

    return () => {
      window.removeEventListener('reloadSignatures', handleReload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, signatureResults]);

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

  const onClear = useCallback(
    () => {
      history.push(location.pathname);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.pathname]
  );

  const onSearch = useCallback(
    () => {
      if (filterValue.current !== '') {
        query.set('query', filterValue.current);
        history.push(`${location.pathname}?${query.toString()}`);
      } else {
        onClear();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, location.pathname, onClear]
  );

  const onFilterValueChange = (inputValue: string) => {
    filterValue.current = inputValue;
  };

  const setSignatureID = useCallback(
    (sig_id: string) => {
      history.push(`${location.pathname}${location.search ? location.search : ''}#${sig_id}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.search]
  );

  const handleSignatureUpdated = () => {
    if (!isXL) closeGlobalDrawer();
    setTimeout(() => window.dispatchEvent(new CustomEvent('reloadSignatures')), 1000);
  };

  const handleSignatureDeleted = () => {
    closeGlobalDrawer();
    setTimeout(() => window.dispatchEvent(new CustomEvent('reloadSignatures')), 1000);
  };

  return (
    <PageFullWidth margin={4}>
      {useMemo(
        () => (
          <>
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
                      icon: <RecordVoiceOverOutlinedIcon fontSize={upMD ? 'medium' : 'small'} />,
                      tooltip: t('noisy'),
                      props: {
                        onClick: () => {
                          query.set('query', 'status:NOISY');
                          history.push(`${location.pathname}?${query.getDeltaString()}`);
                        }
                      }
                    },

                    {
                      icon: <BlockIcon fontSize={upMD ? 'medium' : 'small'} />,
                      tooltip: t('disabled'),
                      props: {
                        onClick: () => {
                          query.set('query', 'status:DISABLED');
                          history.push(`${location.pathname}?${query.getDeltaString()}`);
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
                              <SearchResultCount count={signatureResults.total} />
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
          </>
        ),
        [
          classes.searchresult,
          history,
          location.pathname,
          onClear,
          onSearch,
          pageSize,
          query,
          searching,
          signatureResults,
          suggestions,
          t,
          theme,
          upMD
        ]
      )}

      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        <SignaturesTable signatureResults={signatureResults} setSignatureID={setSignatureID} />
      </div>
    </PageFullWidth>
  );
}
