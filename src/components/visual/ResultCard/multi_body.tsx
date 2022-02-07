import React from 'react';
import { useTranslation } from 'react-i18next';
import { GraphBody } from './graph_body';
import { ImageBody } from './image_body';
import { JSONBody } from './json_body';
import { KVBody } from './kv_body';
import { MemDumpBody } from './memdump_body';
import { ProcessTreeBody } from './process_tree_body';
import { TblBody } from './table_body';
import { TextBody } from './text_body';
import { URLBody } from './url_body';

const WrappedMultiBody = ({ body, printable = false }) => {
  const { t } = useTranslation(['fileDetail']);
  return body ? (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {body.map((part, idx) => (
        <div key={idx}>
          {(() => {
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
              case 'PROCESS_TREE':
                return <ProcessTreeBody body={part[1]} />;
              case 'TABLE':
                return <TblBody body={part[1]} printable={printable} />;
              case 'IMAGE':
                return <ImageBody body={part[1]} printable={printable} />;
              case 'MULTI':
                return <MultiBody body={part[1]} printable={printable} />;
              default:
                return <div style={{ margin: '2rem' }}>{t('invalid_section')}</div>;
            }
          })()}
        </div>
      ))}
    </div>
  ) : null;
};

export const MultiBody = React.memo(WrappedMultiBody);
