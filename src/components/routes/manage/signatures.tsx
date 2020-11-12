import { makeStyles, Tooltip, useMediaQuery, useTheme } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import BlockIcon from '@material-ui/icons/Block';
import RecordVoiceOverOutlinedIcon from '@material-ui/icons/RecordVoiceOverOutlined';
import PageFullWidth from 'commons/components/layout/pages/PageFullWidth';
import PageHeader from 'commons/components/layout/pages/PageHeader';
import SearchBar from 'components/elements/search/search-bar';
import SimpleSearchQuery from 'components/elements/search/simple-search-query';
import useAppContext from 'components/hooks/useAppContext';
import useMyAPI from 'components/hooks/useMyAPI';
import SearchPager from 'components/visual/SearchPager';
import SignaturesTable from 'components/visual/SearchResult/signatures';
import 'moment/locale/fr';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';

const PAGE_SIZE = 25;
const DEFAULT_SUGGESTION = ['OR', 'AND', 'NOT', 'TO', 'now', 'd', 'M', 'y', 'h', 'm'];

const useStyles = makeStyles(theme => ({
  searchresult: {
    fontStyle: 'italic',
    paddingTop: theme.spacing(0.5),
    display: 'flex',
    flexWrap: 'wrap'
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
  const upMD = useMediaQuery(theme.breakpoints.up('md'));
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
      query.set('rows', PAGE_SIZE);
      query.set('offset', 0);
      setSearching(true);
      apiCall({
        method: 'POST',
        url: '/api/v4/search/signature/',
        body: { query: '*', ...query.getParams() },
        onSuccess: api_data => {
          setSignatureResults(api_data.api_response);
        },
        onFinalize: () => {
          setSearching(false);
        }
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

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

  return (
    <PageFullWidth margin={4}>
      <div style={{ paddingBottom: theme.spacing(8) }}>
        <Typography variant="h4">{t('title')}</Typography>
      </div>

      <PageHeader isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchBar
            initValue={query ? query.get('query') : ''}
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
        <SignaturesTable signatureResults={signatureResults} />
      </div>
    </PageFullWidth>
  );
}
