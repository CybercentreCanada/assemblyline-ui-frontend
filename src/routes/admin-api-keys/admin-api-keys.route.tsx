import PersonIcon from '@mui/icons-material/Person';
import { Grid, Typography, useTheme } from '@mui/material';
import { useAppNavigate } from 'core/router';
import { createAppRoute, useAppSearchSnapshot } from 'core/routes';
import useALContext from 'deprecated/hooks/useALContext';
import useMyAPI from 'deprecated/hooks/useMyAPI';
import type { SearchResult } from 'models/api/search';
import type { IndexDefinition } from 'models/api/user';
import type { ApiKey } from 'models/base/user';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import ApikeysTable from 'routes/search/components/apikeys';
import { safeFieldValue } from 'shared/utils/utils';
import { PageContainer } from 'ui/pages/PageContainer';
import { PageFullWidth } from 'ui/pages/PageFullWidth';
import { DEFAULT_SUGGESTION } from 'ui/SearchBar/search-textfield';
import SearchHeader from 'ui/SearchBar/SearchHeader';

//*****************************************************************************************
// AdminAPIKeys Page
//*****************************************************************************************

export const AdminAPIKeysPage = React.memo(() => {
  const { t } = useTranslation(['adminAPIkeys']);
  const navigate = useAppNavigate<'/admin/apikeys'>();
  const search = useAppSearchSnapshot<'/admin/apikeys'>();
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useALContext();

  const [apikeySearchResults, setApikeySearchResults] = useState<SearchResult<ApiKey>>(null);
  const [searching, setSearching] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<IndexDefinition>(DEFAULT_SUGGESTION);

  const handleToggleFilter = useCallback(
    (filter: string) => {
      navigate.here().update(s => ({
        ...s,
        search: {
          ...s,
          offset: 0,
          filters: s.search.filters.includes(filter)
            ? s.search.filters.filter(f => f !== filter)
            : [...s.search.filters, filter]
        }
      }));
    },
    [navigate]
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleReload, search.toString()]);

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
      navigate.here().update(s => ({ ...s, search: { ...s.search, offset: 0, refresh: !s.search.refresh } }));
    }

    window.addEventListener('reloadAdminAPIKeys', reload);
    return () => {
      window.removeEventListener('reloadAdminAPIKeys', reload);
    };
  }, [navigate]);

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
            onChange={v => navigate.here().update(s => ({ ...s, search: AdminAPIKeysRoute.search.full(v).toObject() }))}
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
        <ApikeysTable apikeySearchResults={apikeySearchResults} />
      </div>
    </PageFullWidth>
  ) : (
    <Navigate to="/forbidden" replace />
  );
});

AdminAPIKeysPage.displayName = 'AdminAPIKeysPage';

//*****************************************************************************************
// AdminAPIKeys Route
//*****************************************************************************************

export const AdminAPIKeysRoute = createAppRoute({
  component: AdminAPIKeysPage,
  path: '/admin/apikeys',
  search: s => ({
    query: s.string(''),
    offset: s.number(0).min(0).ephemeral(),
    rows: s.number(25).locked().ephemeral(),
    sort: s.string(null).ephemeral(),
    filters: s.filters([]),
    track_total_hits: s.number(10000).nullable().ephemeral(),
    refresh: s.boolean(false).ephemeral()
  }),

  forbidden: s => !s.user.is_admin
});
