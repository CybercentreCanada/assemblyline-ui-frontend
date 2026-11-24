import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { useTheme } from '@mui/material';
import useMyAPI from 'core/api/hooks/useMyAPI';
import useALContext from 'core/config/useALContext';
import { createAppRoute, useAppNavigate, useAppSearchSnapshot } from 'core/router';
import PageContainer from 'core/template/branding/AppPageContainer';
import { useAppUser } from 'core/template/components/app/hooks';
import PageFullWidth from 'core/template/components/pages/PageFullWidth';
import type { SearchResult } from 'models/api/search';
import type { CustomUser, IndexDefinition } from 'models/api/user';
import type { Safelist } from 'models/base/safelist';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ForbiddenPage } from 'routes/forbidden/forbidden.page';
import SafelistTable from 'routes/search/components/safelist';
import { IconButton } from 'ui/buttons/IconButton';
import { PageHeader } from 'ui/layouts/PageHeader';
import { DEFAULT_SUGGESTION } from 'ui/SearchBar/search-textfield';
import SearchHeader from 'ui/SearchBar/SearchHeader';

export const ManageSafelistsContent = memo(() => {
  const { t } = useTranslation(['manageSafelist']);
  const theme = useTheme();
  const navigate = useAppNavigate<'/manage/safelists'>();
  const search = useAppSearchSnapshot<'/manage/safelists'>();
  const { apiCall } = useMyAPI();
  const { indexes } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();

  const [safelistResults, setSafelistResults] = useState<SearchResult<Safelist>>(null);
  const [searching, setSearching] = useState<boolean>(false);

  const suggestions = useMemo<IndexDefinition>(
    () => ({ ...indexes.safelist, ...DEFAULT_SUGGESTION }),
    [indexes.safelist]
  );

  const handleToggleFilter = useCallback(
    (filter: string) => {
      navigate.here().update(s => ({
        ...s,
        search: {
          ...s.search,
          offset: 0,
          filters: s.search.filters.includes(filter)
            ? s.search.filters.filter(value => value !== filter)
            : [...s.search.filters, filter]
        }
      }));
    },
    [navigate]
  );

  const handleReload = useCallback(
    (body: typeof search) => {
      if (!currentUser.roles.includes('safelist_view')) return;

      apiCall<SearchResult<Safelist>>({
        url: '/api/v4/search/safelist/',
        method: 'POST',
        body: body
          .set(o => ({ ...o, query: o.query || '*' }))
          .omit(['refresh'])
          .toObject(),
        onSuccess: ({ api_response }) => setSafelistResults(api_response),
        onEnter: () => setSearching(true),
        onExit: () => setSearching(false)
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser.roles]
  );

  useEffect(() => {
    handleReload(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleReload, search.toString()]);

  useEffect(() => {
    function reload() {
      navigate.here().update(s => ({ ...s, search: { ...s.search, offset: 0, refresh: !s.search.refresh } }));
    }

    window.addEventListener('reloadSafelist', reload);
    return () => {
      window.removeEventListener('reloadSafelist', reload);
    };
  }, [navigate]);

  return currentUser.roles.includes('safelist_view') ? (
    <PageFullWidth margin={4}>
      <PageHeader
        primary={t('title')}
        slotProps={{
          root: { style: { marginBottom: theme.spacing(2) } }
        }}
        actions={
          <IconButton
            tooltip={t('add_safelist')}
            preventRender={!currentUser.roles.includes('safelist_manage')}
            size="large"
            sx={{ color: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark }}
            nav={nav => nav.to().create({ route: '/manage/safelist/add' })}
          >
            <AddCircleOutlineOutlinedIcon />
          </IconButton>
        }
      />

      <PageContainer isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchHeader
            params={search.toParams()}
            loading={searching}
            results={safelistResults}
            resultLabel={
              search.get('query')
                ? t(`filtered${safelistResults?.total === 1 ? '' : 's'}`)
                : t(`total${safelistResults?.total === 1 ? '' : 's'}`)
            }
            onChange={values =>
              navigate.here().update(s => ({
                ...s,
                search: { ...s.search, ...ManageSafelistsRoute.search.full(values).toObject() }
              }))
            }
            paramDefaults={search.defaults().toObject()}
            searchInputProps={{ placeholder: t('filter'), options: suggestions }}
            actionProps={[
              {
                tooltip: {
                  title: search.has('filters', 'sources.type:user') ? t('filter.user.remove') : t('filter.user.add')
                },
                icon: { children: <PersonOutlineOutlinedIcon /> },
                button: {
                  color: search.has('filters', 'sources.type:user') ? 'primary' : 'default',
                  onClick: () => handleToggleFilter('sources.type:user')
                }
              },
              {
                tooltip: { title: search.has('filters', 'type:tag') ? t('filter.tag.remove') : t('filter.tag.add') },
                icon: { children: <LabelOutlinedIcon /> },
                button: {
                  color: search.has('filters', 'type:tag') ? 'primary' : 'default',
                  onClick: () => handleToggleFilter('type:tag')
                }
              },
              {
                tooltip: {
                  title: search.has('filters', 'enabled:false') ? t('filter.disabled.remove') : t('filter.disabled.add')
                },
                icon: { children: <BlockOutlinedIcon /> },
                button: {
                  color: search.has('filters', 'enabled:false') ? 'primary' : 'default',
                  onClick: () => handleToggleFilter('enabled:false')
                }
              }
            ]}
          />
        </div>
      </PageContainer>

      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        <SafelistTable safelistResults={safelistResults} />
      </div>
    </PageFullWidth>
  ) : (
    <ForbiddenPage />
  );
});

export const ManageSafelistsPage = memo(() => <ManageSafelistsContent />);
ManageSafelistsPage.displayName = 'ManageSafelistsPage';

export const ManageSafelistsRoute = createAppRoute({
  component: ManageSafelistsPage,

  path: '/manage/safelists',
  search: s => ({
    query: s.string(''),
    offset: s.number(0).min(0).source('transient').ephemeral(),
    rows: s.number(25).locked().source('transient').ephemeral(),
    sort: s.string('added desc').ephemeral(),
    filters: s.filters([]),
    track_total_hits: s.number(10000).nullable().ephemeral(),
    refresh: s.boolean(false).source('transient').ephemeral()
  }),

  ancestor: '/manage',
  shortname: () => ['app_route.manage_safelists.shortname', { ns: 'manageSafelists' }],
  fullname: () => ['app_route.manage_safelists.fullname', { ns: 'manageSafelists' }],
  shorticon: () => <VerifiedUserOutlinedIcon />,
  fullicon: () => <VerifiedUserOutlinedIcon />,

  disabled: () => false,
  forbidden: (_location, config) => !config.user.roles.includes('safelist_view')
});
