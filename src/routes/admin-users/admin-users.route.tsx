import BlockIcon from '@mui/icons-material/Block';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import { useTheme } from '@mui/material';
import { useAppNavigate } from 'core/router';
import { createAppRoute, useAppSearchSnapshot } from 'core/routes';
import { AppPageContainer, AppPageFullWidth } from 'core/template';
import useALContext from 'deprecated/hooks/useALContext';
import useMyAPI from 'deprecated/hooks/useMyAPI';
import type { SearchResult } from 'models/api/search';
import type { IndexDefinition } from 'models/api/user';
import type { UserIndexed } from 'models/base/user';
import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddUserPage from 'routes/admin-users/components/users_add';
import { UsersTable } from 'routes/search/components/users';
import { PageHeader } from 'ui/layouts/PageHeader';
import { DEFAULT_SUGGESTION } from 'ui/SearchBar/search-textfield';
import SearchHeader from 'ui/SearchBar/SearchHeader';

export const AdminUsersPage = memo(() => {
  const { t } = useTranslation(['adminUsers']);
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useALContext();
  const navigate = useAppNavigate<'/admin/users'>();
  const search = useAppSearchSnapshot<'/admin/users'>();

  const [userResults, setUserResults] = useState<SearchResult<UserIndexed>>(null);
  const [searching, setSearching] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<IndexDefinition>(DEFAULT_SUGGESTION);

  const handleToggleFilter = useCallback(
    (filter: string) => {
      navigate.here().search(s =>
        s.set(o => ({
          ...o,
          offset: 0,
          filters: o.filters.includes(filter) ? o.filters.filter(f => f !== filter) : [...o.filters, filter]
        }))
      );
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

      apiCall<SearchResult<UserIndexed>>({
        url: `/api/v4/user/list/?${param}`,
        onSuccess: ({ api_response }) => setUserResults(api_response),
        onEnter: () => setSearching(true),
        onFinalize: () => setSearching(false)
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser.is_admin]
  );

  useEffect(() => {
    handleReload(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleReload, search.toString()]);

  useEffect(() => {
    if (!currentUser.is_admin) return;
    apiCall<IndexDefinition>({
      url: '/api/v4/search/fields/user/',
      onSuccess: ({ api_response }) => setSuggestions({ ...api_response, ...DEFAULT_SUGGESTION })
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.is_admin]);

  useEffect(() => {
    function reload() {
      navigate.here().search(s => s.set(o => ({ ...o, offset: 0, refresh: !o.refresh })));
    }

    window.addEventListener('reloadUsers', reload);
    return () => {
      window.removeEventListener('reloadUsers', reload);
    };
  }, [navigate]);

  return (
    <AppPageFullWidth>
      <PageHeader
        primary={t('title')}
        slotProps={{
          root: { style: { marginBottom: theme.spacing(2) } },
          actions: { spacing: 1 }
        }}
        actions={<AddUserPage />}
      />

      <AppPageContainer isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchHeader
            params={search.toParams()}
            loading={searching}
            results={userResults}
            resultLabel={
              search.get('query')
                ? t(`filtered${userResults?.total === 1 ? '' : 's'}`)
                : t(`total${userResults?.total === 1 ? '' : 's'}`)
            }
            onChange={v =>
              navigate
                .here()
                .update(s => ({ ...s, search: { ...s.search, ...AdminUsersRoute.search.full(v).toObject() } }))
            }
            paramDefaults={search.defaults().toObject()}
            searchInputProps={{ placeholder: t('filter'), options: suggestions }}
            actionProps={[
              {
                tooltip: {
                  title: search.has('filters', 'type:admin') ? t('filter.admins.remove') : t('filter.admins.add')
                },
                icon: { children: <SupervisorAccountIcon /> },
                button: {
                  color: search.has('filters', 'type:admin') ? 'primary' : 'default',
                  onClick: () => handleToggleFilter('type:admin')
                }
              },
              {
                tooltip: {
                  title: search.has('filters', 'is_active:false')
                    ? t('filter.disabled.remove')
                    : t('filter.disabled.add')
                },
                icon: { children: <BlockIcon /> },
                button: {
                  color: search.has('filters', 'is_active:false') ? 'primary' : 'default',
                  onClick: () => handleToggleFilter('is_active:false')
                }
              }
            ]}
          />
        </div>
      </AppPageContainer>

      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        <UsersTable userResults={userResults} />
      </div>
    </AppPageFullWidth>
  );
});

export const AdminUsersRoute = createAppRoute({
  component: AdminUsersPage,

  path: '/admin/users',
  search: s => ({
    query: s.string(''),
    offset: s.number(0).min(0).source('transient').ephemeral(),
    rows: s.number(25).locked().source('transient').ephemeral(),
    sort: s.string(null).nullable().ephemeral(),
    filters: s.filters([]),
    track_total_hits: s.number(10000).nullable().ephemeral(),
    refresh: s.boolean(false).source('transient').ephemeral()
  }),

  ancestor: '/admin',
  shortname: () => ['app_route.admin_users.shortname', { ns: 'adminUsers' }],
  fullname: () => ['app_route.admin_users.fullname', { ns: 'adminUsers' }],
  shorticon: () => <SupervisorAccountOutlinedIcon />,
  fullicon: () => <SupervisorAccountOutlinedIcon />,

  disabled: () => false,
  forbidden: (_location, config) => !config.user.is_admin
});
