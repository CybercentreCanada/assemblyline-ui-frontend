import { useTheme } from '@mui/material';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import remarkGfm from 'remark-gfm';

export type MarkdownProps = {
  children?: string;
  slotProps?: {
    strong?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    p?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
  };
};

export const Markdown = React.memo(({ children, slotProps }: MarkdownProps) => {
  const theme = useTheme();

  const borderColor = theme.palette.divider;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        table: ({ children }) => (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              margin: theme.spacing(0.25)
            }}
          >
            {children}
          </table>
        ),
        th: ({ children }) => (
          <th
            style={{
              borderBottom: `2px solid ${borderColor}`,
              padding: theme.spacing(0.5),
              textAlign: 'left'
            }}
          >
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td
            style={{
              borderBottom: `1px solid ${borderColor}`,
              padding: theme.spacing(0.5)
            }}
          >
            {children}
          </td>
        ),
        p: ({ children }) => (
          <p
            {...slotProps?.p}
            style={{
              marginTop: theme.spacing(1),
              marginBottom: theme.spacing(1),
              ...slotProps?.p?.style
            }}
          >
            {children}
          </p>
        ),
        strong: ({ children }) => (
          <strong
            {...slotProps?.strong}
            style={{
              color: theme.palette.text.secondary,
              fontWeight: '600',
              ...slotProps?.strong?.style
            }}
          >
            {children}
          </strong>
        ),
        ul: ({ children }) => (
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: theme.spacing(3) }}>{children}</ul>
        ),
        li: ({ children }) => <li>{children}</li>,
        em: ({ children }) => <em>{children}</em>,
        a: ({ href, children }) => (
          <Link to={href || ''} style={{ color: theme.palette.primary.main, textDecoration: 'underline' }}>
            {children}
          </Link>
        )
      }}
    >
      {children}
    </ReactMarkdown>
  );
});

Markdown.displayName = 'Markdown';
