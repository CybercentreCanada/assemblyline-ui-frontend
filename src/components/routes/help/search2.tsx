import { Card, Table, TableBody, TableCell, TableHead, TableRow, Theme, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import withStyles from '@mui/styles/withStyles';
import clsx from 'clsx';
import { ContentWithTOCItemDef } from 'commons/addons/toc/Toc';
import useAppBar from 'commons/components/app/hooks/useAppBar';
import useAppLayout from 'commons/components/app/hooks/useAppLayout';
import PageCenter from 'commons/components/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import CustomChip from 'components/visual/CustomChip';
import { Anchor, TableOfContent } from 'components/visual/TableOfContent';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const Toc: ContentWithTOCItemDef[] = [
  { id: 'overview' },
  { id: 'basic' },
  {
    id: 'fields',
    subItems: [
      { id: 'fields.legend' },
      { id: 'fields.idx_alert' },
      { id: 'fields.idx_emptyresult', is_admin: true },
      { id: 'fields.idx_error', is_admin: true },
      { id: 'fields.idx_file' },
      { id: 'fields.idx_heuristic' },
      { id: 'fields.idx_result' },
      { id: 'fields.idx_safelist' },
      { id: 'fields.idx_signature' },
      { id: 'fields.idx_submission' },
      { id: 'fields.idx_user', is_admin: true },
      { id: 'fields.idx_workflow' }
    ]
  },
  { id: 'wildcard' },
  {
    id: 'regex',
    subItems: [
      { id: 'regex.anchoring' },
      { id: 'regex.chars' },
      { id: 'regex.any' },
      { id: 'regex.oneplus' },
      { id: 'regex.zeroplus' },
      { id: 'regex.zeroone' },
      { id: 'regex.minmax' },
      { id: 'regex.grouping' },
      { id: 'regex.alternation' },
      { id: 'regex.class' }
    ]
  },
  { id: 'fuzziness' },
  { id: 'proximity' },
  { id: 'ranges', subItems: [{ id: 'ranges.datemath' }] },
  { id: 'operator' },
  { id: 'grouping' },
  { id: 'reserved' }
];

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    root: {
      paddingRight: '8px',
      paddingLeft: '8px'
    },
    head: {
      backgroundColor: theme.palette.mode === 'dark' ? '#404040' : '#EEE',
      whiteSpace: 'nowrap'
    }
  })
)(TableCell);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    multipleEx: {
      marginBlockStart: theme.spacing(1),
      paddingInlineStart: theme.spacing(2)
    },
    padded: {
      paddingBottom: theme.spacing(1),
      paddingTop: theme.spacing(1)
    },
    pre: {
      fontFamily: 'monospace',
      fontSize: '1rem',
      margin: theme.spacing(0, 0, 1, 0),
      padding: theme.spacing(1, 1.5),
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word'
    }
  })
);

const useParagraphStyles = makeStyles((theme: Theme) =>
  createStyles({
    paragraph: {
      marginTop: theme.spacing(-8),
      paddingTop: theme.spacing(12),
      '& h6': {
        fontWeight: 300
      }
    },
    autoHide: {
      marginTop: theme.spacing(0),
      paddingTop: theme.spacing(4)
    }
  })
);

function Paragraph({ id, children }) {
  const { autoHide: autoHideAppbar } = useAppBar();
  const { current: currentLayout } = useAppLayout();
  const classes = useParagraphStyles();

  return (
    <div id={id} className={clsx(classes.paragraph, autoHideAppbar && currentLayout !== 'top' && classes.autoHide)}>
      {useMemo(() => children, [children])}
    </div>
  );
}

