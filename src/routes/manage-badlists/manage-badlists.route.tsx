import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { useTheme } from '@mui/material';
import { useAppQuery } from 'core/api';
import { useAppNavigate } from 'core/router';
import { createAppRoute, useAppSearchSnapshot } from 'core/routes';
import { AppPageContainer, AppPageFullWidth } from 'core/template';
import useALContext from 'deprecated/hooks/useALContext';
import type { IndexDefinition } from 'models/api/user';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BadlistTable } from 'routes/search/components/badlist';
import { IconButton } from 'ui/buttons/IconButton';
import { PageHeader } from 'ui/layouts/PageHeader';
import { DEFAULT_SUGGESTION } from 'ui/SearchBar/search-textfield';
import SearchHeader from 'ui/SearchBar/SearchHeader';

export const ManageBadlistsPage = memo(() => {
  const { t } = useTranslation(['manageBadlists']);
  const theme = useTheme();
  const navigate = useAppNavigate<'/manage/badlists'>();
  const search = useAppSearchSnapshot<'/manage/badlists'>();
  const { indexes } = useALContext();
  const { user: currentUser } = useALContext();

  const suggestions = useMemo<IndexDefinition>(
    () => ({ ...indexes.badlist, ...DEFAULT_SUGGESTION }),
    [indexes.badlist]
  );

  const badlists = useAppQuery({
    url: '/api/v4/search/badlist/',
    method: 'POST',
    disabled: !currentUser.roles.includes('badlist_view'),
    body: search
      .set(o => ({ ...o, query: o.query || '*' }))
      .omit(['refresh'])
      .toObject()
  });

  const handleToggleFilter = useCallback(
    (filter: string) => {
      navigate.here().update(s => ({
        ...s,
        search: {
          ...s.search,
          filters: s.search.filters.includes(filter)
            ? s.search.filters.filter(f => f !== filter)
            : [...s.search.filters, filter]
        }
      }));
    },
    [navigate]
  );

  return (
    <AppPageFullWidth>
      <PageHeader
        primary={t('title')}
        slotProps={{
          root: { style: { marginBottom: theme.spacing(4) } }
        }}
        actions={
          <IconButton
            tooltip={t('add_badlist')}
            preventRender={!currentUser.roles.includes('badlist_manage')}
            size="large"
            sx={{ color: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark }}
            onClick={() => navigate.to().create({ route: '/manage/badlist/add' })}
          >
            <AddCircleOutlineOutlinedIcon />
          </IconButton>
        }
      />

      <AppPageContainer isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchHeader
            params={search.toParams()}
            loading={badlists.isFetching}
            results={badlists.data}
            resultLabel={
              search.get('query')
                ? t(`filtered${badlists.data?.total === 1 ? '' : 's'}`)
                : t(`total${badlists.data?.total === 1 ? '' : 's'}`)
            }
            onChange={v =>
              navigate
                .here()
                .update(s => ({ ...s, search: { ...s.search, ...ManageBadlistsRoute.search.delta(v).toObject() } }))
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
      </AppPageContainer>

      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        <BadlistTable badlistResults={badlists.data} />
      </div>
    </AppPageFullWidth>
  );
});

export const ManageBadlistsRoute = createAppRoute({
  component: ManageBadlistsPage,

  path: '/manage/badlists',
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
  shortname: () => ['app_route.manage_badlists.shortname', { ns: 'manageBadlists' }],
  fullname: () => ['app_route.manage_badlists.fullname', { ns: 'manageBadlists' }],
  shorticon: () => <BugReportOutlinedIcon />,
  fullicon: () => <BugReportOutlinedIcon />,

  disabled: () => false,
  forbidden: (_location, config) => !config.user.roles.includes('badlist_view')
});
