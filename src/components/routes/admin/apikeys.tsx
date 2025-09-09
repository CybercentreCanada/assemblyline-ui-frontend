import PersonIcon from '@mui/icons-material/Person';
import { Grid, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import PageContainer from 'commons/components/pages/PageContainer';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import { createSearchParams } from 'components/core/SearchParams/createSearchParams';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import type { ApiKey } from 'components/models/base/user';
import type { SearchResult } from 'components/models/ui/search';
import type { IndexDefinition } from 'components/models/ui/user';
import ApikeyDetail from 'components/routes/admin/apikey_detail';
import SearchHeader from 'components/visual/SearchBar/SearchHeader';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import ApikeysTable from 'components/visual/SearchResult/apikeys';
import { safeFieldValue } from 'helpers/utils';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation, useNavigate } from 'react-router';

export const { SearchParamsProvider, useSearchParams } = createSearchParams(p => ({
  query: p.string(''),
  offset: p.number(0).min(0).origin('state').ephemeral(),
  rows: p.number(25).locked().origin('state').ephemeral(),
  sort: p.string(null).ephemeral(),
  filters: p.filters([]),
  track_total_hits: p.number(10000).nullable().ephemeral(),
  refresh: p.boolean(false).origin('state').ephemeral()
}));

const APIKeysSearch = () => {
  const { t } = useTranslation(['adminAPIkeys']);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const { globalDrawerOpened, setGlobalDrawer, closeGlobalDrawer } = useDrawer();
  const { user: currentUser } = useALContext();
  const { search, setSearchParams, setSearchObject } = useSearchParams();

  const [apikeySearchResults, setApikeySearchResults] = useState<SearchResult<ApiKey>>(null);
  const [searching, setSearching] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<IndexDefinition>(DEFAULT_SUGGESTION);

  const setApikeyID = useCallback(
    (key_id: string) => {
      navigate(`${location.pathname}${location.search || ''}#${key_id}`);
    },
    [location.pathname, location.search, navigate]
  );

  const handleToggleFilter = useCallback(
    (filter: string) => {
      setSearchObject(o => {
        const filters = o.filters.includes(filter) ? o.filters.filter(f => f !== filter) : [...o.filters, filter];
        return { ...o, offset: 0, filters };
      });
    },
    [setSearchObject]
  );

  const handleReload = useCallback(
    (body: typeof search) => {
      if (!currentUser.is_admin) return;

      const param = body
        .set(o => ({ ...o, query: [o.query || '*', ...o.filters].join(' && ') }))
        .omit(['filters', 'refresh'])
        .toString();

      apiCall<SearchResult<ApiKey>>({
        url: `/api/v4/apikey/list/?${param}`,
        onSuccess: ({ api_response }) => setApikeySearchResults(api_response),
        onEnter: () => setSearching(true),
        onFinalize: () => setSearching(false)
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser.is_admin]
  );

  useEffect(() => {
    if (!search) return;
    handleReload(search);
  }, [handleReload, search]);

  useEffect(() => {
    if (!location.hash || globalDrawerOpened || !apikeySearchResults) return;
    navigate(`${location.pathname}${location.search || ''}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDrawerOpened]);

  useEffect(() => {
    if (!location.hash) closeGlobalDrawer();
    else {
      setGlobalDrawer(
        <ApikeyDetail
          key_id={location.hash.slice(1)}
          onClose={() => navigate(`${location.pathname}${location.search}`)}
        />
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  useEffect(() => {
    if (!currentUser.is_admin) return;
    apiCall<IndexDefinition>({
      url: '/api/v4/search/fields/apikey/',
      onSuccess: ({ api_response }) => setSuggestions({ ...api_response, ...DEFAULT_SUGGESTION })
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.is_admin]);

  useEffect(() => {
    function reload() {
      setSearchObject(o => ({ ...o, offset: 0, refresh: !o.refresh }));
    }

    window.addEventListener('reloadAPIKeys', reload);
    return () => {
      window.removeEventListener('reloadAPIKeys', reload);
    };
  }, [setSearchObject]);

  return currentUser.is_admin ? (
    <PageFullWidth margin={4}>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Grid container alignItems="center">
          <Grid flexGrow={1}>
            <Typography variant="h4">{t('apikeys.title')}</Typography>
          </Grid>
        </Grid>
      </div>

      <PageContainer isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchHeader
            params={search.toParams()}
            loading={searching}
            results={apikeySearchResults}
            resultLabel={
              search.get('query')
                ? t(`filtered${apikeySearchResults?.total === 1 ? '' : 's'}`)
                : t(`total${apikeySearchResults?.total === 1 ? '' : 's'}`)
            }
            onChange={v => setSearchParams(v)}
            paramDefaults={search.defaults().toObject()}
            searchInputProps={{ placeholder: t('filter'), options: suggestions }}
            actionProps={[
              {
                tooltip: {
                  title: search.has('filters', `uname:${safeFieldValue(currentUser.username)}`)
                    ? t('filter.personal.remove')
                    : t('filter.personal.add')
                },
                icon: { children: <PersonIcon /> },
                button: {
                  color: search.has('filters', `uname:${safeFieldValue(currentUser.username)}`) ? 'primary' : 'default',
                  onClick: () => handleToggleFilter(`uname:${safeFieldValue(currentUser.username)}`)
                }
              }
            ]}
          />
        </div>
      </PageContainer>

      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        <ApikeysTable apikeySearchResults={apikeySearchResults} setApikeyID={setApikeyID} />
      </div>
    </PageFullWidth>
  ) : (
    <Navigate to="/forbidden" replace />
  );
};

const WrappedAPIKeysPage = () => (
  <SearchParamsProvider>
    <APIKeysSearch />
  </SearchParamsProvider>
);

export const APIKeysPage = React.memo(WrappedAPIKeysPage);
export default APIKeysPage;
