import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import {
  Button,
  ButtonGroup,
  CircularProgress,
  Fade,
  Paper,
  Popper,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import { AppUserAvatar } from 'commons/components/topnav/UserProfile';
import useALContext from 'components/hooks/useALContext';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';

const useStyles = makeStyles(theme => ({
  comment: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(1),
    margin: `${theme.spacing(0.5)} 0 0 0`
  },
  diffComment: {
    margin: `${theme.spacing(2)} 0 0 0`
  },
  icon: {
    alignSelf: 'start',
    minWidth: '40px'
  },
  container: {
    flex: 1,
    display: 'grid',
    gridTemplateAreas: `"input input input" ". cancel button"`,
    gridTemplateColumns: '1fr auto auto',
    gridTemplateRows: 'auto auto',
    gap: theme.spacing(1)
  },

  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    padding: `${theme.spacing(1)} ${theme.spacing(1.75)}`
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(1.5)
  },
  textfield: {
    gridArea: 'input',
    margin: 0
  },
  cancel: { gridArea: 'cancel' },
  add: { gridArea: 'button' },
  edit: { gridArea: 'button' },
  name: { gridArea: 'name', fontWeight: 500 },
  date: { gridArea: 'date', color: theme.palette.text.secondary },
  text: { gridArea: 'text' },
  authorText: { borderColor: theme.palette.primary.main },
  hide: { display: 'none' },
  actions: { backgroundColor: theme.palette.background.paper },
  action: {
    padding: `${theme.spacing(0.25)} ${theme.spacing(0.5)}`,
    minWidth: 'auto !important'
  },
  tooltip: {
    backgroundColor: theme.palette.grey[700],
    marginTop: `${theme.spacing(1)} !important`
  },
  progress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  }
}));

export type Comment = {
  cid?: string;
  uname?: string;
  text?: string;
  date?: string;
};

export type Author = {
  name?: string;
  avatar?: string;
  email?: string;
};

export const DEFAULT_COMMENT: Comment = {
  cid: null,
  uname: null,
  text: '',
  date: null
};

export const DEFAULT_AUTHOR: Author = { name: null, avatar: null, email: null };

export type CommentProp = {
  comment: Comment;
  successCallback?: (comment: Comment) => void;
  finalizeCallback?: () => void;
};

type Props = {
  currentComment?: Comment;
  previousComment?: Comment;
  currentAuthor?: Author;
  previousAuthor?: Author;
  isAdding?: boolean;
  onAddComment?: ({ comment, successCallback = () => null, finalizeCallback = () => null }: CommentProp) => void;
  onEditComment?: ({ comment, successCallback = () => null, finalizeCallback = () => null }: CommentProp) => void;
  onDeleteComment?: ({ comment, successCallback = () => null, finalizeCallback = () => null }: CommentProp) => void;
};

const CALENDAR_STRINGS = {
  fr: {
    sameDay: 'H[h]mm',
    lastDay: '[Hier] H[h]mm',
    lastWeek: 'dddd H[h]mm ',
    sameElse: 'Do MMMM YYYY H[h]mm'
  },
  en: {
    sameDay: 'h:mm a',
    lastDay: '[Yesterday] h:mm a',
    lastWeek: 'dddd h:mm a',
    sameElse: 'MMMM D YYYY, h:mm a'
  }
};

