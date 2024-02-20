import { Divider, Typography } from '@mui/material';
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
    whiteSpace: 'pre-wrap'
  },
  truncated: {
    color: theme.palette.text.disabled,
    paddingTop: theme.spacing(1),
    fontSize: 'small'
  },
  title: {
    marginTop: theme.spacing(4)
  },
  divider: {
    '@media print': {
      backgroundColor: '#0000001f !important'
    }
  }
}));

type AIMarkdownProps = {
  markdown: string;
  truncated: boolean;
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

const WrappedAIMarkdown: React.FC<AIMarkdownProps> = ({ markdown, truncated }) => {
  const classes = useStyles();

  return (
    <div>
      {truncated && <div className={classes.truncated}>{t('ai_truncated')}</div>}
      <Markdown
        components={{
          h1: Title,
          h2: Title,
          h3: Title,
          a: props => <code className={classes.codeSpan}>{props.children}</code>,
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
