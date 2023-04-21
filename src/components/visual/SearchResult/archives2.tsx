import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import {
  AlertTitle,
  Chip,
  Paper,
  Skeleton,
  TableContainer,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
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
  setFileID?: (id: string) => void;
  allowSort?: boolean;
};

type TDPRops = {
  children: any;
};

const TD = ({ children = null }: TDPRops) => {
  return (
    <td
      style={
        {
          // overflow: 'hidden',
          // whiteSpace: 'nowrap',
          // textOverflow: 'ellipsis'
        }
      }
    >
      {children}
    </td>
  );
};

const WrappedArchivesTable2: React.FC<ArchivesTable2Props> = ({ fileResults, setFileID = null, allowSort = true }) => {
  const { t, i18n } = useTranslation(['archive']);
  const theme = useTheme();
  const upLG = useMediaQuery(theme.breakpoints.up('lg'));
  const { user: currentUser } = useAppUser<CustomUser>();

  return fileResults ? (
    fileResults.total !== 0 ? (
      <>
        <TableContainer component={Paper}>
          <GridTable nbOfColumns={5}>
            <GridTableHead>
              <GridTableRow>
                <GridTableHeader children={t('header.seen.last')} sortField="seen.last" allowSort invertedSort noWrap />
                <GridTableHeader children={t('header.sha256')} sortField="sha256" allowSort noWrap />
                <GridTableHeader children={t('header.type')} sortField="type" allowSort noWrap />
                <GridTableHeader children={t('header.labels')} />
                <GridTableHeader children={t('header.download')} noWrap style={{ justifyContent: 'center' }} />
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
                          noWrap
                          children={<Moment fromNow locale={i18n.language} children={file.seen.last} />}
                        />
                      </Tooltip>
                    }
                  />
                  <GridTableCell children={file.sha256} noWrap />
                  <GridTableCell children={file.type} noWrap />
                  <GridTableCell
                    children={
                      <div style={{ display: 'flex', gap: theme.spacing(1), flexWrap: 'wrap' }}>
                        {file.labels.map(label => (
                          <Chip
                            label={label}
                            color="success"
                            variant="outlined"
                            size="small"
                            onClick={event => {
                              event.preventDefault();
                              event.stopPropagation();
                              console.log(event);
                            }}
                          />
                        ))}
                      </div>
                    }
                  />
                  <GridTableCell
                    style={{ justifyContent: 'center' }}
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

        {/* <Grid container flexWrap="nowrap">
          <Grid item zeroMinWidth flex={'auto'}>
            <Typography noWrap>asdasdasdasdasdasd</Typography>
          </Grid>
          <Grid item flex={'auto'}>
            <Typography noWrap>this is a the last</Typography>
          </Grid>
          <Grid item zeroMinWidth flex={'auto'}>
            <Typography noWrap>asdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasd</Typography>
          </Grid>
        </Grid> */}

        {/* <Grid
          component={Paper}
          display="grid"
          gridAutoFlow="row"
          gridTemplateColumns="repeat(3, auto)"
          // gridTemplateColumns="minmax(auto, 20fr) 67fr minmax(auto, 20fr)"
          alignItems="stretch"
          style={{
            // cursor: 'pointer',
            overflowX: 'auto'
            // overflowY: 'scroll'
          }}
        >
          <Grid display="contents"  sx={{ '&:hover>div>div': { cursor: 'pointer' } }} >
            {fileResults.items.map(item => (
              <Grid
                key={`${item.id}-2`}
                display="contents"
                sx={{
                  '&>div': {
                    textDecoration: 'none',
                    padding: '6px 8px 6px 8px'
                    // borderBottom: '10px solid rgba(81,81,81,1)'
                  },
                  '&:hover>div': { cursor: 'pointer', backgroundColor: 'rgba(81,81,81,1)' }
                }}
                onClick={event => {
                  console.log(item.id);
                }}
              >
                <Grid
                  children={item.seen.last}
                  // padding="6px 8px 6px 8px"
                  // whiteSpace="nowrap"
                  // borderBottom="1px solid rgba(81,81,81,1)"
                />
                <Grid
                  children={item.sha256}
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  // padding="6px 8px 6px 8px"
                  // borderBottom="1px solid rgba(81,81,81,1)"
                />
                <Grid
                  children={item.seen.last}
                  // padding="6px 8px 6px 8px"
                  // whiteSpace="nowrap"
                  // borderBottom="1px solid rgba(81,81,81,1)"
                />
              </Grid>
            ))}
          </Grid>
        </Grid> */}

        {/* <div
          style={{
            margin: theme.spacing(2),
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap'
          }}
        >
          <div style={{ flex: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {fileResults.items[0].sha256}
          </div>
          <div style={{ flex: 1 }}>{fileResults.items[0].type}</div>
          <div style={{ flex: 2, display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
            {fileResults.items[0].labels.map(label => (
              <div>{label}</div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridAutoFlow: 'row',
            gridTemplateColumns: '1fr 5fr auto'
            // gridTemplateRows: 'repeat(5, auto)'
          }}
        >
          <div style={{ display: 'flex', whiteSpace: 'nowrap', overflow: 'hidden' }}>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>b998adcfc80ed8c9475</div>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>b998adcfc80ed8c9475</div>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>b998adcfc80ed8c9475</div>
          </div>

          <Box sx={{ display: 'contents', '&:hover>div': { backgroundColor: 'red' } }}>
            <div>a</div>
            <div>b</div>
            <div>c</div>
          </Box>

          {Array.from(Array(20).keys()).map(k => (
            <div>{k}</div>
          ))}
        </div> */}

        {/* <div style={{ display: 'table', width: '100%' }}>
          <div style={{ display: 'table-column-group' }}>
            <div style={{ display: 'table-column' }}>
              <div style={{ display: 'table-cell' }}>asdasd</div>
              <div style={{ display: 'table-cell' }}>asdasd</div>
              <div style={{ display: 'table-cell' }}>asdasd</div>
              <div style={{ display: 'table-cell' }}>asdasd</div>
            </div>
            <div style={{ display: 'table-column' }}>
              <div style={{ display: 'table-cell' }}>asdasd</div>
              <div style={{ display: 'table-cell' }}>asdasd</div>
              <div style={{ display: 'table-cell' }}>asdasd</div>
              <div style={{ display: 'table-cell' }}>asdasd</div>
            </div>
            <div style={{ display: 'table-column' }}>
              <div style={{ display: 'table-cell' }}>asdasd</div>
              <div style={{ display: 'table-cell' }}>asdasd</div>
              <div style={{ display: 'table-cell' }}>asdasd</div>
              <div style={{ display: 'table-cell' }}>asdasd</div>
            </div>
          </div>
        </div> */}

        {/* <table border={1} style={{}}>
          <colgroup>
            <col span={1} style={{}} />
            <col
              span={1}
              style={{ maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            />
            <col span={1} style={{}} />
            <col span={1} style={{}} />
            <col span={1} style={{}} />
          </colgroup>
          <thead>
            <tr style={{ display: 'tabl' }}>
              <td>{t('header.seen.last')}</td>
              <td>{t('header.sha256')}</td>
              <td>{t('header.type')}</td>
              <td>{t('header.labels')}</td>
              <td>{t('header.download')}</td>
            </tr>
          </thead>
          <tbody>
            {fileResults.items.map(file => (
              <tr>
                <td>{file.seen.last}</td>
                <td>
                  <span>{file.sha256}</span>
                </td>
                <td>{file.type}</td>
                <td>
                  {file.labels.map(label => (
                    <div>{label}</div>
                  ))}
                </td>
                <td>{'download'}</td>
              </tr>
            ))}
          </tbody>
        </table> */}

        {/* <TableContainer component={Paper}>
          <Table
            size="small"
            style={{
              overflow: 'hidden'
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell children={t('header.seen.last')} />
                <TableCell children={t('header.seen.last')} />
                <TableCell children={t('header.seen.last')} />
                <TableCell children={t('header.seen.last')} />
                <TableCell children={t('header.seen.last')} />
              </TableRow>
            </TableHead>
            <TableBody>
              {fileResults.items.map(file => (
                <TableRow
                  key={file.id}
                  // component={Link}
                  // to={`/file/detail/${file.id}`}
                  // onClick={event => {
                  //   if (setFileID) {
                  //     event.preventDefault();
                  //     setFileID(file.id);
                  //   }
                  // }}
                  // hover
                  // style={{ textDecoration: 'none' }}
                >
                  <TableCell component="th" scope="row">
                    <Tooltip title={file.seen.last}>
                      <>
                        <Moment fromNow locale={i18n.language} children={file.seen.last} />
                      </>
                    </Tooltip>
                  </TableCell>
                  <TableCell
                    children={
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {file.sha256}
                      </div>
                    }
                  />
                  <TableCell children={file.type} />
                  <TableCell
                    children={file.labels.map(label => (
                      <Chip label={label} color="success" variant="outlined" size="small" />
                    ))}
                  />
                  <TableCell children={'download'} />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer> */}
      </>
    ) : (
      // <TableContainer component={Paper}>
      //   <DivTable>
      //     <DivTableHead>
      //       <DivTableRow style={{ whiteSpace: 'nowrap' }}>
      //         <SortableHeaderCell children={t('header.seen.last')} sortField="seen.last" allowSort={allowSort} />
      //         <SortableHeaderCell children={t('header.sha256')} sortField="sha256" allowSort={allowSort} />
      //         <SortableHeaderCell children={t('header.type')} sortField="type" allowSort={allowSort} />
      //         <DivTableCell children={t('header.labels')} />
      //         <DivTableCell children={t('header.download')} style={{ textAlign: 'center' }} />
      //       </DivTableRow>
      //     </DivTableHead>
      //     <DivTableBody>
      //       {fileResults.items.map(file => (
      //         <LinkRow
      //           key={file.id}
      //           component={Link}
      //           to={`/file/detail/${file.id}`}
      //           onClick={event => {
      //             if (setFileID) {
      //               event.preventDefault();
      //               setFileID(file.id);
      //             }
      //           }}
      //           hover
      //           style={{ textDecoration: 'none' }}
      //         >
      //           <DivTableCell style={{ whiteSpace: 'nowrap' }}>
      //             <Tooltip title={file.seen.last}>
      //               <>
      //                 <Moment fromNow locale={i18n.language} children={file.seen.last} />
      //               </>
      //             </Tooltip>
      //           </DivTableCell>
      //           <DivTableCell>
      //             {!('sha256' in file) ? null : (
      //               <div
      //                 children={file.sha256}
      //                 style={{
      //                   // width: upLG ? '100%' : '10vw',
      //                   whiteSpace: 'nowrap',
      //                   overflow: 'hidden',
      //                   textOverflow: 'ellipsis'
      //                 }}
      //               />
      //             )}
      //           </DivTableCell>
      //           <DivTableCell children={'type' in file ? file.type : null} style={{ whiteSpace: 'nowrap' }} />
      //           <DivTableCell>
      //             {
      //               !('labels' in file)
      //                 ? null
      //                 : file.labels.map(label => <Chip label={label} color="success" variant="outlined" size="small" />)
      //               // <Stack direction="row" spacing={1}>
      //               // <>
      //               //   {file.labels.map(label => (
      //               //     <Chip label={label} color="success" variant="outlined" size="small" />
      //               //   ))}
      //               // </>
      //               // </Stack>
      //             }
      //           </DivTableCell>
      //           <DivTableCell style={{ padding: 'unset', textAlign: 'center' }}>
      //             {currentUser.roles.includes('file_download') && 'sha256' in file && (
      //               <FileDownloader
      //                 icon={<GetAppOutlinedIcon fontSize="small" />}
      //                 link={`/api/v4/file/download/${file.sha256}/?`}
      //                 size="small"
      //                 onClick={e => {
      //                   e.stopPropagation();
      //                   e.preventDefault();
      //                 }}
      //               />
      //             )}
      //           </DivTableCell>
      //         </LinkRow>
      //       ))}
      //     </DivTableBody>
      //   </DivTable>
      // </TableContainer>
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

const ArchivesTable2 = React.memo(WrappedArchivesTable2);
export default ArchivesTable2;
