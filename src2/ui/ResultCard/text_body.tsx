import type { TextBody as TextData } from 'components/models/base/result_body';
import { default as React } from 'react';

type Props = {
  body: TextData;
};

export const WrappedTextBody = ({ body }: Props) => (
  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{body}</div>
);
export const TextBody = React.memo(WrappedTextBody);
