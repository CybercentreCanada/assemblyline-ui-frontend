import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Button, Collapse, Divider, TextField, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { AppUserAvatar } from 'commons/components/topnav/UserProfile';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { Comment } from 'components/visual/CommentCard';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { io } from 'socket.io-client';
import CommentCard from '../CommentCard';

const useStyles = makeStyles(theme => ({
  commentSection: {
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2)
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
  newCommentSection: {
    top: '64px',
    position: 'sticky',
    backgroundColor: theme.palette.background.paper,
    zIndex: 9000,
    marginTop: theme.spacing(2),
    display: 'grid',
    alignItems: 'start',
    justifyItems: 'end',
    gridTemplateAreas: `"icon input input input" "icon . cancel comment"`,
    gridTemplateColumns: 'auto 1fr auto auto',
    gridTemplateRows: 'auto auto',
    gap: theme.spacing(1.5)
  },
  newCommentIcon: { gridArea: 'icon', fontWeight: 500 },
  newCommentInput: { gridArea: 'input', margin: 0 },
  newCommentCancel: { gridArea: 'cancel' },
  newCommentComment: { gridArea: 'comment' }
}));

type CommentSectionProps = {
  sha256: string;
  comments: Comment[];
};

const SOCKETIO_NAMESPACE = '/file_comments';

const DEFAULT_COMMENT: Comment = { author: { name: '', avatar: '', email: '' }, content: { text: '', date: null } };

