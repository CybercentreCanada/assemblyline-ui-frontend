import { Divider, styled, Typography, useTheme } from '@mui/material';
import { t } from 'i18next';
import React, { memo } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Code = memo(
  styled('code')(({ theme }) => ({
    '@media print': {
      color: theme.palette.primary.dark
    },
    color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark,
    fontWeight: 600,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontSize: '0.85em',
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
    padding: '2px 5px',
    borderRadius: '4px',
    'pre &': {
      color: 'inherit',
      backgroundColor: 'transparent',
      padding: 0
    }
  }))
);

type AIMarkdownProps = {
  markdown: string;
  truncated: boolean;
  dense?: boolean;
};

type ReactMarkdownProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;

const Title: React.FC<ReactMarkdownProps> = props => {
  const theme = useTheme();

  return (
    <>
      <Typography
        variant="h6"
        sx={{
          marginTop: theme.spacing(4)
        }}
      >
        <span>{props.children}</span>
      </Typography>
      <Divider
        sx={{
          '@media print': {
            backgroundColor: '#0000001f !important'
          }
        }}
      />
    </>
  );
};

const TitleDense: React.FC<ReactMarkdownProps> = props => {
  const theme = useTheme();

  return (
    <>
      <Typography variant="subtitle1" fontWeight={600}>
        <span>{props.children}</span>
      </Typography>
      <Divider
        sx={{
          marginBottom: theme.spacing(0.5),
          '@media print': {
            backgroundColor: '#0000001f !important'
          }
        }}
      />
    </>
  );
};

const Paragraph: React.FC<ReactMarkdownProps> = props => <p>{props.children}</p>;

const ParagraphDense: React.FC<ReactMarkdownProps> = props => {
  const theme = useTheme();

  return (
    <p
      style={{
        margin: 0,
        marginTop: theme.spacing(0.75),
        marginBottom: theme.spacing(0.75),
        lineHeight: 1.6
      }}
    >
      {props.children}
    </p>
  );
};

const WrappedAIMarkdown: React.FC<AIMarkdownProps> = ({ markdown, truncated, dense = false }) => {
  const theme = useTheme();

  return (
    <div style={{ margin: dense ? theme.spacing(1.25) : 0 }}>
      {truncated && (
        <div
          style={{
            color: theme.palette.text.disabled,
            paddingTop: theme.spacing(1),
            fontSize: 'small'
          }}
        >
          {t('ai_truncated')}
        </div>
      )}
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: dense ? TitleDense : Title,
          h2: dense ? TitleDense : Title,
          h3: dense ? TitleDense : Title,
          p: dense ? ParagraphDense : Paragraph,
          a: props => (
            <a
              href={props.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: theme.palette.primary.main, textDecoration: 'none' }}
            >
              {props.children}
            </a>
          ),
          pre: props => (
            <pre
              style={{
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${theme.palette.divider}`,
                padding: theme.spacing(1.5),
                borderRadius: '6px',
                overflow: 'auto',
                fontSize: '0.85em',
                lineHeight: 1.5,
                margin: `${theme.spacing(1)} 0`
              }}
            >
              {props.children}
            </pre>
          ),
          code: props => <Code>{props.children}</Code>,
          blockquote: props => (
            <blockquote
              style={{
                margin: `${theme.spacing(1)} 0`,
                padding: `${theme.spacing(0.5)} ${theme.spacing(1.5)}`,
                borderLeft: `3px solid ${theme.palette.primary.main}`,
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                borderRadius: '0 4px 4px 0'
              }}
            >
              {props.children}
            </blockquote>
          ),
          ul: props => (
            <ul
              style={{
                margin: `${theme.spacing(0.5)} 0`,
                paddingLeft: theme.spacing(2.5)
              }}
            >
              {props.children}
            </ul>
          ),
          ol: props => (
            <ol
              style={{
                margin: `${theme.spacing(0.5)} 0`,
                paddingLeft: theme.spacing(2.5)
              }}
            >
              {props.children}
            </ol>
          ),
          li: props => <li style={{ marginBottom: theme.spacing(0.25), lineHeight: 1.6 }}>{props.children}</li>,
          table: props => (
            <div style={{ overflowX: 'auto', margin: `${theme.spacing(1)} 0` }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.875em'
                }}
              >
                {props.children}
              </table>
            </div>
          ),
          thead: props => (
            <thead
              style={{
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
              }}
            >
              {props.children}
            </thead>
          ),
          th: props => (
            <th
              style={{
                padding: `${theme.spacing(0.75)} ${theme.spacing(1.5)}`,
                borderBottom: `2px solid ${theme.palette.divider}`,
                textAlign: 'left',
                fontWeight: 600
              }}
            >
              {props.children}
            </th>
          ),
          td: props => (
            <td
              style={{
                padding: `${theme.spacing(0.75)} ${theme.spacing(1.5)}`,
                borderBottom: `1px solid ${theme.palette.divider}`
              }}
            >
              {props.children}
            </td>
          ),
          hr: () => (
            <Divider
              sx={{
                my: 1,
                '@media print': { backgroundColor: '#0000001f !important' }
              }}
            />
          ),
          strong: props => <strong style={{ fontWeight: 600 }}>{props.children}</strong>
        }}
      >
        {markdown}
      </Markdown>
    </div>
  );
};
const AIMarkdown = React.memo(WrappedAIMarkdown);

export default AIMarkdown;
