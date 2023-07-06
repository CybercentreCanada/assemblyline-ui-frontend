import ClearIcon from '@mui/icons-material/Clear';
import DoneIcon from '@mui/icons-material/Done';
import UpdateIcon from '@mui/icons-material/Update';
import { AlertTitle, Skeleton, Tooltip } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import useALContext from 'components/hooks/useALContext';
import { RetrohuntResult } from 'components/routes/retrohunt';
import Classification from 'components/visual/Classification';
import 'moment/locale/fr';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
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

type SearchResults = {
  items: RetrohuntResult[];
  total: number;
};

type RetrohuntStatusProp = {
  result: RetrohuntResult;
};

type RetrohuntTableProps = {
  retrohuntResults: SearchResults;
  allowSort?: boolean;
  onRowClick?: (retrohunt: RetrohuntResult) => void;
};

const STATE_ICON_MAP = {
  completed: <DoneIcon color="primary" />,
  error: <ClearIcon color="error" />,
  submitted: <UpdateIcon color="action" />
};

const WrappedRetrohuntTable: React.FC<RetrohuntTableProps> = ({
  retrohuntResults,
  allowSort = true,
  onRowClick = null
}) => {
  const { t, i18n } = useTranslation(['search']);
  const { c12nDef } = useALContext();

  const RetrohuntStatus = useCallback(
    ({ result }: RetrohuntStatusProp) => {
      const status = (
        result ? (result?.finished ? (result?.truncated ? 'error' : 'completed') : 'submitted') : null
      ) as keyof typeof STATE_ICON_MAP;

      if (status) return <Tooltip title={t(`status.${status}`)}>{STATE_ICON_MAP[status]}</Tooltip>;
      else return null;
    },
    [t]
  );

  return retrohuntResults ? (
    retrohuntResults.total !== 0 ? (
      <TableContainer component={Paper}>
        <DivTable>
          <DivTableHead>
            <DivTableRow>
              <SortableHeaderCell children={t('header.created')} sortField="created" allowSort={allowSort} />
              <SortableHeaderCell children={t('header.description')} sortField="code" allowSort={allowSort} />
              <SortableHeaderCell children={t('header.creator')} sortField="creator" allowSort={allowSort} />
              {c12nDef.enforce && (
                <SortableHeaderCell
                  children={t('header.classification')}
                  sortField="classification"
                  allowSort={allowSort}
                />
              )}
              <SortableHeaderCell children={t('header.numfiles')} sortField="total_hits" allowSort={allowSort} />
              <SortableHeaderCell children={t('header.status')} sortField="finished" allowSort={allowSort} />
            </DivTableRow>
          </DivTableHead>
          <DivTableBody>
            {retrohuntResults.items.map((retrohunt, id) => (
              <LinkRow
                key={id}
                component={Link}
                to={`/retrohunt/${retrohunt.code}`}
                onClick={event => {
                  if (!onRowClick) return;
                  event.preventDefault();
                  onRowClick(retrohunt);
                }}
                hover
                style={{ textDecoration: 'none' }}
              >
                <DivTableCell style={{ whiteSpace: 'nowrap' }}>
                  <Tooltip title={retrohunt.created}>
                    <>
                      <Moment fromNow locale={i18n.language}>
                        {retrohunt?.created}
                      </Moment>
                    </>
                  </Tooltip>
                </DivTableCell>
                <DivTableCell
                  style={{
                    maxWidth: '25vw',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {retrohunt.description}
                </DivTableCell>
                <DivTableCell>{retrohunt.creator}</DivTableCell>
                {c12nDef.enforce && (
                  <DivTableCell>
                    <Classification type="text" size="tiny" c12n={retrohunt.classification} format="short" />
                  </DivTableCell>
                )}
                <DivTableCell>{retrohunt.total_hits}</DivTableCell>
                <DivTableCell>
                  <RetrohuntStatus result={retrohunt} />
                </DivTableCell>
              </LinkRow>
            ))}
          </DivTableBody>
        </DivTable>
      </TableContainer>
    ) : (
      <div style={{ width: '100%' }}>
        <InformativeAlert>
          <AlertTitle>{t('no_retrohunt_title')}</AlertTitle>
          {t('no_results_desc')}
        </InformativeAlert>
      </div>
    )
  ) : (
    <Skeleton variant="rectangular" style={{ height: '6rem', borderRadius: '4px' }} />
  );
};

const RetrohuntTable = React.memo(WrappedRetrohuntTable);
export default RetrohuntTable;
