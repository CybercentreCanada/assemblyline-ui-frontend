import Paper from '@material-ui/core/Paper';
import TableContainer from '@material-ui/core/TableContainer';
import { AlertTitle, Skeleton } from '@material-ui/lab';
import useALContext from 'components/hooks/useALContext';
import Classification from 'components/visual/Classification';
import 'moment/locale/fr';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import { DivTable, DivTableBody, DivTableCell, DivTableHead, DivTableRow, LinkRow } from '../DivTable';
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
              <DivTableCell>{t('header.created')}</DivTableCell>
              <DivTableCell>{t('header.lasttimeseen')}</DivTableCell>
              <DivTableCell>{t('header.name')}</DivTableCell>
              <DivTableCell>{t('header.priority')}</DivTableCell>
              <DivTableCell>{t('header.status')}</DivTableCell>
              <DivTableCell>{t('header.hit_count')}</DivTableCell>
              {c12nDef.enforce && <DivTableCell>{t('header.classification')}</DivTableCell>}
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
                <DivTableCell>
                  <Moment fromNow locale={i18n.language}>
                    {workflow.creation_date}
                  </Moment>
                </DivTableCell>
                <DivTableCell>
                  {workflow.last_seen && (
                    <Moment fromNow locale={i18n.language}>
                      {workflow.last_seen}
                    </Moment>
                  )}
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
    <Skeleton variant="rect" style={{ height: '6rem', borderRadius: '4px' }} />
  );
};

const WorflowTable = React.memo(WrappedWorflowTable);
export default WorflowTable;
