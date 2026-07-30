import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import { AlertTitle, Skeleton, Tooltip } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import { useAppConfig } from 'core/config';
import { useAppNavigate } from 'core/router';
import useALContext from 'deprecated/hooks/useALContext';
import type { SearchResult } from 'models/api/search';
import type { SubmissionIndexed } from 'models/base/submission';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { maxLenStr } from 'shared/utils/utils';
import Classification from 'ui/Classification';
import CustomChip from 'ui/CustomChip';
import {
  DivTable,
  DivTableBody,
  DivTableCell,
  DivTableHead,
  DivTableRow,
  LinkRow,
  SortableHeaderCell
} from 'ui/DivTable';
import InformativeAlert from 'ui/InformativeAlert';
import Moment from 'ui/Moment';
import SubmissionState from 'ui/SubmissionState';
import Verdict from 'ui/Verdict';

export type SubmissionsTableProps = {
  submissionResults: SearchResult<SubmissionIndexed>;
  allowSort?: boolean;
  ignoreFilters?: boolean;
  onRowClick?: (event: React.MouseEvent<HTMLElement>, submission: SubmissionIndexed) => void;
};

export const SubmissionsTable = memo(
  ({ submissionResults, allowSort = true, ignoreFilters = false, onRowClick = () => null }: SubmissionsTableProps) => {
    const { t } = useTranslation(['search']);
    const { c12nDef } = useALContext();

    const navigate = useAppNavigate<'/submissions'>();
    const submissionView = useAppConfig(s => s.settings.submission_view);

    return !submissionResults ? (
      <Skeleton variant="rectangular" sx={{ height: '6rem', borderRadius: '4px' }} />
    ) : !submissionResults?.total ? (
      <div style={{ width: '100%' }}>
        <InformativeAlert>
          <AlertTitle>{t('no_submissions_title')}</AlertTitle>
          {t('no_results_desc')}
        </InformativeAlert>
      </div>
    ) : (
      <TableContainer component={Paper}>
        <DivTable>
          <DivTableHead>
            <DivTableRow>
              <SortableHeaderCell sortField="times.submitted" allowSort={allowSort}>
                {t('header.starttime')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="max_score" allowSort={allowSort}>
                {t('header.verdict')}
              </SortableHeaderCell>
              <DivTableCell>{t('header.description')}</DivTableCell>
              <SortableHeaderCell sortField="params.submitter" allowSort={allowSort}>
                {t('header.user')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="file_count" allowSort={allowSort}>
                {t('header.numfiles')}
              </SortableHeaderCell>
              {c12nDef && c12nDef.enforce && (
                <SortableHeaderCell sortField="classification" allowSort={allowSort}>
                  {t('header.classification')}
                </SortableHeaderCell>
              )}
              <SortableHeaderCell sortField="error_count" allowSort={allowSort}>
                {t('header.status')}
              </SortableHeaderCell>
              <DivTableCell />
            </DivTableRow>
          </DivTableHead>
          <DivTableBody>
            {submissionResults.items.map((submission, id) => (
              <LinkRow
                key={`${submission.id}-${id}`}
                nav={nav =>
                  nav.to().create({
                    route:
                      submission.state !== 'completed' || submissionView !== 'report'
                        ? '/submission/detail/:id'
                        : '/submission/report/:id',
                    path: { id: submission.id }
                  })
                }
                navDeps={[submission.state, submissionView, submission.id]}
                onClick={event => onRowClick(event, submission)}
                hover
                style={{ textDecoration: 'none' }}
              >
                <DivTableCell>
                  <Tooltip title={submission.times.submitted}>
                    <div>
                      <Moment variant="fromNow">{submission.times.submitted}</Moment>
                    </div>
                  </Tooltip>
                </DivTableCell>
                <DivTableCell>
                  <Verdict score={submission.max_score} fullWidth />
                </DivTableCell>
                <DivTableCell breakable>{maxLenStr(submission.params.description, 150)}</DivTableCell>
                <DivTableCell style={{ whiteSpace: 'nowrap' }}>
                  {ignoreFilters ? (
                    submission.params.submitter
                  ) : (
                    <CustomChip
                      label={submission.params.submitter}
                      variant="outlined"
                      size="small"
                      type="rounded"
                      onClick={event => {
                        event.preventDefault();
                        event.stopPropagation();
                        navigate.here().update(s => ({
                          ...s,
                          search: {
                            ...s.search,
                            offset: 0,
                            filters: [...s.search.filters, `params.submitter:"${submission.params.submitter}"`]
                          }
                        }));
                      }}
                    />
                  )}
                </DivTableCell>
                <DivTableCell>{submission.file_count}</DivTableCell>
                {c12nDef && c12nDef.enforce && (
                  <DivTableCell>
                    <Classification type="text" size="tiny" c12n={submission.classification} format="short" />
                  </DivTableCell>
                )}
                <DivTableCell style={{ textAlign: 'center' }}>
                  <SubmissionState state={submission.state} error_count={submission.error_count} />
                </DivTableCell>
                <DivTableCell style={{ textAlign: 'center' }}>
                  {submission.from_archive && (
                    <Tooltip title={t('archive')}>
                      <ArchiveOutlinedIcon />
                    </Tooltip>
                  )}
                </DivTableCell>
              </LinkRow>
            ))}
          </DivTableBody>
        </DivTable>
      </TableContainer>
    );
  }
);
