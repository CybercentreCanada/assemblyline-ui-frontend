import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import { AlertTitle, Skeleton, Tooltip, useTheme } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import { CustomUser } from 'components/hooks/useMyUser';
import {
  DivTable,
  DivTableBody,
  DivTableCell,
  DivTableHead,
  DivTableRow,
  LinkRow,
  SortableHeaderCell
} from 'components/visual/DivTable';
import 'moment/locale/fr';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import FileDownloader from '../FileDownloader';
import InformativeAlert from '../InformativeAlert';

export type ArchivedFileResult = {
  archive_ts: string;
  ascii: string;
  classification: string;
  entropy: number;
  expiry_ts: string | null;
  hex: string;
  id: string;
  magic: string;
  md5: string;
  mime: string;
  seen: {
    count: number;
    first: string;
    last: string;
  };
  sha1: string;
  sha256: string;
  size: number;
  ssdeep: string;
  tags: string[];
  type: string;
};

type SearchResults = {
  items: ArchivedFileResult[];
  rows: number;
  offset: number;
  total: number;
};

type ArchivesTableProps = {
  fileResults: SearchResults;
  setErrorKey?: (key: string) => void;
  allowSort?: boolean;
};

const WrappedArchivesTable: React.FC<ArchivesTableProps> = ({ fileResults, setErrorKey = null, allowSort = true }) => {
  const { t, i18n } = useTranslation(['archive']);
  const theme = useTheme();
  const { user: currentUser } = useAppUser<CustomUser>();

  return fileResults ? (
    fileResults.total !== 0 ? (
      <TableContainer component={Paper}>
        <DivTable size="small">
          <DivTableHead>
            <DivTableRow style={{ whiteSpace: 'nowrap' }}>
              <SortableHeaderCell children={t('header.seen.last')} sortField="seen.last" allowSort={allowSort} />
              <SortableHeaderCell children={t('header.sha256')} sortField="sha256" allowSort={allowSort} />
              <SortableHeaderCell children={t('header.type')} sortField="type" allowSort={allowSort} />
              <DivTableCell children={t('header.tags')} />
              <DivTableCell children={t('header.download')} style={{ textAlign: 'center' }} />
            </DivTableRow>
          </DivTableHead>
          <DivTableBody>
            {fileResults.items.map(file => (
              <LinkRow
                key={file.id}
                component={Link}
                to={`/file/detail/${file.id}`}
                onClick={event => {
                  if (setErrorKey) {
                    event.preventDefault();
                    setErrorKey(file.id);
                  }
                }}
                hover
              >
                <DivTableCell style={{ whiteSpace: 'nowrap' }}>
                  <Tooltip title={file.seen.last}>
                    <>
                      <Moment fromNow locale={i18n.language} children={file.seen.last} />
                    </>
                  </Tooltip>
                </DivTableCell>
                <DivTableCell children={'sha256' in file ? file.sha256 : null} style={{ whiteSpace: 'nowrap' }} />
                <DivTableCell children={'type' in file ? file.type : null} style={{ whiteSpace: 'nowrap' }} />
                <DivTableCell children={'tags' in file ? file.tags : null} style={{ whiteSpace: 'nowrap' }} />
                <DivTableCell style={{ padding: 'unset', textAlign: 'center' }}>
                  {currentUser.roles.includes('file_download') && 'sha256' in file && (
                    <FileDownloader
                      icon={<GetAppOutlinedIcon fontSize="small" />}
                      link={`/api/v4/file/download/${file.sha256}/?`}
                      size="small"
                      onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                    />
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
          <AlertTitle>{t('no_errors_title')}</AlertTitle>
          {t('no_results_desc')}
        </InformativeAlert>
      </div>
    )
  ) : (
    <Skeleton variant="rectangular" style={{ height: '6rem', borderRadius: '4px' }} />
  );
};

const ArchivesTable = React.memo(WrappedArchivesTable);
export default ArchivesTable;
