import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import PageFullWidth from 'commons/components/layout/pages/PageFullWidth';
import Classification from 'components/visual/Classification';
import CustomChip from 'components/visual/CustomChip';
import React from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  table: {},
  container: {
    // I would have loved to find a better way to do this but in the meantime we will go with that
    //   max-height property is calculated using:
    //       fullViewHeight - titleUsedSpace - pagePadding - contentPadding - bottomTablePadding
    // NOTE: If we change any of the padding, this will need to be recalculated...
    maxHeight: 'calc(100vh - 148px - 48px - 56px - 36px)'
  }
}));

function createData(id, start_time, verdict, description, user, num_files, classification, status) {
  return { id, start_time, verdict, description, user, num_files, classification, status };
}

// Generate random data
const rows = [];
for (let x = 0; x < Math.floor(Math.random() * 270 + 30); x++) {
  rows.push(
    createData(
      x,
      '2020-06-23 12:13:06',
      'Malicious',
      'Inspection of file: asdf.cart',
      'sgaron',
      4,
      'TLP:W',
      'processing'
    )
  );
}

export default function Submissions() {
  const classes = useStyles();
  const { t } = useTranslation(['submission']);

  return (
    <PageFullWidth>
      <Box pb={8}>
        <Typography variant="h4">{t('title')}</Typography>
        <Typography variant="subtitle1" color="secondary">
          {rows.length} {t('subtitle')}
        </Typography>
      </Box>

      <TableContainer component={Paper} className={classes.container}>
        <Table size="small" className={classes.table} stickyHeader>
          <TableHead>
            <TableRow style={{ whiteSpace: 'nowrap' }}>
              <TableCell>{t('header.starttime')}</TableCell>
              <TableCell>{t('header.verdict')}</TableCell>
              <TableCell>{t('header.description')}</TableCell>
              <TableCell>{t('header.user')}</TableCell>
              <TableCell>{t('header.numfiles')}</TableCell>
              <TableCell>{t('header.classification')}</TableCell>
              <TableCell>{t('header.status')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => (
              <TableRow key={row.id}>
                <TableCell component="th" scope="row">
                  {row.start_time}
                </TableCell>
                <TableCell>
                  <CustomChip type="square" color="primary" size="tiny" label={row.verdict} />
                </TableCell>
                <TableCell style={{ wordBreak: 'break-all' }}>{row.description}</TableCell>
                <TableCell>{row.user}</TableCell>
                <TableCell>{row.num_files}</TableCell>
                <TableCell>
                  <Classification type="text" size="tiny" c12n={row.classification} format="short" />
                </TableCell>
                <TableCell>{row.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </PageFullWidth>
  );
}
