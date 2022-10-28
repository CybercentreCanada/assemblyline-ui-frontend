import { Box, Collapse, Divider, IconButton, makeStyles, Tooltip, Typography, useTheme } from '@material-ui/core';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import { Skeleton } from '@material-ui/lab';
import useHighlighter from 'components/hooks/useHighlighter';
import useSafeResults from 'components/hooks/useSafeResults';
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
  force?: boolean;
  forcedShown?: Set<string>;
  setForcedShown?: any;
};

const isVisible = (curItem, forcedShown, isHighlighted) =>
  curItem.score > 0 ||
  forcedShown.has(curItem.sha256) ||
  isHighlighted(curItem.sha256) ||
  (curItem.children && Object.values(curItem.children).some(c => isVisible(c, forcedShown, isHighlighted)));

const WrappedFileTreeSection: React.FC<FileTreeProps> = ({ tree, sid, force = false }) => {
  const { t } = useTranslation(['submissionDetail']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);
  const [forcedShown, setForcedShown] = React.useState<Set<string>>(new Set());

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
            <FileTree tree={tree} sid={sid} force={force} forcedShown={forcedShown} setForcedShown={setForcedShown} />
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

const WrappedFileTree: React.FC<FileTreeProps> = ({ tree, sid, forcedShown, setForcedShown, force = false }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const classes = useStyles();
  const history = useHistory();
  const { isHighlighted } = useHighlighter();
  const { showSafeResults } = useSafeResults();

  return (
    <>
      {Object.keys(tree).map((sha256, i) => {
        const item = tree[sha256];
        return !isVisible(tree[sha256], forcedShown, isHighlighted) ||
          (item.score < 0 && !showSafeResults && !force) ? null : (
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
                {item.children && Object.values(item.children).some(c => !isVisible(c, forcedShown, isHighlighted)) ? (
                  <Tooltip title={t('more')}>
                    <IconButton
                      size="small"
                      style={{ padding: 0 }}
                      onClick={event => {
                        event.stopPropagation();
                        const tempForcedShown = new Set([...Array.from(forcedShown)]);
                        Object.values(item.children).forEach(tempItem => tempForcedShown.add(tempItem.sha256));
                        setForcedShown(tempForcedShown);
                      }}
                    >
                      <ArrowRightIcon />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <span style={{ marginLeft: theme.spacing(3) }} />
                )}
                <Verdict score={item.score} mono short />
                {`:: ${item.name.join(' | ')} `}
                <span style={{ fontSize: '80%', color: theme.palette.text.secondary }}>{`[${item.type}]`}</span>
              </span>
            </Box>
            <div style={{ marginLeft: theme.spacing(3) }}>
              <FileTree
                tree={item.children}
                sid={sid}
                force={force}
                forcedShown={forcedShown}
                setForcedShown={setForcedShown}
              />
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
