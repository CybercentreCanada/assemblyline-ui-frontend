import { Box, Collapse, Divider, makeStyles, Typography, useTheme } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import useHighlighter from 'components/hooks/useHighlighter';
import Verdict from 'components/visual/Verdict';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  file_item: {
    cursor: 'pointer',
    '&:hover, &:focus': {
      backgroundColor: theme.palette.action.hover
    }
  },
  title: {
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  },
  noMaxWidth: {
    maxWidth: 'none'
  }
}));

type FileItemProps = {
  children: {
    [key: string]: FileItemProps;
  };
  name: string[];
  score: number;
  sha256: string;
  size: number;
  truncated: boolean;
  type: string;
};

type FileTreeProps = {
  tree: {
    [key: string]: FileItemProps;
  };
  sid: string;
};

const WrappedFileTreeSection: React.FC<FileTreeProps> = ({ tree, sid }) => {
  const { t } = useTranslation(['submissionDetail']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);

  return (
    <div style={{ paddingTop: sp2 }}>
      <Typography
        variant="h6"
        onClick={() => {
          setOpen(!open);
        }}
        className={classes.title}
      >
        {t('tree')}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        <div style={{ paddingTop: sp2 }}>
          {tree !== null ? (
            <FileTree tree={tree} sid={sid} />
          ) : (
            [...Array(3)].map((_, i) => (
              <div style={{ display: 'flex' }} key={i}>
                <Skeleton style={{ height: '2rem', width: '1.5rem', marginRight: '0.5rem' }} />
                <Skeleton style={{ flexGrow: 1 }} />
              </div>
            ))
          )}
        </div>
      </Collapse>
    </div>
  );
};

const WrappedFileTree: React.FC<FileTreeProps> = ({ tree, sid }) => {
  const theme = useTheme();
  const classes = useStyles();
  const history = useHistory();
  const { isHighlighted } = useHighlighter();

  return (
    <>
      {Object.keys(tree).map((sha256, i) => {
        const item = tree[sha256];
        return (
          <div key={i}>
            <Box
              className={classes.file_item}
              onClick={
                item.sha256
                  ? () => {
                      history.push(`/submission/detail/${sid}/${item.sha256}?name=${encodeURI(item.name[0])}`);
                    }
                  : null
              }
              style={{
                wordBreak: 'break-word',
                backgroundColor: isHighlighted(sha256) ? (theme.palette.type === 'dark' ? '#343a44' : '#d8e3ea') : null
              }}
            >
              <span>
                <Verdict score={item.score} mono short />
                {`:: ${item.name.join(' | ')} `}
                <span style={{ fontSize: '80%', color: theme.palette.text.secondary }}>{`[${item.type}]`}</span>
              </span>
            </Box>
            <div style={{ marginLeft: theme.spacing(3) }}>
              <FileTree tree={item.children} sid={sid} />
            </div>
          </div>
        );
      })}
    </>
  );
};

const FileTree = React.memo(WrappedFileTree);
const FileTreeSection = React.memo(WrappedFileTreeSection);

export default FileTreeSection;
