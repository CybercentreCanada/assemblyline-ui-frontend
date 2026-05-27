import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import PersonIcon from '@mui/icons-material/Person';
import { useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useAppNavigate } from 'core/router';
import { createAppRoute, useAppSearchParams } from 'core/routes';
import useALContext from 'deprecated/hooks/useALContext';
import useMyAPI from 'deprecated/hooks/useMyAPI';
import type { IndexDefinition } from 'models/api/user';
import type { SubmissionIndexed } from 'models/base/submission';
import { ForbiddenPage } from 'pages/forbidden/forbidden.route';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { safeFieldValue } from 'shared/utils/utils';
import { PageContainer } from 'ui/pages/PageContainer';
import { PageFullWidth } from 'ui/pages/PageFullWidth';
import { DEFAULT_SUGGESTION } from 'ui/SearchBar/search-textfield';
import SearchHeader from 'ui/SearchBar/SearchHeader';
import SubmissionsTable from 'ui/SearchResult/submissions';

type SearchResults = {
  items: SubmissionIndexed[];
  offset: number;
  rows: number;
  total: number;
};

const SubmissionSearch = memo(() => {
  const { t } = useTranslation(['submissions']);
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const { user: currentUser, indexes } = useALContext();

  const search = useAppSearchParams('/submissions', s => s);
  const navigate = useAppNavigate<'/submissions'>();

  const [submissionResults, setSubmissionResults] = useState<SearchResults>(null);
  const [searching, setSearching] = useState<boolean>(false);

  const suggestions = useMemo<IndexDefinition>(
    () => ({ ...indexes.submission, ...DEFAULT_SUGGESTION }),
    [indexes.submission]
  );

  const handleToggleFilter = useCallback(
    (filter: string) =>
      navigate.replaceSearchObject(s => ({
        ...s,
        offset: 0,
        filters: s.filters.includes(filter) ? s.filters.filter(f => f !== filter) : [...s.filters, filter]
      })),

    [navigate]
  );

  useEffect(() => {
    if (!search || !currentUser.roles.includes('submission_view')) return;

    apiCall({
      url: '/api/v4/search/submission/',
      method: 'POST',
      body: search
        .set(o => ({ ...o, query: o.query || '*', filters: [...o.filters, 'NOT(to_be_deleted:true)'] }))
        .toObject(),
      onSuccess: ({ api_response }) => setSubmissionResults(api_response as SearchResults),
      onEnter: () => setSearching(true),
      onExit: () => setSearching(false)
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.roles, search.toString()]);

  return currentUser.roles.includes('submission_view') ? (
    <PageFullWidth margin={4}>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Typography variant="h4">{t('title')}</Typography>
      </div>

      <PageContainer isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchHeader
            params={search.toParams()}
            loading={searching}
            results={submissionResults}
            resultLabel={
              search.get('query')
                ? t(`filtered${submissionResults?.total === 1 ? '' : 's'}`)
                : t(`total${submissionResults?.total === 1 ? '' : 's'}`)
            }
            onChange={v => navigate.replaceURLSearchParams(v)}
            paramDefaults={search.defaults().toObject()}
            searchInputProps={{ placeholder: t('filter'), options: suggestions }}
            actionProps={[
              {
                tooltip: {
                  title: search.has('filters', `params.submitter:${safeFieldValue(currentUser.username)}`)
                    ? t('filter.personal.remove')
                    : t('filter.personal.add')
                },
                icon: { children: <PersonIcon /> },
                button: {
                  color: search.has('filters', `params.submitter:${safeFieldValue(currentUser.username)}`)
                    ? 'primary'
                    : 'default',
                  onClick: () => handleToggleFilter(`params.submitter:${safeFieldValue(currentUser.username)}`)
                }
              },
              {
                tooltip: {
                  title: search.has('filters', 'state:completed')
                    ? t('filter.completed.remove')
                    : t('filter.completed.add')
                },
                icon: { children: <AssignmentTurnedInIcon /> },
                button: {
                  sx: {
                    color: !search.has('filters', 'state:completed')
                      ? 'default'
                      : theme.palette.mode === 'dark'
                        ? theme.palette.success.light
                        : theme.palette.success.dark
                  },
                  onClick: () => handleToggleFilter('state:completed')
                }
              },
              {
                tooltip: {
                  title: search.has('filters', 'max_score:>=1000')
                    ? t('filter.malicious.remove')
                    : t('filter.malicious.add')
                },
                icon: { children: <BugReportOutlinedIcon /> },
                button: {
                  sx: {
                    color: !search.has('filters', 'max_score:>=1000')
                      ? 'default'
                      : theme.palette.mode === 'dark'
                        ? theme.palette.error.light
                        : theme.palette.error.dark
                  },
                  onClick: () => handleToggleFilter('max_score:>=1000')
                }
              }
            ]}
          />
        </div>
      </PageContainer>

      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        <SubmissionsTable submissionResults={submissionResults} />
      </div>
    </PageFullWidth>
  ) : (
    <ForbiddenPage />
  );
});

export const SubmissionSearchRoute = createAppRoute({
  component: SubmissionSearch,
  path: '/submissions',
  search: s => ({
    query: s.string(''),
    offset: s.number(0).min(0).origin('snapshot').ephemeral(),
    rows: s.number(25).locked().origin('snapshot').ephemeral(),
    sort: s.string('times.submitted desc').ephemeral(),
    filters: s.filters([]),
    track_total_hits: s.number(null).origin('snapshot').nullable().ephemeral()
  })
});
