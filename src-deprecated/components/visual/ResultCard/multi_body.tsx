import { Divider, useTheme } from '@mui/material';
import type { MultiBody as MultiData } from 'components/models/base/result_body';
import { GraphBody } from 'components/visual/ResultCard/graph_body';
import { ImageBody } from 'components/visual/ResultCard/image_body';
import { JSONBody } from 'components/visual/ResultCard/json_body';
import { KVBody } from 'components/visual/ResultCard/kv_body';
import { MemDumpBody } from 'components/visual/ResultCard/memdump_body';
import { OrderedKVBody } from 'components/visual/ResultCard/ordered_kv_body';
import { ProcessTreeBody } from 'components/visual/ResultCard/process_tree_body';
import { TblBody } from 'components/visual/ResultCard/table_body';
import { TextBody } from 'components/visual/ResultCard/text_body';
import { URLBody } from 'components/visual/ResultCard/url_body';
import React from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  body: MultiData;
  printable?: boolean;
};

const WrappedMultiBody = ({ body, printable = false }: Props) => {
  const { t } = useTranslation(['fileDetail']);
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
            : part[0] === 'DIVIDER' && (
                <Divider
                  sx={{
                    '@media print': {
                      backgroundColor: '#0000001f !important'
                    }
                  }}
                />
              )}
        </div>
      ))}
    </div>
  ) : null;
};

export const MultiBody = React.memo(WrappedMultiBody);