const WrappedCommentSection: React.FC<CommentSectionProps> = ({ sha256 = null, comments: cmts }) => {
  const { t } = useTranslation(['fileDetail']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);
  const { apiCall } = useMyAPI();
  const { showSuccessMessage } = useMySnackbar();

  const { user: currentUser } = useALContext();

  const [comments, setComments] = useState<Comment[]>(cmts);
  const [newComment, setNewComment] = useState<Comment>(DEFAULT_COMMENT);
  const [isAddingComment, setIsAddingComment] = useState<boolean>(false);
  const [isEditingComment, setIsEditingComment] = useState<boolean>(false);

  const inputRef = useRef(null);
  const socket = useRef(null);

  const username = useMemo<string>(
    () =>
      !currentUser || !currentUser?.name
        ? ''
        : currentUser?.name
            .split(' ')
            .filter(w => w !== '')
            .splice(0, 2)
            .map(n => (n ? n[0].toUpperCase() : ''))
            .join(''),
    [currentUser]
  );

  const handleRefreshComments = useCallback((file_sha256: string) => {
    if (!file_sha256) return;
    apiCall({
      url: `/api/v4/file/comment/${file_sha256}/`,
      onSuccess: api_data => {
        setComments(api_data.api_response);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCommentChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewComment(nc => ({ ...nc, content: { ...nc.content, text: e.target.value } }));
  }, []);

  const handleAddComment = useCallback(
    (_comment: Comment) => {
      apiCall({
        method: 'PUT',
        url: `/api/v4/file/comment/${sha256}/`,
        body: { text: _comment?.content?.text },
        onSuccess: api_data => {
          setComments(api_data.api_response);
          setNewComment(DEFAULT_COMMENT);
          setIsAddingComment(false);
          socket.current.emit('comments_change', { sha256: sha256 });
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sha256]
  );

  const handleIsAddingComment = useCallback((_isEditingComment: boolean) => {
    if (_isEditingComment) return;
    setIsAddingComment(true);
  }, []);

  const handleIsEditingComment = useCallback(
    (_comments: Comment[]) => (cid: string) => {
      const commentToBeEdited = _comments.find(c => c?.cid === cid);
      if (!commentToBeEdited) return;
      inputRef.current.focus();
      setIsEditingComment(true);
      setIsAddingComment(false);
      setNewComment(commentToBeEdited);
    },
    []
  );

  const handleEditComment = useCallback(
    (comment: Comment) => {
      if (!sha256) return;
      apiCall({
        method: 'POST',
        url: `/api/v4/file/comment/${sha256}/${comment?.cid}/`,
        body: { text: comment?.content?.text },
        onSuccess: api_data => {
          setComments(cs =>
            cs.map(c =>
              c?.cid === comment?.cid ? { ...c, content: { ...c?.content, text: comment?.content?.text } } : c
            )
          );
          setNewComment(DEFAULT_COMMENT);
          setIsEditingComment(false);
          setIsAddingComment(false);
          socket.current.emit('comments_change', { sha256: sha256 });
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sha256]
  );

  const handleDeleteComment = useCallback(
    (cid: string) => {
      if (!cid || !sha256) return;
      apiCall({
        method: 'DELETE',
        url: `/api/v4/file/comment/${sha256}/${cid}/`,
        onSuccess: api_data => {
          setComments(cs => cs.filter(c => c?.cid !== cid));
          socket.current.emit('comments_change', { sha256: sha256 });
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sha256]
  );

  const handleCancelComment = useCallback(() => {
    setIsAddingComment(false);
    setIsEditingComment(false);
    setNewComment(DEFAULT_COMMENT);
  }, []);

  useEffect(() => {
    if (!sha256) return;
    handleRefreshComments(sha256);
  }, [handleRefreshComments, sha256]);

  useEffect(() => {
    if (!sha256) return;

    socket.current = io(SOCKETIO_NAMESPACE);

    socket.current.on('connect', () => {
      // eslint-disable-next-line no-console
      console.debug('Socket-IO :: Connected from socketIO server.');
      socket.current.emit('enter_room', { sha256: sha256 });
    });

    socket.current.on('disconnect', () => {
      // eslint-disable-next-line no-console
      console.debug('Socket-IO :: Disconnected from socketIO server.');
    });

    socket.current.on('refresh_comments', () => {
      // eslint-disable-next-line no-console
      console.debug('Socket-IO :: Someone made a new comment');
      handleRefreshComments(sha256);
    });

    return () => {
      socket.current.emit('leave_room', { sha256: sha256 });
      socket.current.disconnect();
    };
  }, [handleRefreshComments, sha256]);

  return (
    <div className={classes.commentSection}>
      <Typography
        className={classes.title}
        variant="h6"
        onClick={() => {
          setOpen(!open);
        }}
      >
        <span>{t('comments')}</span>
        {open ? <ExpandLess /> : <ExpandMore />}
      </Typography>
      <Divider />

      <Collapse in={open} timeout="auto">
        <div className={classes.newCommentSection}>
          <AppUserAvatar
            className={classes.newCommentIcon}
            children={username}
            alt={currentUser.name}
            url={currentUser.avatar}
            email={currentUser.email}
          />
          <TextField
            className={classes.newCommentInput}
            type="text"
            inputRef={inputRef}
            placeholder={t('comment.placeholder')}
            multiline
            maxRows={3}
            fullWidth
            value={newComment?.content?.text}
            size="small"
            margin="dense"
            onFocus={() => handleIsAddingComment(isEditingComment)}
            onChange={handleCommentChange}
          />
          {(isAddingComment || isEditingComment) && (
            <Button
              className={classes.newCommentCancel}
              children={t('cancel')}
              onClick={handleCancelComment}
              variant="outlined"
              size="small"
            />
          )}
          {isAddingComment && (
            <Button
              className={classes.newCommentComment}
              children={t('comment')}
              onClick={() => handleAddComment(newComment)}
              variant="contained"
              size="small"
            />
          )}
          {isEditingComment && (
            <Button
              className={classes.newCommentComment}
              children={t('update')}
              onClick={() => handleEditComment(newComment)}
              variant="contained"
              size="small"
            />
          )}
        </div>

        {comments && comments.length !== 0 && (
          <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
            {comments.map((comment, i) => (
              <CommentCard
                key={comment?.cid && i}
                comment={comment}
                onEdit={handleIsEditingComment(comments)}
                onDelete={handleDeleteComment}
              />
            ))}
          </div>
        )}
      </Collapse>
    </div>
  );
};

const CommentSection = React.memo(WrappedCommentSection);
export default CommentSection;
