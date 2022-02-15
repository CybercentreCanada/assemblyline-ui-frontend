import { default as React } from 'react';

export const WrappedTextBody = ({ body }) => (
  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{body}</div>
);
export const TextBody = React.memo(WrappedTextBody);
