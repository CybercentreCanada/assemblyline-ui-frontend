import type { Theme } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme } from '@mui/material';
import { withStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import type { TableBody as TableData } from 'components/models/base/result_body';
import { KVBody } from 'components/visual/ResultCard/kv_body';
import { TextBody } from 'components/visual/ResultCard/text_body';
import TitleKey from 'components/visual/TitleKey';
import { default as React } from 'react';

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    root: {
      '@media print': {
        color: 'black'
      },
      fontSize: 'inherit',
      lineHeight: 'inherit'
    },
    head: {
      '@media print': {
        color: 'black',
        backgroundColor: '#DDD !important'
      },
      backgroundColor: theme.palette.mode === 'dark' ? '#404040' : '#EEE'
    },
    body: {
      [theme.breakpoints.up('md')]: {
        wordBreak: 'break-word'
      }
    }
  })
)(TableCell);

const StyledTableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      '&:nth-of-type(odd)': {
        '@media print': {
          backgroundColor: '#EEE !important'
        },
        backgroundColor: theme.palette.mode === 'dark' ? '#ffffff08' : '#00000008'
      }
    }
  })
)(TableRow);

type Props = {
  body: TableData;
  printable: boolean;
  order: string[];
};

const WrappedTblBody = ({ body, printable, order }: Props) => {
  const theme = useTheme();

  const headers = [];

  if (!Array.isArray(body)) {
    return <TextBody body={body} />;
  }

  if (body) {
    for (const line of body) {
      for (const th in line) {
        const val = line[th];
        if (val !== null && val !== '') {
          if (!headers.includes(th)) {
            headers.push(th);
          }
        }
      }
    }
  }

  // Set the order of the detected headers, if any
  if (order) {
    headers.sort((a, b) => {
      if (order.indexOf(a) < order.indexOf(b)) {
        return -1;
      } else {
        return 1;
      }
    });
  }

  return (
    body && (
      <TableContainer
        style={{ fontSize: '90%', maxHeight: printable ? null : '500px', maxWidth: printable ? '100%' : null }}
      >
        <Table
          stickyHeader
          size="small"
          sx={{
            root: {
              [theme.breakpoints.down('sm')]: {
                width: printable ? '100%' : 'max-content'
              }
            }
          }}
        >
          <TableHead>
            <TableRow>
              {headers.map((th, id) => (
                <StyledTableCell key={id}>
                  <TitleKey title={th} />
                </StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody style={{ wordBreak: printable ? 'break-word' : null }}>
            {body.map((row, id) => (
              <StyledTableRow key={id}>
                {headers.map((key, hid) => {
                  let value = row[key];
                  if (value instanceof Array) {
                    value = value.join(' | ');
                  } else if (value === true) {
                    value = 'true';
                  } else if (value === false) {
                    value = 'false';
                  } else if (typeof value === 'object' && value !== null && value !== undefined) {
                    value = <KVBody body={value} />;
                  }
                  return <StyledTableCell key={hid}>{value}</StyledTableCell>;
                })}
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )
  );
};

export const TblBody = React.memo(WrappedTblBody);
