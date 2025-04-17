import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Box, Button, Collapse, Divider, IconButton, Skeleton, Tooltip, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useHighlighter from 'components/hooks/useHighlighter';
import useSafeResults from 'components/hooks/useSafeResults';
import type { SubmissionTree, Tree } from 'components/models/ui/submission';
import Verdict from 'components/visual/Verdict';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';

const MAX_FILE_COUNT = 500;

const useStyles = makeStyles(theme => ({
  file_item: {
    cursor: 'pointer',
    '&:hover, &:focus': {
      backgroundColor: theme.palette.action.hover
    },
    flexGrow: 1,
    width: '100%',
    all: 'unset'
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  },
  noMaxWidth: {
    maxWidth: 'none'
  }
}));

const isVisible = (curItem, forcedShown, isHighlighted, showSafeResults) =>
  (curItem.score < 0 && !showSafeResults) ||
  curItem.score > 0 ||
  forcedShown.includes(curItem.sha256) ||
  isHighlighted(curItem.sha256) ||
  (curItem.children &&
    Object.values(curItem.children).some(c => isVisible(c, forcedShown, isHighlighted, showSafeResults)));

type FileTreeSectionProps = {
  tree: SubmissionTree['tree'];
  sid: string;
  baseFiles: string[];
  force?: boolean;
};

const WrappedFileTreeSection: React.FC<FileTreeSectionProps> = ({ tree, sid, baseFiles, force = false }) => {
  const { t } = useTranslation(['submissionDetail']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);
  const [forcedShown, setForcedShown] = React.useState<Array<string>>([]);

  useEffect(() => {
    if (baseFiles && forcedShown.length === 0) {
      setForcedShown([...baseFiles]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseFiles]);

  return (
    <div style={{ paddingTop: sp2 }}>
      <Typography
        variant="h6"
        onClick={() => {
          setOpen(!open);
        }}
        className={classes.title}
      >
        <span>{t('tree')}</span>
        {open ? <ExpandLess /> : <ExpandMore />}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        <div style={{ paddingTop: sp2 }}>
          {tree !== null ? (
            <FileTree tree={tree} sid={sid} force={force} defaultForceShown={forcedShown} />
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

type FileTreeProps = {
  tree: SubmissionTree['tree'];
  sid: string;
  force: boolean;
  defaultForceShown: Array<string>;
};

const WrappedFileTree: React.FC<FileTreeProps> = ({ tree, sid, defaultForceShown, force = false }) => {
  const { t } = useTranslation(['submissionDetail']);
  const theme = useTheme();
  const classes = useStyles();
  const navigate = useNavigate();
  const { isHighlighted } = useHighlighter();
  const { showSafeResults } = useSafeResults();

  const [forcedShown, setForcedShown] = useState<string[]>([...defaultForceShown]);
  const [maxChildCount, setMaxChildCount] = useState<number>(MAX_FILE_COUNT);

  const files = useMemo<[string, Tree][]>(
    () =>
      Object.entries(tree)
        .sort((a: [string, Tree], b: [string, Tree]) => (a[1].name.join() > b[1].name.join() ? 1 : -1))
        .reduce(
          (prev, [sha256, item]: [string, Tree]) =>
            !isVisible(tree[sha256], defaultForceShown, isHighlighted, showSafeResults) ||
            (item.score < 0 && !showSafeResults && !force) ||
            prev.length > maxChildCount
              ? [...prev]
              : [...prev, [sha256, item]],
          [] as [string, Tree][]
        ),
    [defaultForceShown, force, isHighlighted, maxChildCount, showSafeResults, tree]
  );

  return (
    <>
      {files.map(([sha256, item], i) => (
        <div key={i}>
          <div style={{ display: 'flex', width: '100%', alignItems: 'flex-start' }}>
            {item.children &&
            Object.values(item.children).some(c => !isVisible(c, forcedShown, isHighlighted, showSafeResults)) ? (
              <Tooltip title={t('tree_more')}>
                <IconButton
                  size="small"
                  style={{ padding: 0 }}
                  onClick={() => {
                    setForcedShown([...forcedShown, ...Object.keys(item.children)]);
                  }}
                >
                  <ArrowRightIcon />
                </IconButton>
              </Tooltip>
            ) : item.children && Object.keys(item.children).some(key => forcedShown.includes(key)) ? (
              <Tooltip title={t('tree_less')}>
                <IconButton
                  size="small"
                  style={{ padding: 0 }}
                  onClick={event => {
                    const excluded = Object.keys(item.children);
                    setForcedShown(forcedShown.filter(val => !excluded.includes(val)));
                  }}
                >
                  <ArrowDropDownIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <span style={{ marginLeft: theme.spacing(3) }} />
            )}
            <Box
              className={classes.file_item}
              component={item.sha256 ? Link : 'span'}
              to={`/file/detail/${item.sha256}`}
              onClick={e => {
                e.preventDefault();
                if (item.sha256) navigate(`/submission/detail/${sid}/${item.sha256}?name=${encodeURI(item.name[0])}`);
              }}
              style={{
                wordBreak: 'break-word',
                backgroundColor: isHighlighted(sha256) ? (theme.palette.mode === 'dark' ? '#343a44' : '#d8e3ea') : null
              }}
            >
              <div style={{ display: 'flex' }}>
                <span style={{ whiteSpace: 'nowrap', paddingRight: '4px' }}>
                  <Verdict score={item.score} mono short />
                  <span>::</span>
                </span>
                <span style={{ alignSelf: 'center', paddingTop: '2px' }}>
                  <span style={{ paddingRight: '4px', unicodeBidi: 'isolate-override' }}>
                    {item.name.sort().join(' | ')}
                  </span>
                  <span style={{ fontSize: '80%', color: theme.palette.text.secondary }}>{`[${item.type}]`}</span>
                </span>
              </div>
            </Box>
          </div>
          <div style={{ marginLeft: theme.spacing(3) }}>
            <FileTree tree={item.children} sid={sid} force={force} defaultForceShown={forcedShown} />
          </div>
        </div>
      ))}
      {files.length <= maxChildCount ? null : (
        <Tooltip title={t('show_more')}>
          <Button
            color="inherit"
            size="small"
            style={{ padding: 0 }}
            onClick={() => setMaxChildCount(v => v + MAX_FILE_COUNT)}
          >
            <MoreHorizIcon />
          </Button>
        </Tooltip>
      )}
    </>
  );
};

const FileTree = React.memo(WrappedFileTree);
const FileTreeSection = React.memo(WrappedFileTreeSection);

export default FileTreeSection;
