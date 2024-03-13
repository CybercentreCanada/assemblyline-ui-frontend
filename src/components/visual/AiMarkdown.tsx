import { Divider, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { t } from 'i18next';
import React from 'react';
import Markdown from 'react-markdown';
import { ReactMarkdownProps } from 'react-markdown/lib/complex-types';

const useStyles = makeStyles(theme => ({
  codeSpan: {
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
  },
  codeBlock: {
    backgroundColor: theme.palette.mode === 'dark' ? '#FFFFFF10' : '#00000008',
    border: `solid 1px ${theme.palette.divider}`,
    padding: theme.spacing(0.5),
    borderRadius: theme.spacing(0.5)
  },
  truncated: {
    color: theme.palette.text.disabled,
    paddingTop: theme.spacing(1),
    fontSize: 'small'
  },
  title: {
    marginTop: theme.spacing(4)
  },
  dividerDense: {
    marginBottom: theme.spacing(1),
    '@media print': {
      backgroundColor: '#0000001f !important'
    }
  },
  divider: {
    '@media print': {
      backgroundColor: '#0000001f !important'
    }
  },
  paragraphDense: {
    margin: 0,
    marginTop: theme.spacing(1.25),
    marginBottom: theme.spacing(1.25)
  }
}));

type AIMarkdownProps = {
  markdown: string;
  truncated: boolean;
  dense?: boolean;
};

const Title: React.FC<ReactMarkdownProps> = props => {
  const classes = useStyles();

  return (
    <>
      <Typography variant="h6" className={classes.title}>
        <span>{props.children}</span>
      </Typography>
      <Divider className={classes.divider} />
    </>
  );
};

const TitleDense: React.FC<ReactMarkdownProps> = props => {
  const classes = useStyles();

  return (
    <>
      <Typography variant="h6">
        <span>{props.children}</span>
      </Typography>
      <Divider className={classes.dividerDense} />
    </>
  );
};

const Paragraph: React.FC<ReactMarkdownProps> = props => <p>{props.children}</p>;

const ParagraphDense: React.FC<ReactMarkdownProps> = props => {
  const classes = useStyles();

  return <p className={classes.paragraphDense}>{props.children}</p>;
};

const WrappedAIMarkdown: React.FC<AIMarkdownProps> = ({ markdown, truncated, dense = false }) => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <div style={{ margin: dense ? theme.spacing(1.25) : 0 }}>
      {truncated && <div className={classes.truncated}>{t('ai_truncated')}</div>}
      <Markdown
        components={{
          h1: dense ? TitleDense : Title,
          h2: dense ? TitleDense : Title,
          h3: dense ? TitleDense : Title,
          p: dense ? ParagraphDense : Paragraph,
          a: props => <code className={classes.codeSpan}>{props.children}</code>,
          pre: props => (
            <pre className={classes.codeBlock}>
              <code className={classes.codeSpan}>{props.children}</code>
            </pre>
          ),
          code: props => <code className={classes.codeSpan}>{props.children}</code>
        }}
      >
        {markdown}
      </Markdown>
    </div>
  );
};
const AIMarkdown = React.memo(WrappedAIMarkdown);

export default AIMarkdown;
