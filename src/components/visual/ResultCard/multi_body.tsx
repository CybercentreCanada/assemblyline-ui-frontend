import { Divider, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { GraphBody } from './graph_body';
import { ImageBody } from './image_body';
import { JSONBody } from './json_body';
import { KVBody } from './kv_body';
import { MemDumpBody } from './memdump_body';
import { OrderedKVBody } from './ordered_kv_body';
import { ProcessTreeBody } from './process_tree_body';
import { TblBody } from './table_body';
import { TextBody } from './text_body';
import { URLBody } from './url_body';

const useStyles = makeStyles(theme => ({
  divider: {
    '@media print': {
      backgroundColor: '#0000001f !important'
    }
  }
}));

const WrappedMultiBody = ({ body, printable = false }) => {
  const { t } = useTranslation(['fileDetail']);
  const classes = useStyles();
  const theme = useTheme();
  return body ? (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(1) }}>
      {body.map((part, idx) => (
        <div key={idx}>
          {part[1]
            ? (() => {
                switch (part[0]) {
                  case 'TEXT':
                    return <TextBody body={part[1]} />;
                  case 'MEMORY_DUMP':
                    return <MemDumpBody body={part[1]} />;
                  case 'GRAPH_DATA':
                    return <GraphBody body={part[1]} />;
                  case 'URL':
                    return <URLBody body={part[1]} />;
                  case 'JSON':
                    return <JSONBody body={part[1]} printable={printable} />;
                  case 'KEY_VALUE':
                    return <KVBody body={part[1]} />;
                  case 'ORDERED_KEY_VALUE':
                    return <OrderedKVBody body={part[1]} />;
                  case 'PROCESS_TREE':
                    return <ProcessTreeBody body={part[1]} />;
                  case 'TABLE':
                    return (
                      <TblBody
                        body={part[1]}
                        printable={printable}
                        order={part.length === 3 ? part[2].column_order : []}
                      />
                    );
                  case 'IMAGE':
                    return <ImageBody body={part[1]} printable={printable} />;
                  case 'MULTI':
                    return <MultiBody body={part[1]} printable={printable} />;
                  default:
                    return <div style={{ margin: '2rem' }}>{t('invalid_section')}</div>;
                }
              })()
            : part[0] === 'DIVIDER' && <Divider className={classes.divider} />}
        </div>
      ))}
    </div>
  ) : null;
};

export const MultiBody = React.memo(WrappedMultiBody);
