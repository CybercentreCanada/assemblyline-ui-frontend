import ClearIcon from '@mui/icons-material/Clear';
import DoneIcon from '@mui/icons-material/Done';
import { AlertTitle, Skeleton } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import useALContext from 'deprecated/hooks/useALContext';
import type { SearchResult } from 'models/api/search';
import type { WorkflowIndexed } from 'models/base/workflow';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertPriority, AlertStatus } from 'routes/alerts/components/Components';
import Classification from 'ui/Classification';
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

export type WorkflowTableProps = {
  workflowResults: SearchResult<WorkflowIndexed>;
  allowSort?: boolean;
  onRowClick?: (event: React.MouseEvent<HTMLElement>, workflow: WorkflowIndexed) => void;
};

export const WorkflowTable = memo(
  ({ workflowResults, allowSort = true, onRowClick = () => null }: WorkflowTableProps) => {
    const { t } = useTranslation(['search']);
    const { c12nDef } = useALContext();

    return !workflowResults ? (
      <Skeleton variant="rectangular" sx={{ height: '6rem', borderRadius: '4px' }} />
    ) : !workflowResults?.total ? (
      <div style={{ width: '100%' }}>
        <InformativeAlert>
          <AlertTitle>{t('no_workflows_title')}</AlertTitle>
          {t('no_results_desc')}
        </InformativeAlert>
      </div>
    ) : (
      <TableContainer component={Paper}>
        <DivTable>
          <DivTableHead>
            <DivTableRow>
              <SortableHeaderCell sortField="creation_date" allowSort={allowSort}>
                {t('header.created')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="last_seen" allowSort={allowSort}>
                {t('header.lasttimeseen')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="name" allowSort={allowSort}>
                {t('header.name')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="priority" allowSort={allowSort}>
                {t('header.priority')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="status" allowSort={allowSort}>
                {t('header.status')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="hit_count" allowSort={allowSort}>
                {t('header.hit_count')}
              </SortableHeaderCell>
              {c12nDef.enforce && (
                <SortableHeaderCell sortField="classification" allowSort={allowSort}>
                  {t('header.classification')}
                </SortableHeaderCell>
              )}
              <SortableHeaderCell sortField="enabled" allowSort={allowSort}>
                {t('header.enabled')}
              </SortableHeaderCell>
            </DivTableRow>
          </DivTableHead>
          <DivTableBody>
            {workflowResults.items.map((workflow, i) => (
              <LinkRow
                key={`${workflow.workflow_id}-${i}`}
                nav={nav =>
                  nav.to().create({ route: '/manage/workflow/detail/:id', path: { id: workflow.workflow_id } })
                }
                navDeps={[workflow.workflow_id]}
                onClick={event => onRowClick(event, workflow)}
                hover
              >
                <DivTableCell>
                  <Moment variant="fromNow">{workflow.creation_date}</Moment>
                </DivTableCell>
                <DivTableCell>
                  {workflow.last_seen && <Moment variant="fromNow">{workflow.last_seen}</Moment>}
                </DivTableCell>
                <DivTableCell>{workflow.name}</DivTableCell>
                <DivTableCell>
                  <AlertPriority name={workflow.priority} withChip />
                </DivTableCell>
                <DivTableCell>
                  <AlertStatus name={workflow.status} />
                </DivTableCell>
                <DivTableCell>{workflow.hit_count}</DivTableCell>
                {c12nDef.enforce && (
                  <DivTableCell>
                    <Classification type="text" size="tiny" c12n={workflow.classification} format="short" />
                  </DivTableCell>
                )}
                <DivTableCell>
                  {workflow && (workflow.enabled || workflow.enabled === undefined) ? (
                    // By default, workflows were always enabled
                    <DoneIcon color="primary" />
                  ) : (
                    <ClearIcon color="error" />
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
