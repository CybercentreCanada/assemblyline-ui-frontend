import { Tooltip } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import { AlertTitle, Skeleton } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import Classification from 'components/visual/Classification';
import 'moment/locale/fr';
import React from 'react';
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

export type FileResult = {
  classification: string;
  entropy: number;
  from_archive: boolean;
  id: string;
  md5: string;
  seen: {
    count: number;
    first: string;
    last: string;
  };
  sha1: string;
  sha256: string;
  size: number;
  type: string;
};

type SearchResults = {
  items: FileResult[];
  total: number;
};

type FilesTableProps = {
  fileResults: SearchResults;
  allowSort?: boolean;
};

const WrappedFilesTable: React.FC<FilesTableProps> = ({ fileResults, allowSort = true }) => {
  const { t, i18n } = useTranslation(['search']);
  const { c12nDef } = useALContext();

  return fileResults ? (
    fileResults.total !== 0 ? (
      <TableContainer component={Paper}>
        <DivTable>
          <DivTableHead>
            <DivTableRow>
              <SortableHeaderCell sortField="seen.last" allowSort={allowSort}>
                {t('header.lasttimeseen')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="seen.count" allowSort={allowSort}>
                {t('header.count')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="sha256" allowSort={allowSort}>
                {t('header.sha256')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="type" allowSort={allowSort}>
                {t('header.filetype')}
              </SortableHeaderCell>
              <SortableHeaderCell sortField="size" allowSort={allowSort}>
                {t('header.size')}
              </SortableHeaderCell>
              {c12nDef.enforce && (
                <SortableHeaderCell sortField="classification" allowSort={allowSort}>
                  {t('header.classification')}
                </SortableHeaderCell>
              )}
              <DivTableCell />
            </DivTableRow>
          </DivTableHead>
          <DivTableBody>
            {fileResults.items.map((file, id) => (
              <LinkRow
                key={id}
                component={Link}
                to={`/file/detail/${file.sha256}`}
                hover
                style={{ textDecoration: 'none' }}
              >
                <DivTableCell>
                  <Tooltip title={file.seen.last}>
                    <Moment fromNow locale={i18n.language}>
                      {file.seen.last}
                    </Moment>
                  </Tooltip>
                </DivTableCell>
                <DivTableCell>{file.seen.count}</DivTableCell>
                <DivTableCell breakable>{file.sha256}</DivTableCell>
                <DivTableCell>{file.type}</DivTableCell>
                <DivTableCell>{file.size}</DivTableCell>
                {c12nDef.enforce && (
                  <DivTableCell>
                    <Classification type="text" size="tiny" c12n={file.classification} format="short" />
                  </DivTableCell>
                )}
                <DivTableCell style={{ textAlign: 'center' }}>
                  {file.from_archive && (
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
          <AlertTitle>{t('no_files_title')}</AlertTitle>
          {t('no_results_desc')}
        </InformativeAlert>
      </div>
    )
  ) : (
    <Skeleton variant="rectangular" style={{ height: '6rem', borderRadius: '4px' }} />
  );
};

const FilesTable = React.memo(WrappedFilesTable);
export default FilesTable;
