import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import PersonIcon from '@mui/icons-material/Person';
import { useMediaQuery, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import PageHeader from 'commons/components/pages/PageHeader';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import type { SearchParams } from 'components/visual/SearchBar/SearchParams';
import { SearchParamsProvider, useSearchParams } from 'components/visual/SearchBar/SearchParamsContext';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import SearchHeader from 'components/visual/SearchHeader';
import type { SubmissionResult } from 'components/visual/SearchResult/submissions';
import SubmissionsTable from 'components/visual/SearchResult/submissions';
import { safeFieldValue } from 'helpers/utils';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ForbiddenPage from './403';

type SearchResults = {
  items: SubmissionResult[];
  offset: number;
  rows: number;
  total: number;
};

const SUBMISSION_PARAMS = {
  query: '',
  rows: 25,
  offset: 0,
  sort: 'times.submitted desc',
  filters: ['NOT(to_be_deleted:true)']
};

type SubmissionParams = SearchParams<typeof SUBMISSION_PARAMS>;

const SubmissionPage = () => {
  const { t } = useTranslation(['submissions']);
  const theme = useTheme();
  const upMD = useMediaQuery(theme.breakpoints.up('md'));
  const { apiCall } = useMyAPI();
  const { user: currentUser, indexes } = useALContext();
  const { search, setSearchParams, setSearchObject } = useSearchParams<SubmissionParams>();

  const [submissionResults, setSubmissionResults] = useState<SearchResults>(null);
  const [searching, setSearching] = useState<boolean>(false);

  const suggestions = useMemo<string[]>(
    () => [...Object.keys(indexes.submission).filter(name => indexes.submission[name].indexed), ...DEFAULT_SUGGESTION],
    [indexes.submission]
  );

  useEffect(() => {
    if (!search || !currentUser.roles.includes('submission_view')) return;

    apiCall({
      method: 'POST',
      url: '/api/v4/search/submission/',
      body: search.set(o => ({ ...o, query: o.query ? o.query : '*' })).toObject(),
      onSuccess: ({ api_response }) => setSubmissionResults(api_response),
      onEnter: () => setSearching(true),
      onExit: () => setSearching(false)
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.roles, search]);

  return currentUser.roles.includes('submission_view') ? (
    <PageFullWidth margin={4}>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Typography variant="h4">{t('title')}</Typography>
      </div>

      <PageHeader isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchHeader
            value={search.toParams()}
            loading={searching}
            suggestions={suggestions}
            pageSize={SUBMISSION_PARAMS.rows}
            total={submissionResults?.total}
            placeholder={t('filter')}
            defaultValue={{ query: '*', rows: 25 }}
            paramKeys={{ query: 'query', filters: 'filters' }}
            onChange={v => setSearchParams(v)}
            renderTotalResults={() =>
              search.get('query')
                ? t(`filtered${submissionResults.total === 1 ? '' : 's'}`)
                : t(`total${submissionResults.total === 1 ? '' : 's'}`)
            }
            buttonProps={[
              {
                tooltipTitle: t('my_submission'),
                children: <PersonIcon fontSize={upMD ? 'medium' : 'small'} />,
                onClick: () =>
                  setSearchObject(o => {
                    const filters = [...o.filters, `params.submitter:${safeFieldValue(currentUser.username)}`];
                    return { ...o, filters };
                  })
              },
              {
                tooltipTitle: t('completed_submissions'),
                children: <AssignmentTurnedInIcon fontSize={upMD ? 'medium' : 'small'} />,
                onClick: () => setSearchObject(o => ({ ...o, filters: [...o.filters, 'state:completed'] }))
              },
              {
                tooltipTitle: t('malicious_submissions'),
                children: <BugReportOutlinedIcon fontSize={upMD ? 'medium' : 'small'} />,
                onClick: () => setSearchObject(o => ({ ...o, filters: [...o.filters, 'max_score:>=1000'] }))
              }
            ]}
          />
        </div>
      </PageHeader>

      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        <SubmissionsTable submissionResults={submissionResults} />
      </div>
    </PageFullWidth>
  ) : (
    <ForbiddenPage />
  );
};

const WrappedSubmission = () => (
  <SearchParamsProvider defaultValue={SUBMISSION_PARAMS} hidden={['rows', 'offset']} enforced={['rows']}>
    <SubmissionPage />
  </SearchParamsProvider>
);

export const Submission = React.memo(WrappedSubmission);
export default Submission;
