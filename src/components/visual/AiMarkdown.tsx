import makeStyles from '@mui/styles/makeStyles';
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
  }
}));

type AIMarkdownProps = {
  markdown: string;
};

const WrappedAIMarkdown: React.FC<AIMarkdownProps> = ({ markdown }) => {
  const classes = useStyles();

  return (
    <Markdown
      components={{
        a: props => <b>{props.children}</b>,
        code: props => <code className={classes.codeSpan}>{props.children}</code>
      }}
    >
      {markdown}
    </Markdown>
  );
};
const AIMarkdown = React.memo(WrappedAIMarkdown);

export default AIMarkdown;
