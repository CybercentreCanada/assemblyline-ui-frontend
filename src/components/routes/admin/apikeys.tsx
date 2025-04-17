import PersonIcon from '@mui/icons-material/Person';
import { Grid, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import PageHeader from 'commons/components/pages/PageHeader';
import type { SearchParams } from 'components/core/SearchParams/SearchParams';
import { createSearchParams } from 'components/core/SearchParams/SearchParams';
import { SearchParamsProvider, useSearchParams } from 'components/core/SearchParams/SearchParamsContext';
import type { SearchParamsResult } from 'components/core/SearchParams/SearchParser';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import type { ApiKey } from 'components/models/base/user';
import type { FieldsResult, SearchResult } from 'components/models/ui/search';
import SearchHeader from 'components/visual/SearchBar/SearchHeader';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import ApikeysTable from 'components/visual/SearchResult/apikeys';
import { safeFieldValue } from 'helpers/utils';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation, useNavigate } from 'react-router';
import ApikeyDetail from './apikey_detail';

const API_KEYS_PARAMS = createSearchParams(p => ({
  query: p.string(''),
  offset: p.number(0).min(0).hidden().ignored(),
  rows: p.number(25).enforced().hidden().ignored(),
  sort: p.string(null).ignored(),
  filters: p.filters([]),
  track_total_hits: p.number(10000).nullable().ignored(),
  refresh: p.boolean(false).hidden().ignored()
}));

export type APIKeysParams = SearchParams<typeof API_KEYS_PARAMS>;

const APIKeysSearch = () => {
  const { t } = useTranslation(['adminAPIkeys']);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const { globalDrawerOpened, setGlobalDrawer, closeGlobalDrawer } = useDrawer();
  const { user: currentUser } = useALContext();
  const { search, setSearchParams, setSearchObject } = useSearchParams<APIKeysParams>();

  const [apikeySearchResults, setApikeySearchResults] = useState<SearchResult<ApiKey>>(null);
  const [searching, setSearching] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTION);

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
    (body: SearchParamsResult<APIKeysParams>) => {
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
    apiCall<FieldsResult>({
      url: '/api/v4/search/fields/apikey/',
      onSuccess: ({ api_response }) =>
        setSuggestions([...Object.keys(api_response).filter(name => api_response[name].indexed), ...DEFAULT_SUGGESTION])
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
          <Grid size={{ xs: 12 }}>
            <Typography variant="h4">{t('apikeys.title')}</Typography>
          </Grid>
        </Grid>
      </div>

      <PageHeader isSticky>
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
      </PageHeader>

      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        <ApikeysTable apikeySearchResults={apikeySearchResults} setApikeyID={setApikeyID} />
      </div>
    </PageFullWidth>
  ) : (
    <Navigate to="/forbidden" replace />
  );
};

const WrappedAPIKeysPage = () => (
  <SearchParamsProvider params={API_KEYS_PARAMS}>
    <APIKeysSearch />
  </SearchParamsProvider>
);

export const APIKeysPage = React.memo(WrappedAPIKeysPage);
export default APIKeysPage;
