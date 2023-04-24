import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import { AlertTitle, Chip, Paper, Skeleton, TableContainer, Tooltip, Typography, useTheme } from '@mui/material';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import { CustomUser } from 'components/hooks/useMyUser';
import FileDownloader from 'components/visual//FileDownloader';
import {
  GridTable,
  GridTableBody,
  GridTableCell,
  GridTableHead,
  GridTableHeader,
  GridTableRow
} from 'components/visual/GridTable';
import InformativeAlert from 'components/visual/InformativeAlert';
import 'moment/locale/fr';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';

export type ArchivedFileResult = {
  archive_ts: string;
  ascii: string;
  classification: string;
  entropy: number;
  expiry_ts: string | null;
  hex: string;
  id: string;
  labels: string[];
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
  type: string;
};

type SearchResults = {
  items: ArchivedFileResult[];
  rows: number;
  offset: number;
  total: number;
};

type ArchivesTable2Props = {
  fileResults: SearchResults;
  allowSort?: boolean;
  setFileID?: (id: string) => void;
  onLabelClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, label: string) => void;
};

const WrappedArchivesTable2 = ({
  fileResults,
  allowSort = true,
  setFileID = null,
  onLabelClick = null
}: ArchivesTable2Props) => {
  const { t, i18n } = useTranslation(['archive']);
  const theme = useTheme();
  const { user: currentUser } = useAppUser<CustomUser>();

  return fileResults ? (
    fileResults.total !== 0 ? (
      <TableContainer component={Paper}>
        <GridTable nbOfColumns={5}>
          <GridTableHead>
            <GridTableRow>
              <GridTableHeader children={t('header.seen.last')} sortField="seen.last" allowSort invertedSort />
              <GridTableHeader children={t('header.sha256')} sortField="sha256" allowSort />
              <GridTableHeader children={t('header.type')} sortField="type" allowSort />
              <GridTableHeader children={t('header.labels')} />
              <GridTableHeader children={null} />
            </GridTableRow>
          </GridTableHead>
          <GridTableBody>
            {fileResults.items.map((file, i) => (
              <GridTableRow
                key={`${file.id}-${i}-2`}
                to={`/file/detail/${file.id}`}
                link
                hover
                onClick={event => {
                  if (setFileID) {
                    event.preventDefault();
                    setFileID(file.id);
                  }
                }}
              >
                <GridTableCell
                  noWrap
                  children={
                    <Tooltip title={file.seen.last}>
                      <Typography
                        children={<Moment fromNow locale={i18n.language} children={file.seen.last} />}
                        variant="body2"
                        noWrap
                      />
                    </Tooltip>
                  }
                />
                <GridTableCell children={file.sha256} noWrap />
                <GridTableCell children={file.type} noWrap />
                <GridTableCell
                  children={
                    <div style={{ display: 'flex', gap: theme.spacing(1), flexWrap: 'wrap' }}>
                      {file.labels.map((label, j) => (
                        <Chip
                          key={`${file.id}-${label}-${j}`}
                          label={label}
                          color="success"
                          variant="outlined"
                          size="small"
                          onClick={
                            !onLabelClick
                              ? null
                              : event => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  onLabelClick(event, label);
                                }
                          }
                        />
                      ))}
                    </div>
                  }
                />
                <GridTableCell
                  style={{ justifyContent: 'right', padding: `0px ${theme.spacing(1)} 0px` }}
                  children={
                    currentUser.roles.includes('file_download') &&
                    'sha256' in file && (
                      <FileDownloader
                        icon={<GetAppOutlinedIcon fontSize="small" />}
                        link={`/api/v4/file/download/${file.sha256}/?`}
                        size="small"
                        onClick={e => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                      />
                    )
                  }
                />
              </GridTableRow>
            ))}
          </GridTableBody>
        </GridTable>
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

export const ArchivesTable2 = React.memo(WrappedArchivesTable2);
export default ArchivesTable2;
