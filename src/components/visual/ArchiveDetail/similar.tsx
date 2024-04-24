import ArchiveIcon from '@mui/icons-material/Archive';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { AlertTitle, IconButton, Skeleton, TableContainer, Tooltip, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { File } from 'components/routes/archive/detail';
import {
  GridLinkRow,
  GridTable,
  GridTableBody,
  GridTableCell,
  GridTableHead,
  GridTableRow,
  StyledPaper
} from 'components/visual/GridTable';
import InformativeAlert from 'components/visual/InformativeAlert';
import Moment from 'components/visual/Moment';
import SectionContainer from 'components/visual/SectionContainer';
import { safeFieldValueURI } from 'helpers/utils';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  container: {
    width: '100%',
    padding: theme.spacing(1)
  },
  caption: {
    display: 'grid',
    gridTemplateRows: 'repeat(2, 1fr)',
    gridTemplateColumns: '1fr auto',
    marginBottom: theme.spacing(1),
    borderRadius: '4px 4px 0px 0px',
    '&>div': {
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  },
  muted: {
    color: theme.palette.text.secondary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  }
}));

const DEFAULT_SIMILAR = {
  tlsh: { label: 'TLSH', prefix: '/search/file?query=tlsh:', suffix: '&use_archive=true' },
  ssdeep: { label: 'SSDEEP', prefix: '/search/file?query=ssdeep:', suffix: '~&use_archive=true' },
  vector: { label: 'Vector', prefix: '/search/result?query=result.sections.tags.vector:', suffix: '&use_archive=true' }
};

type Item = { from_archive: boolean; created?: string; sha256: string; type: string; seen?: { last: string } };

type Result = {
  items: Item[];
  total: number;
  type: string;
  value: string;
};

type SectionProps = {
  file: File;
  show?: boolean;
  title?: string;
  drawer?: boolean;
  nocollapse?: boolean;
};

type SimilarItemProps = {
  data: Result;
  drawer?: boolean;
};

const SimilarItem: React.FC<SimilarItemProps> = ({ data, drawer }) => {
  const { t, i18n } = useTranslation(['archive']);
  const theme = useTheme();
  const classes = useStyles();
  const hasArchived = data.items.some(item => item?.from_archive);
  return (
    <StyledPaper className={classes.container} paper={!drawer} variant="outlined">
      <div className={classes.caption}>
        <div>
          <b>{t(DEFAULT_SIMILAR[data.type].label)}</b>&nbsp;
          <small className={classes.muted}>{` :: ${data.value}`}</small>
        </div>
        <div style={{ gridRow: 'span 2' }}>
          <Tooltip title={t('search.tooltip')} placement="left">
            <IconButton
              component={Link}
              size="small"
              to={`${DEFAULT_SIMILAR[data.type].prefix}${safeFieldValueURI(data.value)}${
                DEFAULT_SIMILAR[data.type].suffix
              }`}
              onClick={e => e.stopPropagation()}
              style={{ margin: `0 ${theme.spacing(0.5)}` }}
            >
              <SearchOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
        <div>
          <small style={{ color: theme.palette.primary.main }}>
            {data.total}&nbsp;{t(`result${data.total === 1 ? '' : 's'}`)}
          </small>
        </div>
      </div>
      <TableContainer
        style={{
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: theme.spacing(0.5)
        }}
      >
        <GridTable
          columns={hasArchived ? 5 : 4}
          size="small"
          paper={drawer}
          style={{
            gridTemplateColumns: hasArchived
              ? `min-content minmax(auto, 1fr) minmax(auto, 3fr) minmax(auto, 1fr)`
              : `minmax(auto, 1fr) minmax(auto, 3fr) minmax(auto, 1fr)`
          }}
        >
          <GridTableHead>
            <GridTableRow>
              {hasArchived && <GridTableCell />}
              <GridTableCell children={t('header.seen.last')} />
              <GridTableCell children={t('header.sha256')} />
              <GridTableCell children={t('header.type')} />
            </GridTableRow>
          </GridTableHead>
          <GridTableBody alternating>
            {data.items.map((item, j) => (
              <GridLinkRow
                key={`${data.type}-${data.value}-${j}`}
                hover
                to={item?.from_archive ? `/archive/${item?.sha256}` : `/file/detail/${item?.sha256}`}
              >
                {hasArchived && (
                  <GridTableCell sx={{ '&.MuiTableCell-root>div': { justifyItems: 'flex-start' } }}>
                    {item?.from_archive && (
                      <Tooltip title={t('file.from_archive')} placement="right">
                        <span>
                          <IconButton size="small" disabled>
                            <ArchiveIcon fontSize="small" style={{ color: theme.palette.text.primary }} />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                  </GridTableCell>
                )}

                <GridTableCell>
                  <Tooltip title={item.created || item.seen.last}>
                    <span>
                      <Moment variant="fromNow">{item.created || item.seen.last}</Moment>
                    </span>
                  </Tooltip>
                </GridTableCell>

                <GridTableCell>{item?.sha256}</GridTableCell>

                <GridTableCell>{item?.type}</GridTableCell>
              </GridLinkRow>
            ))}
          </GridTableBody>
        </GridTable>
      </TableContainer>
    </StyledPaper>
  );
};

const WrappedSimilarSection: React.FC<SectionProps> = ({
  file,
  show = false,
  title = null,
  drawer = false,
  nocollapse = false
}) => {
  const { t } = useTranslation(['archive']);
  const theme = useTheme();

  const { apiCall } = useMyAPI();
  const { showErrorMessage } = useMySnackbar();

  const [data, setData] = useState<Result[]>(null);

  const nbOfValues = useMemo<number | null>(() => data && data.map(i => i.total).reduce((a, v) => a + v, 0), [data]);

  useEffect(() => {
    if (!file || data) return;
    apiCall({
      method: 'GET',
      url: `/api/v4/file/similar/${file?.file_info?.sha256}/?use_archive`,
      onSuccess: api_data => setData(api_data.api_response),
      onFailure: api_data => showErrorMessage(api_data.api_error_message)
    });
    // eslint-disable-next-line
  }, [file]);

  useEffect(() => {
    return () => {
      setData(null);
    };
  }, [file]);

  return show || (data && data.length !== 0) ? (
    <SectionContainer
      title={title ?? t('similar')}
      nocollapse={nocollapse}
      slotProps={{
        wrapper: {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing(2)
          }
        }
      }}
      slots={{
        end:
          !nbOfValues || nbOfValues === 0 ? null : (
            <Typography
              color="secondary"
              variant="subtitle1"
              children={`${nbOfValues} ${t(nbOfValues === 1 ? 'file' : 'files', { ns: 'fileDetail' })}`}
              sx={{ fontStyle: 'italic' }}
            />
          )
      }}
    >
      {!data ? (
        <Skeleton variant="rectangular" style={{ height: '6rem', borderRadius: '4px' }} />
      ) : data.length === 0 ? (
        <div style={{ width: '100%' }}>
          <InformativeAlert>
            <AlertTitle>{t('no_similar_title')}</AlertTitle>
            {t('no_similar_desc')}
          </InformativeAlert>
        </div>
      ) : (
        data.map((k, i) => <SimilarItem key={i} data={k} drawer={drawer} />)
      )}
    </SectionContainer>
  ) : null;
};

export const SimilarSection = React.memo(WrappedSimilarSection);
export default SimilarSection;
