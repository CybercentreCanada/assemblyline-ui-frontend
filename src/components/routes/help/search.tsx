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
import ContentWithTOC, { ContentWithTOCItemDef } from 'commons/addons/elements/toc/Toc';
import useAppLayout from 'commons/components/hooks/useAppLayout';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import CustomChip from 'components/visual/CustomChip';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const Toc: ContentWithTOCItemDef[] = [
  { id: 'overview' },
  { id: 'basic' },
  {
    id: 'fields',
    subItems: [
      { id: 'fields.legend' },
      { id: 'fields.idx_alert' },
      { id: 'fields.idx_file' },
      { id: 'fields.idx_heuristic' },
      { id: 'fields.idx_result' },
      { id: 'fields.idx_signature' },
      { id: 'fields.idx_submission' },
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
  pre: {
    fontFamily: 'monospace',
    fontSize: '1rem',
    margin: `0 0 ${theme.spacing(1)}px 0`,
    padding: `${theme.spacing(1)}px ${theme.spacing(1.5)}px`,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  }
}));

const useParagraphStyles = autoHide => {
  return makeStyles(theme => ({
    paragraph: {
      marginTop: theme.spacing(autoHide ? 0 : -8),
      paddingTop: theme.spacing(autoHide ? 4 : 12),
      '& h6': {
        fontWeight: 300
      }
    }
  }))();
};

function Title({ children }) {
  const { autoHideAppbar, currentLayout } = useAppLayout();
  const theme = useTheme();
  const autoHide = autoHideAppbar && currentLayout !== 'top';
  return (
    <div
      id="title"
      style={{
        marginTop: theme.spacing(autoHide ? -4 : -12),
        paddingTop: theme.spacing(autoHide ? 4 : 12)
      }}
    >
      {useMemo(() => {
        return children;
      }, [children])}
    </div>
  );
}

function Paragraph({ id, children }) {
  const { autoHideAppbar, currentLayout } = useAppLayout();
  const classes = useParagraphStyles(autoHideAppbar && currentLayout !== 'top');
  return (
    <div id={id} className={classes.paragraph}>
      {useMemo(() => {
        return children;
      }, [children])}
    </div>
  );
}

export default function Search() {
  const { t } = useTranslation(['helpSearch']);
  const classes = useStyles();
  const { indexes } = useALContext();

  return (
    <PageCenter margin={4} width="100%" textAlign="left">
      <ContentWithTOC translation="helpSearch" items={Toc} title="toc" top="top">
        <Title>
          <Typography variant="h4">{t('title')}</Typography>
          <Typography variant="subtitle2">{t('subtitle')}</Typography>
        </Title>

        <Paragraph id="overview">
          <Typography variant="h5">{t('overview')}</Typography>
          {t('overview.text')}
        </Paragraph>

        <Paragraph id="basic">
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
        </Paragraph>

        <Paragraph id="fields">
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
        </Paragraph>

        <Paragraph id="fields.legend">
          <Typography variant="h6">{t('fields.legend')}</Typography>
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

        {Object.keys(indexes).map(idx => {
          return (
            <Paragraph id={`fields.idx_${idx}`} key={idx}>
              <Typography variant="h6" gutterBottom>
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
                    );
                  })}
                </TableBody>
              </Table>
            </Paragraph>
          );
        })}

        <Paragraph id="wildcard">
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
        </Paragraph>

        <Paragraph id="regex">
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
        </Paragraph>

        <Paragraph id="regex.anchoring">
          <Typography variant="h6">{t('regex.anchoring')}</Typography>
          <div className={classes.padded}>{t('regex.anchoring.text')}</div>
          <div className={classes.padded}>{t('regex.anchoring.text2')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('regex.anchoring.ex')}
          </Card>
        </Paragraph>

        <Paragraph id="regex.chars">
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
        </Paragraph>

        <Paragraph id="regex.any">
          <Typography variant="h6">{t('regex.any')}</Typography>
          <div className={classes.padded}>{t('regex.any.text')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('regex.any.ex')}
          </Card>
        </Paragraph>

        <Paragraph id="regex.oneplus">
          <Typography variant="h6">{t('regex.oneplus')}</Typography>
          <div className={classes.padded}>{t('regex.oneplus.text')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('regex.oneplus.ex')}
          </Card>
        </Paragraph>

        <Paragraph id="regex.zeroplus">
          <Typography variant="h6">{t('regex.zeroplus')}</Typography>
          <div className={classes.padded}>{t('regex.zeroplus.text')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('regex.zeroplus.ex')}
          </Card>
        </Paragraph>

        <Paragraph id="regex.zeroone">
          <Typography variant="h6">{t('regex.zeroone')}</Typography>
          <div className={classes.padded}>{t('regex.zeroone.text')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('regex.zeroone.ex')}
          </Card>
        </Paragraph>

        <Paragraph id="regex.minmax">
          <Typography variant="h6">{t('regex.minmax')}</Typography>
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
          <Typography variant="h6">{t('regex.grouping')}</Typography>
          <div className={classes.padded}>{t('regex.grouping.text')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('regex.grouping.ex')}
          </Card>
        </Paragraph>

        <Paragraph id="regex.alternation">
          <Typography variant="h6">{t('regex.alternation')}</Typography>
          <div className={classes.padded}>{t('regex.alternation.text')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('regex.alternation.ex')}
          </Card>
        </Paragraph>

        <Paragraph id="regex.class">
          <Typography variant="h6">{t('regex.class')}</Typography>
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
          <Typography variant="h5">{t('fuzziness')}</Typography>
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
          <Typography variant="h5">{t('proximity')}</Typography>
          <div className={classes.padded}>{t('proximity.text')}</div>
          <Card variant="outlined" className={classes.pre}>
            {t('proximity.ex')}
          </Card>
          <div className={classes.padded}>{t('proximity.text2')}</div>
        </Paragraph>

        <Paragraph id="ranges">
          <Typography variant="h5">{t('ranges')}</Typography>
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
          <Typography variant="h6">{t('ranges.datemath')}</Typography>
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
          <Typography variant="h5">{t('operator')}</Typography>
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
          <Typography variant="h5">{t('grouping')}</Typography>
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
          <Typography variant="h5">{t('reserved')}</Typography>
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
      </ContentWithTOC>
    </PageCenter>
  );
}