const WrappedCommentCard: React.FC<Props> = ({
  currentComment = DEFAULT_COMMENT,
  previousComment = null,
  currentAuthor = DEFAULT_AUTHOR,
  previousAuthor = DEFAULT_AUTHOR,
  isAdding = false,
  onAddComment = () => null,
  onEditComment = () => null,
  onDeleteComment = () => null
}) => {
  const { t, i18n } = useTranslation(['fileDetail']);
  const classes = useStyles();
  const { user: currentUser } = useALContext();

  const [comment, setComment] = useState<Comment>(currentComment);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);
  const inputRef = useRef(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const actionsOpen = Boolean(anchorEl);

  const username = useMemo<string>(
    () =>
      (currentAuthor?.name || currentUser?.name || '')
        .split(' ')
        .filter(w => w !== '')
        .splice(0, 2)
        .map(n => (n ? n[0].toUpperCase() : ''))
        .join(''),
    [currentAuthor?.name, currentUser?.name]
  );

  const calendar = useMemo<(typeof CALENDAR_STRINGS)['en']>(
    () => (i18n.language in CALENDAR_STRINGS ? CALENDAR_STRINGS[i18n.language] : true),
    [i18n.language]
  );

  const isSameAuthor = useMemo<boolean>(
    () => currentAuthor?.name === previousAuthor?.name,
    [currentAuthor?.name, previousAuthor?.name]
  );

  const isNarrowTimeSpan = useMemo<boolean>(
    () => Date.parse(previousComment?.date) - Date.parse(currentComment?.date) < 5 * 60 * 1000,
    [currentComment?.date, previousComment?.date]
  );

  const handleTextChange = useCallback(
    (loading: boolean) => (e: React.ChangeEvent<any>) => {
      if (!loading) setComment(c => ({ ...c, text: e.target.value }));
    },
    []
  );

  const handleTextFocus = useCallback((e: React.FocusEvent<any, Element>) => {
    setIsEditing(true);
    e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length);
  }, []);

  const handleCancelClick = useCallback(
    (c: Comment) => () => {
      setComment(c);
      setIsEditing(false);
    },
    []
  );

  const handleAddClick = useCallback(
    (c: Comment) => () => {
      setIsLoading(true);
      const successCallback = () => {
        setComment(DEFAULT_COMMENT);
        setIsEditing(false);
        inputRef.current.blur();
      };
      const finalizeCallback = () => setIsLoading(false);
      onAddComment({ comment: c, successCallback, finalizeCallback });
    },
    [onAddComment]
  );

  const handleEditClick = useCallback(
    (c: Comment) => () => {
      setIsLoading(true);
      const successCallback = (newComment: Comment) => {
        setComment(newComment);
        setIsEditing(false);
        setIsLoading(false);
        inputRef.current.blur();
      };
      const finalizeCallback = () => setIsLoading(false);
      onEditComment({ comment: c, successCallback, finalizeCallback });
    },
    [onEditComment]
  );

  const handlePopoverOpen = useCallback(() => setAnchorEl(contentRef.current), []);

  const handlePopoverClose = useCallback(() => setAnchorEl(null), []);

  const handleEditAction = useCallback(
    () => () => {
      setIsEditing(true);
      setAnchorEl(null);
      setTimeout(() => {
        inputRef.current.focus();
      }, 0);
    },
    []
  );

  const handleDeleteAction = useCallback(
    (c: Comment) => () => {
      setIsLoading(true);
      const finalizeCallback = () => setIsLoading(false);
      onDeleteComment({ comment: c, finalizeCallback });
    },
    [onDeleteComment]
  );

  const handleTextKeyDown = useCallback(
    (c: Comment, loading: boolean) => (e: React.KeyboardEvent<any>) => {
      if (loading) return;
      e.stopPropagation();

      if (e.code === 'Escape') {
        setComment(c);
        setIsEditing(false);
        inputRef.current.blur();
      } else if (e.code === 'Enter' && (e.altKey || e.ctrlKey)) {
        if (isAdding) handleAddClick(c)();
        else handleEditClick(c)();
      }
    },
    [handleAddClick, handleEditClick, isAdding]
  );

  useEffect(() => setComment(currentComment), [currentComment]);

  return (
    <div className={clsx(classes.comment, (isAdding || !isSameAuthor || !isNarrowTimeSpan) && classes.diffComment)}>
      <div className={classes.icon}>
        {isAdding || !isSameAuthor ? (
          <AppUserAvatar
            children={username}
            alt={isAdding ? currentUser.name : currentAuthor.name}
            url={isAdding ? currentUser.avatar : currentAuthor.avatar}
            email={isAdding ? currentUser.email : currentAuthor.email}
          />
        ) : (
          <div />
        )}
      </div>

      <div className={clsx(classes.container, !isAdding && !isEditing && classes.hide)}>
        <TextField
          className={classes.textfield}
          value={comment?.text}
          inputRef={inputRef}
          type="text"
          placeholder={isAdding ? t('comment.placeholder.add') : t('comment.placeholder.edit')}
          multiline
          maxRows={3}
          fullWidth
          size="small"
          margin="dense"
          onChange={handleTextChange(isLoading)}
          onFocus={handleTextFocus}
          onKeyDown={handleTextKeyDown(comment, isLoading)}
        />
        {isEditing && (
          <Tooltip classes={{ tooltip: classes.tooltip }} title={t('comment.shortcut.cancel')}>
            <Button
              className={classes.cancel}
              variant="outlined"
              size="small"
              disabled={isLoading}
              onClick={handleCancelClick(currentComment)}
            >
              {t('cancel')}
              {isLoading && <CircularProgress className={classes.progress} size={24} />}
            </Button>
          </Tooltip>
        )}
        {isAdding && isEditing && (
          <Tooltip classes={{ tooltip: classes.tooltip }} title={t('comment.shortcut.submit')}>
            <Button
              className={classes.add}
              variant="contained"
              size="small"
              disabled={isLoading}
              onClick={handleAddClick(comment)}
            >
              {t('comment')}
              {isLoading && <CircularProgress className={classes.progress} size={24} />}
            </Button>
          </Tooltip>
        )}
        {!isAdding && isEditing && (
          <Tooltip classes={{ tooltip: classes.tooltip }} title={t('comment.shortcut.submit')}>
            <Button
              className={classes.edit}
              variant="contained"
              size="small"
              disabled={isLoading}
              onClick={handleEditClick(comment)}
            >
              {t('update')}
              {isLoading && <CircularProgress className={classes.progress} size={24} />}
            </Button>
          </Tooltip>
        )}
      </div>

      {!isAdding && !isEditing && (
        <Paper
          className={clsx(classes.content, currentAuthor?.email === currentUser?.email && classes.authorText)}
          ref={contentRef}
          variant="outlined"
          onMouseEnter={handlePopoverOpen}
          onMouseLeave={handlePopoverClose}
        >
          {(!isSameAuthor || !isNarrowTimeSpan) && (
            <div className={classes.header}>
              {!isSameAuthor && (
                <Typography className={classes.name} variant="body1">
                  {currentAuthor?.name}
                </Typography>
              )}
              {(!isSameAuthor || !isNarrowTimeSpan) && (
                <Typography className={classes.date} variant="body2">
                  <Moment calendar={calendar} locale={i18n.language} children={comment?.date} />
                </Typography>
              )}
            </div>
          )}

          <Typography className={classes.text} variant="body2">
            {comment?.text}
          </Typography>

          <Popper open={actionsOpen} anchorEl={anchorEl} placement="top-end" transition disablePortal>
            {({ TransitionProps }) => (
              <Fade {...TransitionProps} timeout={350}>
                <ButtonGroup className={classes.actions} variant="outlined" color="inherit">
                  <Tooltip classes={{ tooltip: classes.tooltip }} title={t('comment.popper.edit')}>
                    <Button className={classes.action} size="small" onClick={handleEditAction()}>
                      <CreateOutlinedIcon />
                    </Button>
                  </Tooltip>
                  <Tooltip classes={{ tooltip: classes.tooltip }} title={t('comment.popper.delete')}>
                    <Button className={classes.action} size="small" onClick={handleDeleteAction(comment)}>
                      <ClearOutlinedIcon />
                    </Button>
                  </Tooltip>
                </ButtonGroup>
              </Fade>
            )}
          </Popper>
        </Paper>
      )}
    </div>
  );
};

export const CommentCard = React.memo(WrappedCommentCard);
export default CommentCard;
