import makeStyles from '@mui/styles/makeStyles';
import { t } from 'i18next';
import React from 'react';
import Markdown from 'react-markdown';

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
  }
}));

type AIMarkdownProps = {
  markdown: string;
  truncated: boolean;
};

const WrappedAIMarkdown: React.FC<AIMarkdownProps> = ({ markdown, truncated }) => {
  const classes = useStyles();

  return (
    <div>
      {truncated && <div className={classes.truncated}>{t('ai_truncated')}</div>}
      <Markdown
        components={{
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
