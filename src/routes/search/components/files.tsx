import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import { AlertTitle, Skeleton, Tooltip } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import useALContext from 'deprecated/hooks/useALContext';
import type { SearchResult } from 'models/api/search';
import type { FileIndexed } from 'models/base/file';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
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

export type FilesTableProps = {
  fileResults: SearchResult<FileIndexed>;
  allowSort?: boolean;
  onRowClick?: (event: React.MouseEvent<HTMLElement>, file: FileIndexed) => void;
};

export const FilesTable = memo(({ fileResults, allowSort = true, onRowClick = () => null }: FilesTableProps) => {
  const { t } = useTranslation(['search']);
  const { c12nDef } = useALContext();

  return !fileResults ? (
    <Skeleton variant="rectangular" sx={{ height: '6rem', borderRadius: '4px' }} />
  ) : !fileResults?.total ? (
    <div style={{ width: '100%' }}>
      <InformativeAlert>
        <AlertTitle>{t('no_files_title')}</AlertTitle>
        {t('no_results_desc')}
      </InformativeAlert>
    </div>
  ) : (
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
              key={`${file.id}-${id}`}
              nav={nav => nav.to().create({ route: '/file/detail/:id', path: { id: file.sha256 } })}
              navDeps={[file.sha256]}
              onClick={event => onRowClick(event, file)}
              hover
              style={{ textDecoration: 'none' }}
            >
              <DivTableCell>
                <Tooltip title={file.seen.last}>
                  <div>
                    <Moment variant="fromNow">{file.seen.last}</Moment>
                  </div>
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
  );
});
