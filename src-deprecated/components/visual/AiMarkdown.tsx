import { Divider, styled, Typography, useTheme } from '@mui/material';
import { t } from 'i18next';
import React, { memo } from 'react';
import Markdown from 'react-markdown';

const Code = memo(
  styled('code')(({ theme }) => ({
    '@media print': {
      color: theme.palette.primary.dark
    },
    color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark,
    fontWeight: 800,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    'pre &': {
      color: 'inherit'
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
      <Typography variant="h6">
        <span>{props.children}</span>
      </Typography>
      <Divider
        sx={{
          marginBottom: theme.spacing(1),
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
        marginTop: theme.spacing(1.25),
        marginBottom: theme.spacing(1.25)
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
        components={{
          h1: dense ? TitleDense : Title,
          h2: dense ? TitleDense : Title,
          h3: dense ? TitleDense : Title,
          p: dense ? ParagraphDense : Paragraph,
          a: props => <Code>{props.children}</Code>,
          pre: props => (
            <pre
              style={{
                backgroundColor: theme.palette.mode === 'dark' ? '#FFFFFF10' : '#00000008',
                border: `solid 1px ${theme.palette.divider}`,
                padding: theme.spacing(0.5),
                borderRadius: theme.spacing(0.5)
              }}
            >
              <Code>{props.children}</Code>
            </pre>
          ),
          code: props => <Code>{props.children}</Code>
        }}
      >
        {markdown}
      </Markdown>
    </div>
  );
};
const AIMarkdown = React.memo(WrappedAIMarkdown);

export default AIMarkdown;
