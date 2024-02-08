import { AlertTitle, Skeleton } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import useALContext from 'components/hooks/useALContext';
import Classification from 'components/visual/Classification';
import moment from 'moment';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  DivTable,
  DivTableBody,
  DivTableCell,
  DivTableHead,
  DivTableRow,
  LinkRow,
  SortableHeaderCell
} from '../DivTable';
import InformativeAlert from '../InformativeAlert';

export type WorkflowResult = {
  classification: string;
  creation_date: string;
  creator: string;
  edited_by: string;
  hit_count: string;
  id: string;
  last_edit: string;
  last_seen: string;
  name: string;
  priority: string;
  query: string;
  status: string;
  workflow_id: string;
};

type SearchResults = {
  items: WorkflowResult[];
  rows: number;
  offset: number;
  total: number;
};

type WorkflowTableProps = {
  workflowResults: SearchResults;
  setWorkflowID?: (id: string) => void;
};

const WrappedWorflowTable: React.FC<WorkflowTableProps> = ({ workflowResults, setWorkflowID = null }) => {
  const { t, i18n } = useTranslation(['search']);
  const { c12nDef } = useALContext();

  return workflowResults ? (
    workflowResults.total !== 0 ? (
      <TableContainer component={Paper}>
        <DivTable>
          <DivTableHead>
            <DivTableRow>
              <SortableHeaderCell sortField="creation_date">{t('header.created')}</SortableHeaderCell>
              <SortableHeaderCell sortField="last_seen">{t('header.lasttimeseen')}</SortableHeaderCell>
              <SortableHeaderCell sortField="name">{t('header.name')}</SortableHeaderCell>
              <SortableHeaderCell sortField="priority">{t('header.priority')}</SortableHeaderCell>
              <SortableHeaderCell sortField="status">{t('header.status')}</SortableHeaderCell>
              <SortableHeaderCell sortField="hit_count">{t('header.hit_count')}</SortableHeaderCell>
              {c12nDef.enforce && (
                <SortableHeaderCell sortField="classification">{t('header.classification')}</SortableHeaderCell>
              )}
            </DivTableRow>
          </DivTableHead>
          <DivTableBody>
            {workflowResults.items.map(workflow => (
              <LinkRow
                key={workflow.workflow_id}
                component={Link}
                to={`/manage/workflow/${workflow.workflow_id}`}
                onClick={event => {
                  if (setWorkflowID) {
                    event.preventDefault();
                    setWorkflowID(workflow.workflow_id);
                  }
                }}
                hover
              >
                <DivTableCell>{moment(workflow.creation_date).locale(i18n.language).fromNow()}</DivTableCell>
                <DivTableCell>
                  {workflow.last_seen && moment(workflow.last_seen).locale(i18n.language).fromNow()}
                </DivTableCell>
                <DivTableCell>{workflow.name}</DivTableCell>
                <DivTableCell>{workflow.priority}</DivTableCell>
                <DivTableCell>{workflow.status}</DivTableCell>
                <DivTableCell>{workflow.hit_count}</DivTableCell>
                {c12nDef.enforce && (
                  <DivTableCell>
                    <Classification type="text" size="tiny" c12n={workflow.classification} format="short" />
                  </DivTableCell>
                )}
              </LinkRow>
            ))}
          </DivTableBody>
        </DivTable>
      </TableContainer>
    ) : (
      <div style={{ width: '100%' }}>
        <InformativeAlert>
          <AlertTitle>{t('no_workflows_title')}</AlertTitle>
          {t('no_results_desc')}
        </InformativeAlert>
      </div>
    )
  ) : (
    <Skeleton variant="rectangular" style={{ height: '6rem', borderRadius: '4px' }} />
  );
};

const WorflowTable = React.memo(WrappedWorflowTable);
export default WorflowTable;
