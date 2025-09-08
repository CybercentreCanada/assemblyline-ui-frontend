import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import PersonIcon from '@mui/icons-material/Person';
import { useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import PageContainer from 'commons/components/pages/PageContainer';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import { createSearchParams } from 'components/core/SearchParams2/createSearchParams';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import type { SubmissionIndexed } from 'components/models/base/submission';
import ForbiddenPage from 'components/routes/403';
import SearchHeader from 'components/visual/SearchBar/SearchHeader';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import SubmissionsTable from 'components/visual/SearchResult/submissions';
import { safeFieldValue } from 'helpers/utils';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type SearchResults = {
  items: SubmissionIndexed[];
  offset: number;
  rows: number;
  total: number;
};

export const { SearchParamsProvider, useSearchParams } = createSearchParams(p => ({
  query: p.string(''),
  offset: p.number(0).min(0).source('state').ignored(),
  rows: p.number(25).enforced().source('ref').ignored(),
  sort: p.string('times.submitted desc').ignored(),
  filters: p.filters([]),
  track_total_hits: p.number(10000).source('state').nullable().ignored()
}));

const SubmissionSearch = () => {
  const { t } = useTranslation(['submissions']);
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const { user: currentUser, indexes } = useALContext();
  const search = useSearchParams();

  const [submissionResults, setSubmissionResults] = useState<SearchResults>(null);
  const [searching, setSearching] = useState<boolean>(false);

  const suggestions = useMemo<string[]>(
    () => [...Object.keys(indexes.submission).filter(name => indexes.submission[name].indexed), ...DEFAULT_SUGGESTION],
    [indexes.submission]
  );

  const handleToggleFilter = useCallback(
    (filter: string) => {
      search.setObject(o => {
        const filters = o.filters.includes(filter) ? o.filters.filter(f => f !== filter) : [...o.filters, filter];
        return { ...o, offset: 0, filters };
      });
    },
    [search]
  );

  useEffect(() => {
    if (!search || !currentUser.roles.includes('submission_view')) return;

    console.log(search.snapshot);

    apiCall({
      url: '/api/v4/search/submission/',
      method: 'POST',
      body: search.snapshot
        .set(o => ({ ...o, query: o.query || '*', filters: [...o.filters, 'NOT(to_be_deleted:true)'] }))
        .toObject(),
      onSuccess: ({ api_response }) => setSubmissionResults(api_response as SearchResults),
      onEnter: () => setSearching(true),
      onExit: () => setSearching(false)
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.roles, search.snapshot]);

  return currentUser.roles.includes('submission_view') ? (
    <PageFullWidth margin={4}>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Typography variant="h4">{t('title')}</Typography>
      </div>

      <PageContainer isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchHeader
            params={search.snapshot.toParams()}
            loading={searching}
            results={submissionResults}
            resultLabel={
              search.snapshot.get('query')
                ? t(`filtered${submissionResults?.total === 1 ? '' : 's'}`)
                : t(`total${submissionResults?.total === 1 ? '' : 's'}`)
            }
            onChange={v => search.setParams(v)}
            paramDefaults={search.snapshot.defaults().toObject()}
            searchInputProps={{ placeholder: t('filter'), options: suggestions }}
            actionProps={[
              {
                tooltip: {
                  title: search.snapshot.has('filters', `params.submitter:${safeFieldValue(currentUser.username)}`)
                    ? t('filter.personal.remove')
                    : t('filter.personal.add')
                },
                icon: { children: <PersonIcon /> },
                button: {
                  color: search.snapshot.has('filters', `params.submitter:${safeFieldValue(currentUser.username)}`)
                    ? 'primary'
                    : 'default',
                  onClick: () => handleToggleFilter(`params.submitter:${safeFieldValue(currentUser.username)}`)
                }
              },
              {
                tooltip: {
                  title: search.snapshot.has('filters', 'state:completed')
                    ? t('filter.completed.remove')
                    : t('filter.completed.add')
                },
                icon: { children: <AssignmentTurnedInIcon /> },
                button: {
                  sx: {
                    color: !search.snapshot.has('filters', 'state:completed')
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
                  title: search.snapshot.has('filters', 'max_score:>=1000')
                    ? t('filter.malicious.remove')
                    : t('filter.malicious.add')
                },
                icon: { children: <BugReportOutlinedIcon /> },
                button: {
                  sx: {
                    color: !search.snapshot.has('filters', 'max_score:>=1000')
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
};

const WrappedSubmissionPage = () => (
  <SearchParamsProvider>
    <SubmissionSearch />
  </SearchParamsProvider>
);

export const SubmissionPage = React.memo(WrappedSubmissionPage);
export default SubmissionPage;