export default function Search() {
  const { t } = useTranslation(['helpSearch']);
  const classes = useStyles();
  const { indexes } = useALContext();

  return (
    <TableOfContent>
      <PageCenter margin={4} width="100%" textAlign="left">
        <Typography variant="h4">{t('title')}</Typography>
        <Typography variant="subtitle2">{t('subtitle')}</Typography>

        <Paragraph id="overview">
          <Typography component={Anchor} level={0} variant="h5">
            {t('overview')}
          </Typography>
          {t('overview.text')}
        </Paragraph>

        <Paragraph id="basic">
          <Typography component={Anchor} level={0} variant="h5">
            {t('basic')}
          </Typography>
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
        </Paragraph>

        <Paragraph id="fields">
          <Typography component={Anchor} level={0} variant="h5">
            {t('fields')}
          </Typography>
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
        </Paragraph>

        <Paragraph id="fields.legend">
          <Typography component={Anchor} level={1} variant="h6">
            {t('fields.legend')}
          </Typography>
          {t('fields.legend.text')}
          <ul>
            <li>
              <b>text</b>
              {`: ${t('fields.legend.text_field')}`}
            </li>
            <li>
              <b>ip</b>
              {`: ${t('fields.legend.ip_field')}`}
            </li>
            <li>
              <CustomChip color="primary" size="tiny" type="rounded" label={t('fields.att.default')} />:{' '}
              {t('fields.legend.default')}
            </li>
            <li>
              <CustomChip color="warning" size="tiny" type="rounded" label={t('fields.att.list')} />:{' '}
              {t('fields.legend.list')}
            </li>
            <li>
              <CustomChip color="info" size="tiny" type="rounded" label={t('fields.att.stored')} />:{' '}
              {t('fields.legend.stored')}
            </li>
          </ul>
        </Paragraph>

        {Object.keys(indexes).map(idx => (
          <Paragraph id={`fields.idx_${idx}`} key={idx}>
            <Typography component={Anchor} level={1} variant="h6" gutterBottom>
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
                {Object.keys(indexes[idx]).map(
                  field =>
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
                              // tooltip={t('fields.att.stored.tooltip')}
                            />
                          )}
                          {indexes[idx][field].list && (
                            <CustomChip
                              color="warning"
                              size="tiny"
                              type="rounded"
                              label={t('fields.att.list')}
                              // tooltip={t('fields.att.list.tooltip')}
                            />
                          )}
                          {indexes[idx][field].default && (
                            <CustomChip
                              color="primary"
                              size="tiny"
                              type="rounded"
                              label={t('fields.att.default')}
                              // tooltip={t('fields.att.default.tooltip')}
                            />
                          )}
                        </StyledTableCell>
                      </TableRow>
                    )
                )}
              </TableBody>
            </Table>
          </Paragraph>
        ))}

        <Paragraph id="wildcard">
          <Typography component={Anchor} level={0} variant="h5">
            {t('wildcard')}
          </Typography>
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
        </Paragraph>

        <Paragraph id="regex">
          <Typography component={Anchor} level={0} variant="h5">
            {t('regex')}
          </Typography>
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
        </Paragraph>

        <Paragraph id="regex.anchoring">
          <Typography component={Anchor} level={1} variant="h6">
            {t('regex.anchoring')}
          </Typography>
          <div className={classes.padded}>{t('regex.anchoring.text')}</div>
          <div className={classes.padded}>{t('regex.anchoring.text2')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('regex.anchoring.ex')}
          </Card>
        </Paragraph>

        <Paragraph id="regex.chars">
          <Typography component={Anchor} level={1} variant="h6">
            {t('regex.chars')}
          </Typography>
          <div className={classes.padded}>{t('regex.chars.text')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('regex.chars.ex')}
          </Card>
          <div className={classes.padded}>{t('regex.chars.text2')}</div>
          <div className={classes.padded}>{t('regex.chars.text3')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('regex.chars.ex2')}
          </Card>
        </Paragraph>

        <Paragraph id="regex.any">
          <Typography component={Anchor} level={1} variant="h6">
            {t('regex.any')}
          </Typography>
          <div className={classes.padded}>{t('regex.any.text')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('regex.any.ex')}
          </Card>
        </Paragraph>

        <Paragraph id="regex.oneplus">
          <Typography component={Anchor} level={1} variant="h6">
            {t('regex.oneplus')}
          </Typography>
          <div className={classes.padded}>{t('regex.oneplus.text')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('regex.oneplus.ex')}
          </Card>
        </Paragraph>

        <Paragraph id="regex.zeroplus">
          <Typography component={Anchor} level={1} variant="h6">
            {t('regex.zeroplus')}
          </Typography>
          <div className={classes.padded}>{t('regex.zeroplus.text')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('regex.zeroplus.ex')}
          </Card>
        </Paragraph>

        <Paragraph id="regex.zeroone">
          <Typography component={Anchor} level={1} variant="h6">
            {t('regex.zeroone')}
          </Typography>
          <div className={classes.padded}>{t('regex.zeroone.text')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('regex.zeroone.ex')}
          </Card>
        </Paragraph>

        <Paragraph id="regex.minmax">
          <Typography component={Anchor} level={1} variant="h6">
            {t('regex.minmax')}
          </Typography>
          <div className={classes.padded}>{t('regex.minmax.text')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('regex.minmax.ex')}
          </Card>
          <div className={classes.padded}>{t('regex.minmax.text2')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('regex.minmax.ex2')}
          </Card>
        </Paragraph>

        <Paragraph id="regex.grouping">
          <Typography component={Anchor} level={1} variant="h6">
            {t('regex.grouping')}
          </Typography>
          <div className={classes.padded}>{t('regex.grouping.text')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('regex.grouping.ex')}
          </Card>
        </Paragraph>

        <Paragraph id="regex.alternation">
          <Typography component={Anchor} level={1} variant="h6">
            {t('regex.alternation')}
          </Typography>
          <div className={classes.padded}>{t('regex.alternation.text')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('regex.alternation.ex')}
          </Card>
        </Paragraph>

        <Paragraph id="regex.class">
          <Typography component={Anchor} level={1} variant="h6">
            {t('regex.class')}
          </Typography>
          <div className={classes.padded}>{t('regex.class.text')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('regex.class.ex')}
          </Card>
          <div className={classes.padded}>{t('regex.class.text2')}</div>
          <div className={classes.padded}>{t('regex.class.text3')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('regex.class.ex2')}
          </Card>
        </Paragraph>

        <Paragraph id="fuzziness">
          <Typography component={Anchor} level={0} variant="h5">
            {t('fuzziness')}
          </Typography>
          <div className={classes.padded}>{t('fuzziness.text')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('fuzziness.ex')}
          </Card>
          <div className={classes.padded}>{t('fuzziness.text2')}</div>
          <div className={classes.padded}>{t('fuzziness.text3')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('fuzziness.ex2')}
          </Card>
        </Paragraph>

        <Paragraph id="proximity">
          <Typography component={Anchor} level={0} variant="h5">
            {t('proximity')}
          </Typography>
          <div className={classes.padded}>{t('proximity.text')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('proximity.ex')}
          </Card>
          <div className={classes.padded}>{t('proximity.text2')}</div>
        </Paragraph>

        <Paragraph id="ranges">
          <Typography component={Anchor} level={0} variant="h5">
            {t('ranges')}
          </Typography>
          {t('ranges.text')}
          <Typography variant="subtitle2" className={classes.padded}>
            {t('exemples')}
          </Typography>
          <ul className={classes.multipleEx}>
            <li>
              {t('ranges.ex1.title')}
              <Card variant="outlined" className={classes.pre}>
                {t('ranges.ex1')}
              </Card>
            </li>
            <li>
              {t('ranges.ex2.title')}
              <Card variant="outlined" className={classes.pre}>
                {t('ranges.ex2')}
              </Card>
            </li>
            <li>
              {t('ranges.ex3.title')}
              <Card variant="outlined" className={classes.pre}>
                {t('ranges.ex3')}
              </Card>
            </li>
            <li>
              {t('ranges.ex4.title')}
              <Card variant="outlined" className={classes.pre}>
                {t('ranges.ex4')}
              </Card>
            </li>
            <li>
              {t('ranges.ex5.title')}
              <Card variant="outlined" className={classes.pre}>
                {t('ranges.ex5')}
              </Card>
            </li>
            <li>
              {t('ranges.ex6.title')}
              <Card variant="outlined" className={classes.pre}>
                {t('ranges.ex6')}
              </Card>
            </li>
            <li>
              {t('ranges.ex7.title')}
              <Card variant="outlined" className={classes.pre}>
                {t('ranges.ex7')}
              </Card>
            </li>
          </ul>
          <div className={classes.padded}>{t('ranges.text2')}</div>
          <ul className={classes.multipleEx}>
            <li>
              {t('ranges.ex8.title')}
              <Card variant="outlined" className={classes.pre}>
                {t('ranges.ex8')}
              </Card>
            </li>
          </ul>
          <div className={classes.padded}>{t('ranges.text3')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('ranges.ex9')}
          </Card>
          <div className={classes.padded}>{t('ranges.text4')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('ranges.ex10')}
          </Card>
        </Paragraph>

        <Paragraph id="ranges.datemath">
          <Typography component={Anchor} level={1} variant="h6">
            {t('ranges.datemath')}
          </Typography>
          <div className={classes.padded}>{t('ranges.datemath.text')}</div>
          <ul>
            <li>{t('ranges.datemath.list1')}</li>
            <li>{t('ranges.datemath.list2')}</li>
            <li>{t('ranges.datemath.list3')}</li>
          </ul>
          <div className={classes.padded}>{t('ranges.datemath.text2')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('ranges.datemath.ex1')}
          </Card>
          <div className={classes.padded}>{t('ranges.datemath.text3')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('ranges.datemath.ex2')}
          </Card>
        </Paragraph>

        <Paragraph id="operator">
          <Typography component={Anchor} level={0} variant="h5">
            {t('operator')}
          </Typography>
          <div className={classes.padded}>{t('operator.text')}</div>
          <div className={classes.padded}>{t('operator.text2')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('operator.ex1')}
          </Card>
          <div className={classes.padded}>{t('operator.text3')}</div>
          <ul>
            <li>{t('operator.list1')}</li>
            <li>{t('operator.list2')}</li>
            <li>{t('operator.list3')}</li>
          </ul>
          <div className={classes.padded}>{t('operator.text4')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('operator.ex2')}
          </Card>
          <div className={classes.padded}>{t('operator.text5')}</div>
        </Paragraph>

        <Paragraph id="grouping">
          <Typography component={Anchor} level={0} variant="h5">
            {t('grouping')}
          </Typography>
          <div className={classes.padded}>{t('grouping.text')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('grouping.ex')}
          </Card>
          <div className={classes.padded}>{t('grouping.text2')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('grouping.ex2')}
          </Card>
        </Paragraph>

        <Paragraph id="reserved">
          <Typography component={Anchor} level={0} variant="h5">
            {t('reserved')}
          </Typography>
          <div className={classes.padded}>{t('reserved.text')}</div>
          <div className={classes.padded}>{t('reserved.text2')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('reserved.ex')}
          </Card>
          <div className={classes.padded}>{t('reserved.text3')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('reserved.ex2')}
          </Card>
          <div className={classes.padded}>{t('reserved.text4')}</div>
          <div className={classes.padded}>
            <b>
              <i>{t('reserved.note')}</i>
            </b>
            {`: ${t('reserved.text5')}`}
          </div>
        </Paragraph>
      </PageCenter>
    </TableOfContent>
  );
}
