import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import { AlertTitle, Skeleton, Tooltip } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import { useAppNavigate } from 'core/router';
import { useAppSearchParams } from 'core/routes';
import useALContext from 'deprecated/hooks/useALContext';
import type { SearchResult } from 'models/api/search';
import type { SubmissionIndexed } from 'models/base/submission';
import React from 'react';
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

type Props = {
  submissionResults: SearchResult<SubmissionIndexed>;
  allowSort?: boolean;
};

const WrappedSubmissionsTable: React.FC<Props> = ({ submissionResults, allowSort = true }) => {
  const { t } = useTranslation(['search']);
  const { c12nDef } = useALContext();

  const hasSearch = useAppSearchParams('/submissions', s => Boolean(s));

  const navigate = useAppNavigate<'/submissions'>();

  return submissionResults ? (
    !!submissionResults?.total ? (
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
              <LinkRow<'/submissions'>
                key={`${submission.id}-${id}`}
                to={{
                  openRoute:
                    submission.state === 'completed'
                      ? { path: '/submission/:id', params: { id: submission.id } }
                      : { path: '/submission/detail/:id', params: { id: submission.id } }
                }}
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
                  {!hasSearch ? (
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
                        navigate.replaceSearchObject(s => ({
                          ...s,
                          offset: 0,
                          filters: [...s.filters, `params.submitter:"${submission.params.submitter}"`]
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
    ) : (
      <div style={{ width: '100%' }}>
        <InformativeAlert>
          <AlertTitle>{t('no_submissions_title')}</AlertTitle>
          {t('no_results_desc')}
        </InformativeAlert>
      </div>
    )
  ) : (
    <Skeleton variant="rectangular" style={{ height: '6rem', borderRadius: '4px' }} />
  );
};

const SubmissionsTable = React.memo(WrappedSubmissionsTable);
export default SubmissionsTable;
