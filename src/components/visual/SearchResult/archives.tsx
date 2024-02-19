import FileOpenIcon from '@mui/icons-material/FileOpen';
import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import { AlertTitle, IconButton, Skeleton, Tooltip, useTheme } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import useALContext from 'components/hooks/useALContext';
import { CustomUser } from 'components/hooks/useMyUser';
import type { FileIndexed, LabelCategories } from 'components/models/base/file';
import type { SearchResult } from 'components/models/ui/search';
import Classification from 'components/visual/Classification';
import CustomChip from 'components/visual/CustomChip';
import {
  DivTable,
  DivTableBody,
  DivTableCell,
  DivTableHead,
  DivTableRow,
  LinkRow,
  SortableHeaderCell
} from 'components/visual/DivTable';
import FileDownloader from 'components/visual/FileDownloader';
import InformativeAlert from 'components/visual/InformativeAlert';
import 'moment/locale/fr';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';

const LABELS_COLOR_MAP = {
  info: 'default',
  technique: 'secondary',
  attribution: 'primary'
} as const;

type Props = {
  fileResults: SearchResult<FileIndexed>;
  allowSort?: boolean;
  setFileID?: (id: string) => void;
  onLabelClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, label: string) => void;
};

const WrappedArchivesTable: React.FC<Props> = ({
  fileResults,
  allowSort = true,
  setFileID = null,
  onLabelClick = null
}) => {
  const { t, i18n } = useTranslation(['archive']);
  const theme = useTheme();
  const { user: currentUser } = useAppUser<CustomUser>();
  const { c12nDef } = useALContext();

  const hasSupplementary = useMemo<boolean>(
    () => fileResults && fileResults?.total > 0 && fileResults?.items.some(item => item.is_supplementary),
    [fileResults]
  );

  return fileResults ? (
    fileResults.total !== 0 ? (
      <TableContainer component={Paper}>
        <DivTable>
          <DivTableHead>
            <DivTableRow>
              {hasSupplementary && <DivTableCell />}
              <SortableHeaderCell children={t('header.seen.last')} sortField="seen.last" allowSort={allowSort} />
              <SortableHeaderCell children={t('header.sha256')} sortField="sha256" allowSort={allowSort} inverted />
              <SortableHeaderCell children={t('header.type')} sortField="type" allowSort={allowSort} inverted />
              <SortableHeaderCell children={t('header.labels')} sortField="labels" allowSort={allowSort} inverted />
              {c12nDef.enforce && (
                <SortableHeaderCell sortField="classification" allowSort={allowSort} inverted>
                  {t('header.classification')}
                </SortableHeaderCell>
              )}
              <DivTableCell />
            </DivTableRow>
          </DivTableHead>
          <DivTableBody>
            {fileResults.items.map((file, i) => (
              <LinkRow
                key={`${file.sha256}-${i}`}
                component={Link}
                to={`/archive/${file.sha256}`}
                onClick={event => {
                  if (setFileID) {
                    event.preventDefault();
                    setFileID(file.sha256);
                  }
                }}
                hover
                style={{ textDecoration: 'none' }}
              >
                {hasSupplementary && (
                  <DivTableCell style={{ textAlign: 'center' }}>
                    {file?.is_supplementary && (
                      <Tooltip title={t('tooltip.is_supplementary')}>
                        <span>
                          <FileOpenIcon fontSize={theme.breakpoints.down('md') ? 'small' : 'medium'} />
                        </span>
                      </Tooltip>
                    )}
                  </DivTableCell>
                )}
                <DivTableCell>
                  <Tooltip title={file.seen.last}>
                    <span>
                      <Moment fromNow locale={i18n.language} children={file.seen.last} />
                    </span>
                  </Tooltip>
                </DivTableCell>
                <DivTableCell>
                  {file?.type?.startsWith('uri/') && (
                    <div
                      style={{
                        wordBreak: 'break-word'
                        // width: upLG ? '100%' : '10vw',
                      }}
                    >
                      {file?.uri_info?.uri}
                    </div>
                  )}
                  <div
                    style={{
                      wordBreak: 'break-word',
                      // width: upLG ? '100%' : '10vw',
                      ...(file?.type?.startsWith('uri/') && {
                        fontSize: 'x-small',
                        color: theme.palette.text.disabled
                      })
                    }}
                  >
                    {file.sha256}
                  </div>
                </DivTableCell>
                <DivTableCell children={'type' in file ? file.type : null} />
                <DivTableCell
                  children={<LabelCell label_categories={file?.label_categories} onLabelClick={onLabelClick} />}
                />
                {c12nDef.enforce && (
                  <DivTableCell>
                    <Classification type="text" size="tiny" c12n={file.classification} format="short" />
                  </DivTableCell>
                )}
                <DivTableCell
                  style={{
                    padding: 'unset',
                    textAlign: 'center',
                    paddingLeft: theme.spacing(1),
                    paddingRight: theme.spacing(1)
                  }}
                >
                  {currentUser.roles.includes('file_download') && 'sha256' in file && (
                    <Tooltip title={t('tooltip.download')}>
                      <span>
                        <FileDownloader
                          icon={<GetAppOutlinedIcon fontSize="small" />}
                          link={`/api/v4/file/download/${file.sha256}/?`}
                          size="small"
                          onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                        />
                      </span>
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
          <AlertTitle>{t('no_errors_title')}</AlertTitle>
          {t('no_results_desc')}
        </InformativeAlert>
      </div>
    )
  ) : (
    <Skeleton variant="rectangular" style={{ height: '6rem', borderRadius: '4px' }} />
  );
};

type LabelCellProps = {
  label_categories?: LabelCategories;
  onLabelClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, label: string) => void;
};

const WrappedLabelCell = ({ label_categories = null, onLabelClick = null }: LabelCellProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [showMore, setShowMore] = useState<boolean>(false);

  const labels = useMemo(
    () =>
      label_categories &&
      ['attribution', 'technique', 'info'].flatMap(
        category =>
          category in label_categories &&
          label_categories[category]
            .sort((a: string, b: string) => a.valueOf().localeCompare(b.valueOf()))
            .map(label => ({ category, label }))
      ),
    [label_categories]
  );

  return (
    <div style={{ display: 'flex', gap: theme.spacing(1), flexWrap: 'wrap' }}>
      {labels?.length > 0 && (
        <>
          {labels
            .filter((_, j) => (showMore ? true : j < 5))
            .map(({ category, label }, j) => (
              <CustomChip
                key={`${j}`}
                wrap
                variant="outlined"
                size="tiny"
                type="rounded"
                color={category in LABELS_COLOR_MAP ? LABELS_COLOR_MAP[category] : 'primary'}
                label={label}
                style={{ height: 'auto', minHeight: '20px' }}
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
          {!showMore && labels?.length > 5 && (
            <Tooltip title={t('more')}>
              <IconButton
                size="small"
                onClick={event => {
                  event.preventDefault();
                  event.stopPropagation();
                  setShowMore(true);
                }}
                style={{ padding: 0 }}
              >
                <MoreHorizOutlinedIcon />
              </IconButton>
            </Tooltip>
          )}
        </>
      )}
    </div>
  );
};

const LabelCell = React.memo(WrappedLabelCell);

const ArchivesTable = React.memo(WrappedArchivesTable);
export default ArchivesTable;
