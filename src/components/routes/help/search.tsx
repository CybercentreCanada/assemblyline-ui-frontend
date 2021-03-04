import {
  Card,
  createStyles,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Theme,
  Typography,
  withStyles
} from '@material-ui/core';
import PageFullWidth from 'commons/components/layout/pages/PageFullWidth';
import useALContext from 'components/hooks/useALContext';
import CustomChip from 'components/visual/CustomChip';
import React from 'react';
import { useTranslation } from 'react-i18next';

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    root: {
      paddingRight: '8px',
      paddingLeft: '8px'
    },
    head: {
      backgroundColor: theme.palette.type === 'dark' ? '#404040' : '#EEE',
      whiteSpace: 'nowrap'
    }
  })
)(TableCell);

const useStyles = makeStyles(theme => ({
  multipleEx: {
    marginBlockStart: theme.spacing(1),
    paddingInlineStart: theme.spacing(2)
  },
  padded: {
    paddingBottom: theme.spacing(1),
    paddingTop: theme.spacing(1)
  },
  paragraph: {
    paddingBottom: theme.spacing(4)
  },
  pre: {
    fontFamily: 'monospace',
    fontSize: '1rem',
    margin: `0 0 ${theme.spacing(1)}px 0`,
    padding: `${theme.spacing(1)}px ${theme.spacing(1.5)}px`,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  },
  title: {
    paddingBottom: theme.spacing(6)
  }
}));

export default function Search() {
  const { t } = useTranslation(['helpSearch']);
  const classes = useStyles();
  const { indexes } = useALContext();

  return (
    <PageFullWidth margin={4}>
      <div className={classes.paragraph}>
        <Typography variant="h4">{t('title')}</Typography>
        <Typography variant="subtitle2">{t('subtitle')}</Typography>
      </div>

      <div className={classes.paragraph}>
        <Typography variant="h5">{t('overview')}</Typography>
        {t('overview.text')}
      </div>

      <div className={classes.paragraph}>
        <Typography variant="h5">{t('basic')}</Typography>
        {t('basic.text')}
        <Typography variant="subtitle2" className={classes.padded}>
          {t('exemples')}
        </Typography>
        <Card variant="outlined" className={classes.pre}>
          {t('basic.ex1')}
        </Card>
        <Card variant="outlined" className={classes.pre}>
          {t('basic.ex2')}
        </Card>
      </div>

      <div className={classes.paragraph}>
        <Typography variant="h5">{t('fields')}</Typography>
        {t('fields.text')}
        <Typography variant="subtitle2" className={classes.padded}>
          {t('exemples')}
        </Typography>
        <ul className={classes.multipleEx}>
          <li>
            {t('fields.ex1.title')}
            <Card variant="outlined" className={classes.pre}>
              {t('fields.ex1')}
            </Card>
          </li>
          <li>
            {t('fields.ex2.title')}
            <Card variant="outlined" className={classes.pre}>
              {t('fields.ex2')}
            </Card>
          </li>
          <li>
            {t('fields.ex3.title')}
            <Card variant="outlined" className={classes.pre}>
              {t('fields.ex3')}
            </Card>
          </li>
          <li>
            {t('fields.ex4.title')}
            <Card variant="outlined" className={classes.pre}>
              {t('fields.ex4')}
            </Card>
          </li>
          <li>
            {t('fields.ex5.title')}
            <Card variant="outlined" className={classes.pre}>
              {t('fields.ex5')}
            </Card>
          </li>
        </ul>
        <div className={classes.padded}>{t('fields.text2')}</div>
        <div>
          <b>
            <i>{`${t('fields.important')}:`}</i>
          </b>
          {` ${t('fields.important.text')}`}
        </div>
      </div>

      {Object.keys(indexes).map(idx => {
        return (
          <div key={idx} className={classes.paragraph}>
            <Typography variant="h5" gutterBottom>
              {t(`fields.idx_${idx}`)}
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <StyledTableCell>{t('fields.table.name')}</StyledTableCell>
                  <StyledTableCell>{t('fields.table.type')}</StyledTableCell>
                  <StyledTableCell>{t('fields.table.attrib')}</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(indexes[idx]).map(field => {
                  return (
                    <TableRow hover key={field}>
                      <StyledTableCell width="50%" style={{ wordBreak: 'break-word' }}>
                        {field}
                      </StyledTableCell>
                      <StyledTableCell>{indexes[idx][field].type}</StyledTableCell>
                      <StyledTableCell>
                        {indexes[idx][field].stored && (
                          <CustomChip
                            color="info"
                            size="tiny"
                            type="rounded"
                            label={t('fields.att.stored')}
                            tooltip={t('fields.att.stored.tooltip')}
                          />
                        )}
                        {indexes[idx][field].list && (
                          <CustomChip
                            color="warning"
                            size="tiny"
                            type="rounded"
                            label={t('fields.att.list')}
                            tooltip={t('fields.att.list.tooltip')}
                          />
                        )}
                        {indexes[idx][field].default && (
                          <CustomChip
                            color="primary"
                            size="tiny"
                            type="rounded"
                            label={t('fields.att.default')}
                            tooltip={t('fields.att.default.tooltip')}
                          />
                        )}
                      </StyledTableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        );
      })}

      <div className={classes.paragraph}>
        <Typography variant="h5">{t('wildcard')}</Typography>
        {t('wildcard.text')}
        <Card variant="outlined" className={classes.pre}>
          {t('wildcard.ex')}
        </Card>
        <div className={classes.padded}>{t('wildcard.text2')}</div>
        <div>
          <b>
            <i>{`${t('wildcard.note')}:`}</i>
          </b>
          {` ${t('wildcard.note.text')}`}
        </div>
      </div>

      <div className={classes.paragraph}>
        <Typography variant="h5">{t('regex')}</Typography>
        {t('regex.text')}
        <Card variant="outlined" className={classes.pre}>
          {t('regex.ex')}
        </Card>
        <div>
          <b>
            <i>{t('regex.warning')}</i>
          </b>
        </div>
        <div className={classes.padded}>{t('regex.warning.text')}</div>
        <Card variant="outlined" className={classes.pre}>
          {t('regex.warning.ex')}
        </Card>
        <div className={classes.padded}>{t('regex.warning.follow')}</div>
      </div>
    </PageFullWidth>
  );
}
