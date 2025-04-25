import type { CardProps, Theme } from '@mui/material';
import {
  Box,
  Card,
  styled,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme
} from '@mui/material';
import { withStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import type { ContentWithTOCItemDef } from 'commons/addons/toc/Toc';
import ContentWithTOC from 'commons/addons/toc/Toc';
import { useAppBar, useAppLayout } from 'commons/components/app/hooks';
import PageCenter from 'commons/components/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import CustomChip from 'components/visual/CustomChip';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const Toc: ContentWithTOCItemDef[] = [
  { id: 'overview' },
  { id: 'basic' },
  {
    id: 'fields',
    subItems: [
      { id: 'fields.legend' },
      { id: 'fields.idx_alert' },
      { id: 'fields.idx_badlist' },
      { id: 'fields.idx_emptyresult', is_admin: true },
      { id: 'fields.idx_error', is_admin: true },
      { id: 'fields.idx_file' },
      { id: 'fields.idx_heuristic' },
      { id: 'fields.idx_result' },
      { id: 'fields.idx_retrohunt' },
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

function Paragraph({ id, children }) {
  const theme = useTheme();

  const { autoHide: autoHideAppbar } = useAppBar();
  const { current: currentLayout } = useAppLayout();

  return (
    <Box
      id={id}
      sx={{
        marginTop: theme.spacing(-8),
        paddingTop: theme.spacing(12),
        '& h6': { fontWeight: 300 },
        ...(autoHideAppbar && currentLayout !== 'top' && { marginTop: theme.spacing(0), paddingTop: theme.spacing(4) })
      }}
    >
      {useMemo(() => children, [children])}
    </Box>
  );
}

const MultipleEx = memo(
  styled('ul')(({ theme }) => ({
    marginBlockStart: theme.spacing(1),
    paddingInlineStart: theme.spacing(2)
  }))
);

const Padded = memo(
  styled('div')(({ theme }) => ({
    paddingBottom: theme.spacing(1),
    paddingTop: theme.spacing(1)
  }))
);

const StyledCard = memo(
  styled(({ ...props }: CardProps) => <Card variant="outlined" {...props} />)<CardProps>(({ theme }) => ({
    fontFamily: 'monospace',
    fontSize: '1rem',
    margin: theme.spacing(0, 0, 1, 0),
    padding: theme.spacing(1, 1.5),
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  }))
);

export default function Search() {
  const { t } = useTranslation(['helpSearch']);
  const theme = useTheme();
  const { indexes } = useALContext();

  return (
    <PageCenter margin={4} width="100%" textAlign="left">
      <ContentWithTOC translation="helpSearch" items={Toc}>
        <Typography variant="h4">{t('title')}</Typography>
        <Typography variant="subtitle2">{t('subtitle')}</Typography>

        <Paragraph id="overview">
          <Typography variant="h5">{t('overview')}</Typography>
          {t('overview.text')}
        </Paragraph>

        <Paragraph id="basic">
          <Typography variant="h5">{t('basic')}</Typography>
          {t('basic.text')}
          <Typography variant="subtitle2" sx={{ paddingBottom: theme.spacing(1), paddingTop: theme.spacing(1) }}>
            {t('exemples')}
          </Typography>
          <StyledCard>{t('basic.ex1')}</StyledCard>
          <StyledCard>{t('basic.ex2')}</StyledCard>
        </Paragraph>

        <Paragraph id="fields">
          <Typography variant="h5">{t('fields')}</Typography>
          {t('fields.text')}
          <Typography variant="subtitle2" sx={{ paddingBottom: theme.spacing(1), paddingTop: theme.spacing(1) }}>
            {t('exemples')}
          </Typography>
          <MultipleEx>
            <li>
              {t('fields.ex1.title')}
              <StyledCard>{t('fields.ex1')}</StyledCard>
            </li>
            <li>
              {t('fields.ex2.title')}
              <StyledCard>{t('fields.ex2')}</StyledCard>
            </li>
            <li>
              {t('fields.ex3.title')}
              <StyledCard>{t('fields.ex3')}</StyledCard>
            </li>
            <li>
              {t('fields.ex4.title')}
              <StyledCard>{t('fields.ex4')}</StyledCard>
            </li>
            <li>
              {t('fields.ex5.title')}
              <StyledCard>{t('fields.ex5')}</StyledCard>
            </li>
          </MultipleEx>
          <Padded>{t('fields.text2')}</Padded>
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

        {Object.keys(indexes).map(idx => (
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
          <Typography variant="h5">{t('wildcard')}</Typography>
          <Padded>{t('wildcard.text')}</Padded>
          <StyledCard>{t('wildcard.ex')}</StyledCard>
          <Padded>{t('wildcard.text2')}</Padded>
          <div>
            <b>
              <i>{`${t('wildcard.note')}:`}</i>
            </b>
            {` ${t('wildcard.note.text')}`}
          </div>
        </Paragraph>

        <Paragraph id="regex">
          <Typography variant="h5">{t('regex')}</Typography>
          <Padded>{t('regex.text')}</Padded>
          <StyledCard>{t('regex.ex')}</StyledCard>
          <div>
            <b>
              <i>{t('regex.warning')}</i>
            </b>
          </div>
          <Padded>{t('regex.warning.text')}</Padded>
          <StyledCard>{t('regex.warning.ex')}</StyledCard>
          <Padded>{t('regex.warning.follow')}</Padded>
        </Paragraph>

        <Paragraph id="regex.anchoring">
          <Typography variant="h6">{t('regex.anchoring')}</Typography>
          <Padded>{t('regex.anchoring.text')}</Padded>
          <Padded>{t('regex.anchoring.text2')}</Padded>
          <StyledCard>{t('regex.anchoring.ex')}</StyledCard>
        </Paragraph>

        <Paragraph id="regex.chars">
          <Typography variant="h6">{t('regex.chars')}</Typography>
          <Padded>{t('regex.chars.text')}</Padded>
          <StyledCard>{t('regex.chars.ex')}</StyledCard>
          <Padded>{t('regex.chars.text2')}</Padded>
          <Padded>{t('regex.chars.text3')}</Padded>
          <StyledCard>{t('regex.chars.ex2')}</StyledCard>
        </Paragraph>

        <Paragraph id="regex.any">
          <Typography variant="h6">{t('regex.any')}</Typography>
          <Padded>{t('regex.any.text')}</Padded>
          <StyledCard>{t('regex.any.ex')}</StyledCard>
        </Paragraph>

        <Paragraph id="regex.oneplus">
          <Typography variant="h6">{t('regex.oneplus')}</Typography>
          <Padded>{t('regex.oneplus.text')}</Padded>
          <StyledCard>{t('regex.oneplus.ex')}</StyledCard>
        </Paragraph>

        <Paragraph id="regex.zeroplus">
          <Typography variant="h6">{t('regex.zeroplus')}</Typography>
          <Padded>{t('regex.zeroplus.text')}</Padded>
          <StyledCard>{t('regex.zeroplus.ex')}</StyledCard>
        </Paragraph>

        <Paragraph id="regex.zeroone">
          <Typography variant="h6">{t('regex.zeroone')}</Typography>
          <Padded>{t('regex.zeroone.text')}</Padded>
          <StyledCard>{t('regex.zeroone.ex')}</StyledCard>
        </Paragraph>

        <Paragraph id="regex.minmax">
          <Typography variant="h6">{t('regex.minmax')}</Typography>
          <Padded>{t('regex.minmax.text')}</Padded>
          <StyledCard>{t('regex.minmax.ex')}</StyledCard>
          <Padded>{t('regex.minmax.text2')}</Padded>
          <StyledCard>{t('regex.minmax.ex2')}</StyledCard>
        </Paragraph>

        <Paragraph id="regex.grouping">
          <Typography variant="h6">{t('regex.grouping')}</Typography>
          <Padded>{t('regex.grouping.text')}</Padded>
          <StyledCard>{t('regex.grouping.ex')}</StyledCard>
        </Paragraph>

        <Paragraph id="regex.alternation">
          <Typography variant="h6">{t('regex.alternation')}</Typography>
          <Padded>{t('regex.alternation.text')}</Padded>
          <StyledCard>{t('regex.alternation.ex')}</StyledCard>
        </Paragraph>

        <Paragraph id="regex.class">
          <Typography variant="h6">{t('regex.class')}</Typography>
          <Padded>{t('regex.class.text')}</Padded>
          <StyledCard>{t('regex.class.ex')}</StyledCard>
          <Padded>{t('regex.class.text2')}</Padded>
          <Padded>{t('regex.class.text3')}</Padded>
          <StyledCard>{t('regex.class.ex2')}</StyledCard>
        </Paragraph>

        <Paragraph id="fuzziness">
          <Typography variant="h5">{t('fuzziness')}</Typography>
          <Padded>{t('fuzziness.text')}</Padded>
          <StyledCard>{t('fuzziness.ex')}</StyledCard>
          <Padded>{t('fuzziness.text2')}</Padded>
          <Padded>{t('fuzziness.text3')}</Padded>
          <StyledCard>{t('fuzziness.ex2')}</StyledCard>
        </Paragraph>

        <Paragraph id="proximity">
          <Typography variant="h5">{t('proximity')}</Typography>
          <Padded>{t('proximity.text')}</Padded>
          <StyledCard>{t('proximity.ex')}</StyledCard>
          <Padded>{t('proximity.text2')}</Padded>
        </Paragraph>

        <Paragraph id="ranges">
          <Typography variant="h5">{t('ranges')}</Typography>
          {t('ranges.text')}
          <Typography variant="subtitle2" sx={{ paddingBottom: theme.spacing(1), paddingTop: theme.spacing(1) }}>
            {t('exemples')}
          </Typography>
          <MultipleEx>
            <li>
              {t('ranges.ex1.title')}
              <StyledCard>{t('ranges.ex1')}</StyledCard>
            </li>
            <li>
              {t('ranges.ex2.title')}
              <StyledCard>{t('ranges.ex2')}</StyledCard>
            </li>
            <li>
              {t('ranges.ex3.title')}
              <StyledCard>{t('ranges.ex3')}</StyledCard>
            </li>
            <li>
              {t('ranges.ex4.title')}
              <StyledCard>{t('ranges.ex4')}</StyledCard>
            </li>
            <li>
              {t('ranges.ex5.title')}
              <StyledCard>{t('ranges.ex5')}</StyledCard>
            </li>
            <li>
              {t('ranges.ex6.title')}
              <StyledCard>{t('ranges.ex6')}</StyledCard>
            </li>
            <li>
              {t('ranges.ex7.title')}
              <StyledCard>{t('ranges.ex7')}</StyledCard>
            </li>
          </MultipleEx>
          <Padded>{t('ranges.text2')}</Padded>
          <MultipleEx>
            <li>
              {t('ranges.ex8.title')}
              <StyledCard>{t('ranges.ex8')}</StyledCard>
            </li>
          </MultipleEx>
          <Padded>{t('ranges.text3')}</Padded>
          <StyledCard>{t('ranges.ex9')}</StyledCard>
          <Padded>{t('ranges.text4')}</Padded>
          <StyledCard>{t('ranges.ex10')}</StyledCard>
          <Padded>{t('ranges.text5')}</Padded>
          <StyledCard>{t('ranges.ex11')}</StyledCard>
        </Paragraph>

        <Paragraph id="ranges.datemath">
          <Typography variant="h6">{t('ranges.datemath')}</Typography>
          <Padded>{t('ranges.datemath.text')}</Padded>
          <ul>
            <li>{t('ranges.datemath.list1')}</li>
            <li>{t('ranges.datemath.list2')}</li>
            <li>{t('ranges.datemath.list3')}</li>
          </ul>
          <Padded>{t('ranges.datemath.text2')}</Padded>
          <StyledCard>{t('ranges.datemath.ex1')}</StyledCard>
          <Padded>{t('ranges.datemath.text3')}</Padded>
          <StyledCard>{t('ranges.datemath.ex2')}</StyledCard>
        </Paragraph>

        <Paragraph id="operator">
          <Typography variant="h5">{t('operator')}</Typography>
          <Padded>{t('operator.text')}</Padded>
          <Padded>{t('operator.text2')}</Padded>
          <StyledCard>{t('operator.ex1')}</StyledCard>
          <Padded>{t('operator.text3')}</Padded>
          <ul>
            <li>{t('operator.list1')}</li>
            <li>{t('operator.list2')}</li>
            <li>{t('operator.list3')}</li>
          </ul>
          <Padded>{t('operator.text4')}</Padded>
          <StyledCard>{t('operator.ex2')}</StyledCard>
          <Padded>{t('operator.text5')}</Padded>
        </Paragraph>

        <Paragraph id="grouping">
          <Typography variant="h5">{t('grouping')}</Typography>
          <Padded>{t('grouping.text')}</Padded>
          <StyledCard>{t('grouping.ex')}</StyledCard>
          <Padded>{t('grouping.text2')}</Padded>
          <StyledCard>{t('grouping.ex2')}</StyledCard>
        </Paragraph>

        <Paragraph id="reserved">
          <Typography variant="h5">{t('reserved')}</Typography>
          <Padded>{t('reserved.text')}</Padded>
          <Padded>{t('reserved.text2')}</Padded>
          <StyledCard>{t('reserved.ex')}</StyledCard>
          <Padded>{t('reserved.text3')}</Padded>
          <StyledCard>{t('reserved.ex2')}</StyledCard>
          <Padded>{t('reserved.text4')}</Padded>
          <Padded>
            <b>
              <i>{t('reserved.note')}</i>
            </b>
            {`: ${t('reserved.text5')}`}
          </Padded>
        </Paragraph>
      </ContentWithTOC>
    </PageCenter>
  );
}
