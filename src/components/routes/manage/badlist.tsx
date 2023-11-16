import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';

import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { alpha, useMediaQuery, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import PageHeader from 'commons/components/pages/PageHeader';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import { CustomUser } from 'components/hooks/useMyUser';
import SearchBar from 'components/visual/SearchBar/search-bar';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import SearchPager from 'components/visual/SearchPager';
import BadlistTable from 'components/visual/SearchResult/badlist';
import SearchResultCount from 'components/visual/SearchResultCount';
import 'moment/locale/fr';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import ForbiddenPage from '../403';
import BadlistDetail from './badlist_detail';

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

export default function Badlist() {
  const { t } = useTranslation(['manageBadlist']);
  const [pageSize] = useState(PAGE_SIZE);
  const [searching, setSearching] = useState(false);
  const { indexes } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();
  const [badlistResults, setBadlistResults] = useState<SearchResults>(null);
  const location = useLocation();
  const [query, setQuery] = useState<SimpleSearchQuery>(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const upMD = useMediaQuery(theme.breakpoints.up('md'));
  const { apiCall } = useMyAPI();
  const classes = useStyles();
  const { closeGlobalDrawer, setGlobalDrawer, globalDrawerOpened } = useDrawer();
  const [suggestions] = useState(
    indexes.badlist
      ? [...Object.keys(indexes.badlist).filter(name => indexes.badlist[name].indexed), ...DEFAULT_SUGGESTION]
      : [...DEFAULT_SUGGESTION]
  );
  const filterValue = useRef<string>('');

  useEffect(() => {
    setQuery(new SimpleSearchQuery(location.search, `query=*&rows=${pageSize}&offset=0`));
  }, [location.pathname, location.search, pageSize]);

  useEffect(() => {
    if (badlistResults !== null && !globalDrawerOpened && location.hash) {
      navigate(`${location.pathname}${location.search ? location.search : ''}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDrawerOpened]);

  useEffect(() => {
    if (location.hash) {
      setGlobalDrawer(<BadlistDetail badlist_id={location.hash.substr(1)} close={closeGlobalDrawer} />);
    } else {
      closeGlobalDrawer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  useEffect(() => {
    if (query && currentUser.roles.includes('badlist_view')) {
      reload(0);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    function handleReload() {
      reload(badlistResults ? badlistResults.offset : 0);
    }

    window.addEventListener('reloadBadlist', handleReload);

    return () => {
      window.removeEventListener('reloadBadlist', handleReload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, badlistResults]);

  const reload = offset => {
    query.set('rows', PAGE_SIZE);
    query.set('offset', offset);
    apiCall({
      method: 'POST',
      url: '/api/v4/search/badlist/',
      body: query.getParams(),
      onSuccess: api_data => {
        if (
          api_data.api_response.items.length === 0 &&
          api_data.api_response.offset !== 0 &&
          api_data.api_response.offset >= api_data.api_response.total
        ) {
          reload(Math.max(0, api_data.api_response.offset - api_data.api_response.rows));
        } else {
          setBadlistResults(api_data.api_response);
        }
      },
      onEnter: () => setSearching(true),
      onExit: () => setSearching(false)
    });
  };

  const onClear = useCallback(
    () => {
      navigate(location.pathname);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.pathname]
  );

  const onSearch = useCallback(
    () => {
      if (filterValue.current !== '') {
        query.set('query', filterValue.current);
        // navigate(`${location.pathname}?${query.toString()}`);
        navigate(`${location.pathname}?${query.getDeltaString()}${location.hash ? location.hash : ''}`);
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

  const setBadlistID = useCallback(
    (wf_id: string) => {
      navigate(`${location.pathname}${location.search ? location.search : ''}#${wf_id}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.search]
  );

  return currentUser.roles.includes('badlist_view') ? (
    <PageFullWidth margin={4}>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Typography variant="h4">{t('title')}</Typography>
        <BugReportOutlinedIcon
          style={{
            width: upMD ? theme.spacing(27.5) : theme.spacing(18.5),
            height: upMD ? theme.spacing(19.5) : theme.spacing(16),
            position: 'fixed',
            right: 0,
            zIndex: -1,
            color: alpha(theme.palette.error.light, 0.3),
            marginTop: upMD ? theme.spacing(-9) : theme.spacing(-7)
          }}
        />
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
                icon: <PersonOutlineOutlinedIcon fontSize={upMD ? 'medium' : 'small'} />,
                tooltip: t('user'),
                props: {
                  onClick: () => {
                    query.set('query', 'sources.type:user');
                    navigate(`${location.pathname}?${query.getDeltaString()}`);
                  }
                }
              },
              {
                icon: <LabelOutlinedIcon fontSize={upMD ? 'medium' : 'small'} />,
                tooltip: t('tag'),
                props: {
                  onClick: () => {
                    query.set('query', 'type:tag');
                    navigate(`${location.pathname}?${query.getDeltaString()}`);
                  }
                }
              },
              {
                icon: <BlockOutlinedIcon fontSize={upMD ? 'medium' : 'small'} />,
                tooltip: t('disabled'),
                props: {
                  onClick: () => {
                    query.set('query', 'enabled:false');
                    navigate(`${location.pathname}?${query.getDeltaString()}`);
                  }
                }
              }
            ]}
          >
            {badlistResults !== null && (
              <div className={classes.searchresult}>
                {badlistResults.total !== 0 && (
                  <Typography variant="subtitle1" color="secondary" style={{ flexGrow: 1 }}>
                    {searching ? (
                      <span>{t('searching')}</span>
                    ) : (
                      <span>
                        <SearchResultCount count={badlistResults.total} />
                        {query.get('query')
                          ? t(`filtered${badlistResults.total === 1 ? '' : 's'}`)
                          : t(`total${badlistResults.total === 1 ? '' : 's'}`)}
                      </span>
                    )}
                  </Typography>
                )}

                <SearchPager
                  total={badlistResults.total}
                  setResults={setBadlistResults}
                  pageSize={pageSize}
                  index="badlist"
                  query={query}
                  setSearching={setSearching}
                />
              </div>
            )}
          </SearchBar>
        </div>
      </PageHeader>

      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        <BadlistTable badlistResults={badlistResults} setBadlistID={setBadlistID} />
      </div>
    </PageFullWidth>
  ) : (
    <ForbiddenPage />
  );
}
