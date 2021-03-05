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
  useTheme,
  withStyles
} from '@material-ui/core';
import ContentManagedSection from 'commons/addons/section/ContentManagedSection';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import CustomChip from 'components/visual/CustomChip';
import React, { useMemo, useState } from 'react';
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
    marginTop: theme.spacing(-8),
    paddingTop: theme.spacing(12),
    '& h6': {
      fontWeight: 300
    }
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
  },
  toc: {
    listStyle: 'none',
    position: 'sticky',
    top: theme.spacing(10),
    '& li': {
      marginBottom: theme.spacing(0.5)
    },
    '& li > a': {
      color: theme.palette.text.primary,
      textDecoration: 'none',
      '&:hover': {
        color: theme.palette.text.disabled
      }
    }
  }
}));

export default function Search() {
  const { t } = useTranslation(['helpSearch']);
  const classes = useStyles();
  const { indexes } = useALContext();
  const theme = useTheme();
  const [TOC] = useState([
    { name: t('overview'), id: 'overview' },
    { name: t('basic'), id: 'basic' },
    {
      name: t('fields.toc'),
      id: 'fields',
      subItems: [
        { name: t('fields.idx_alert.toc'), id: 'fields.idx_alert' },
        { name: t('fields.idx_file.toc'), id: 'fields.idx_file' },
        { name: t('fields.idx_heuristic.toc'), id: 'fields.idx_heuristic' },
        { name: t('fields.idx_result.toc'), id: 'fields.idx_result' },
        { name: t('fields.idx_signature.toc'), id: 'fields.idx_signature' },
        { name: t('fields.idx_submission.toc'), id: 'fields.idx_submission' },
        { name: t('fields.idx_workflow.toc'), id: 'fields.idx_workflow' }
      ]
    },
    { name: t('wildcard'), id: 'wildcard' },
    {
      name: t('regex'),
      id: 'regex',
      subItems: [
        { name: t('regex.anchoring'), id: 'regex.anchoring' },
        { name: t('regex.chars'), id: 'regex.chars' },
        { name: t('regex.any'), id: 'regex.any' },
        { name: t('regex.oneplus'), id: 'regex.oneplus' },
        { name: t('regex.zeroplus'), id: 'regex.zeroplus' },
        { name: t('regex.zeroone'), id: 'regex.zeroone' },
        { name: t('regex.minmax'), id: 'regex.minmax' },
        { name: t('regex.grouping'), id: 'regex.grouping' },
        { name: t('regex.alternation'), id: 'regex.alternation' },
        { name: t('regex.class'), id: 'regex.class' }
      ]
    },
    { name: t('fuzziness'), id: 'fuzziness' },
    { name: t('proximity'), id: 'proximity' },
    { name: t('ranges'), id: 'ranges', subItems: [{ name: t('ranges.datemath'), id: 'ranges.datemath' }] },
    { name: t('operator'), id: 'operator' },
    { name: t('grouping'), id: 'grouping' },
    { name: t('reserved'), id: 'reserved' }
  ]);
  const [top] = useState({ name: t('top'), id: 'title' });

  return (
    <PageCenter margin={4} textAlign="left">
      <ContentManagedSection title={t('toc')} top={top} items={TOC}>
        {useMemo(() => {
          return (
            <>
              <div id="title" className={classes.paragraph} style={{ marginTop: theme.spacing(-12) }}>
                <Typography variant="h4">{t('title')}</Typography>
                <Typography variant="subtitle2">{t('subtitle')}</Typography>
              </div>

              <div id="overview" className={classes.paragraph}>
                <Typography variant="h5">{t('overview')}</Typography>
                {t('overview.text')}
              </div>

              <div id="basic" className={classes.paragraph}>
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

              <div id="fields" className={classes.paragraph}>
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
                  <div id={`fields.idx_${idx}`} key={idx} className={classes.paragraph}>
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
                            indexes[idx][field].indexed && (
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
                            )
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                );
              })}

              <div id="wildcard" className={classes.paragraph}>
                <Typography variant="h5">{t('wildcard')}</Typography>
                <div className={classes.padded}>{t('wildcard.text')}</div>
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

              <div id="regex" className={classes.paragraph}>
                <Typography variant="h5">{t('regex')}</Typography>
                <div className={classes.padded}>{t('regex.text')}</div>
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

              <div id="regex.anchoring" className={classes.paragraph}>
                <Typography variant="h6">{t('regex.anchoring')}</Typography>
                <div className={classes.padded}>{t('regex.anchoring.text')}</div>
                <div className={classes.padded}>{t('regex.anchoring.text2')}</div>
                <Card variant="outlined" className={classes.pre}>
                  {t('regex.anchoring.ex')}
                </Card>
              </div>

              <div id="regex.chars" className={classes.paragraph}>
                <Typography variant="h6">{t('regex.chars')}</Typography>
                <div className={classes.padded}>{t('regex.chars.text')}</div>
                <Card variant="outlined" className={classes.pre}>
                  {t('regex.chars.ex')}
                </Card>
                <div className={classes.padded}>{t('regex.chars.text2')}</div>
                <div className={classes.padded}>{t('regex.chars.text3')}</div>
                <Card variant="outlined" className={classes.pre}>
                  {t('regex.chars.ex2')}
                </Card>
              </div>

              <div id="regex.any" className={classes.paragraph}>
                <Typography variant="h6">{t('regex.any')}</Typography>
                <div className={classes.padded}>{t('regex.any.text')}</div>
                <Card variant="outlined" className={classes.pre}>
                  {t('regex.any.ex')}
                </Card>
              </div>

              <div id="regex.oneplus" className={classes.paragraph}>
                <Typography variant="h6">{t('regex.oneplus')}</Typography>
                <div className={classes.padded}>{t('regex.oneplus.text')}</div>
                <Card variant="outlined" className={classes.pre}>
                  {t('regex.oneplus.ex')}
                </Card>
              </div>

              <div id="regex.zeroplus" className={classes.paragraph}>
                <Typography variant="h6">{t('regex.zeroplus')}</Typography>
                <div className={classes.padded}>{t('regex.zeroplus.text')}</div>
                <Card variant="outlined" className={classes.pre}>
                  {t('regex.zeroplus.ex')}
                </Card>
              </div>
            </>
          );
        }, [classes.multipleEx, classes.padded, classes.paragraph, classes.pre, indexes, t, theme])}
      </ContentManagedSection>
    </PageCenter>
  );
}
