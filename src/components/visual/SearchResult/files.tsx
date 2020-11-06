import { Tooltip } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import TableContainer from '@material-ui/core/TableContainer';
import { AlertTitle, Skeleton } from '@material-ui/lab';
import Classification from 'components/visual/Classification';
import 'moment/locale/fr';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import { DivTable, DivTableBody, DivTableCell, DivTableHead, DivTableRow, LinkRow } from '../DivTable';
import InformativeAlert from '../InformativeAlert';

export type FileResult = {
  classification: string;
  entropy: number;
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
};

const WrappedFilesTable: React.FC<FilesTableProps> = ({ fileResults }) => {
  const { t, i18n } = useTranslation(['search']);

  return fileResults ? (
    fileResults.total !== 0 ? (
      <TableContainer component={Paper}>
        <DivTable>
          <DivTableHead>
            <DivTableRow>
              <DivTableCell>{t('header.lasttimeseen')}</DivTableCell>
              <DivTableCell>{t('header.count')}</DivTableCell>
              <DivTableCell>{t('header.sha256')}</DivTableCell>
              <DivTableCell>{t('header.filetype')}</DivTableCell>
              <DivTableCell>{t('header.size')}</DivTableCell>
              <DivTableCell>{t('header.classification')}</DivTableCell>
            </DivTableRow>
          </DivTableHead>
          <DivTableBody>
            {fileResults.items.map(file => (
              <LinkRow
                key={file.id}
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
                <DivTableCell style={{ wordBreak: 'break-word' }}>{file.sha256}</DivTableCell>
                <DivTableCell>{file.type}</DivTableCell>
                <DivTableCell>{file.size}</DivTableCell>
                <DivTableCell>
                  <Classification type="text" size="tiny" c12n={file.classification} format="short" />
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
    <Skeleton variant="rect" style={{ height: '6rem', borderRadius: '4px' }} />
  );
};

const FilesTable = React.memo(WrappedFilesTable);
export default FilesTable;
