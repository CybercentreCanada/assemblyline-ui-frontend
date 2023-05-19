import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Collapse, Divider, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useMyAPI from 'components/hooks/useMyAPI';
import { Comment, CommentProp } from 'components/visual/CommentCard';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { io } from 'socket.io-client';
import CommentCard from '../CommentCard';

const useStyles = makeStyles(theme => ({
  container: {
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
  }
}));

type CommentSectionProps = {
  sha256: string;
  comments: Comment[];
};

const SOCKETIO_NAMESPACE = '/file_comments';

const WrappedCommentSection: React.FC<CommentSectionProps> = ({ sha256 = null, comments: _comments }) => {
  const { t } = useTranslation(['fileDetail']);
  const classes = useStyles();
  const { apiCall } = useMyAPI();

  const [comments, setComments] = useState<Comment[]>(_comments);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const socket = useRef(null);

  const handleRefreshComments = useCallback((file_sha256: string) => {
    if (!file_sha256) return;
    apiCall({
      method: 'GET',
      url: `/api/v4/file/comment/${file_sha256}/`,
      onSuccess: api_data => {
        setComments(api_data.api_response);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddComment = useCallback(
    ({ comment, successCallback, finalizeCallback }: CommentProp) => {
      apiCall({
        method: 'PUT',
        url: `/api/v4/file/comment/${sha256}/`,
        body: { text: comment?.text },
        onSuccess: api_data => {
          setComments(api_data.api_response);
          successCallback(null);
          socket.current.emit('comments_change', { sha256: sha256 });
        },
        onFinalize: finalizeCallback
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sha256]
  );

  const handleEditComment = useCallback(
    ({ comment, successCallback, finalizeCallback }: CommentProp) => {
      if (!sha256) return;
      apiCall({
        method: 'POST',
        url: `/api/v4/file/comment/${sha256}/${comment?.cid}/`,
        body: { text: comment?.text },
        onSuccess: api_data => {
          successCallback(comment);
          socket.current.emit('comments_change', { sha256: sha256 });
        },
        onFinalize: finalizeCallback
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sha256]
  );

  const handleDeleteComment = useCallback(
    ({ comment, finalizeCallback }: CommentProp) => {
      if (!comment?.cid || !sha256) return;
      apiCall({
        method: 'DELETE',
        url: `/api/v4/file/comment/${sha256}/${comment?.cid}/`,
        onSuccess: api_data => {
          setComments(cs => cs.filter(c => c?.cid !== comment?.cid));
          socket.current.emit('comments_change', { sha256: sha256 });
        },
        onFinalize: finalizeCallback
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sha256]
  );

  useEffect(() => {
    if (sha256) handleRefreshComments(sha256);
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
    <div className={classes.container}>
      <Typography className={classes.title} variant="h6" onClick={() => setIsCollapsed(c => !c)}>
        <span>{t('comments')}</span>
        {!isCollapsed ? <ExpandLess /> : <ExpandMore />}
      </Typography>
      <Divider />
      <Collapse in={!isCollapsed} timeout="auto">
        <CommentCard isAdding onAddComment={handleAddComment} />
        {useMemo(
          () =>
            comments &&
            comments.length !== 0 &&
            comments.map((comment, i) => (
              <CommentCard
                key={`${comment?.cid}`}
                currentComment={comment}
                previousComment={i > 0 ? comments[i - 1] : null}
                nextComment={i < comments.length - 1 ? comments[i + 1] : null}
                onEditComment={handleEditComment}
                onDeleteComment={handleDeleteComment}
              />
            )),
          [comments, handleDeleteComment, handleEditComment]
        )}
      </Collapse>
    </div>
  );
};

const CommentSection = React.memo(WrappedCommentSection);
export default CommentSection;
