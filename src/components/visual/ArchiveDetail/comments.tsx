import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import { Author, Comment, DEFAULT_COMMENT } from 'components/models/base/file';
import CommentCard from 'components/visual/CommentCard';
import SectionContainer from 'components/visual/SectionContainer';
import 'moment/locale/fr';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { io } from 'socket.io-client';

const useStyles = makeStyles(theme => ({
  dialog: {
    minWidth: '50vw'
  },
  preview: {
    margin: 0,
    padding: theme.spacing(0.75, 1),
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  }
}));

type Confirmation = {
  open: boolean;
  type: 'add' | 'edit' | 'delete';
};

type Props = {
  sha256: string;
  comments: Comment[];
  drawer?: boolean; // inside the drawer
  nocollapse?: boolean;
};

const SOCKETIO_NAMESPACE = '/file_comments';

const WrappedCommentSection: React.FC<Props> = ({
  sha256 = null,
  comments: commentsProps = [],
  drawer = false,
  nocollapse = false
}) => {
  const { t } = useTranslation(['archive']);
  const theme = useTheme();
  const classes = useStyles();
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useALContext();
  const { showSuccessMessage, showErrorMessage } = useMySnackbar();

  const [comments, setComments] = useState<Comment[]>(commentsProps);
  const [authors, setAuthors] = useState<Author[]>(null);
  const [currentComment, setCurrentComment] = useState<Comment>(DEFAULT_COMMENT);
  const [confirmation, setConfirmation] = useState<Confirmation>({ open: false, type: 'add' });
  const [waiting, setWaiting] = useState<boolean>(false);

  const socket = useRef(null);

  const sortedComments = useMemo<Comment[]>(
    () => (!comments ? [] : comments.sort((c1, c2) => c2?.date.localeCompare(c1?.date))),
    [comments]
  );

  const handleAddConfirmation = useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();
    setConfirmation({ open: true, type: 'add' });
    setCurrentComment(DEFAULT_COMMENT);
  }, []);

  const handleEditConfirmation = useCallback(
    (comment: Comment) => (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      setConfirmation({ open: true, type: 'edit' });
      setCurrentComment(comment);
    },
    []
  );

  const handleDeleteConfirmation = useCallback(
    (comment: Comment) => (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      setConfirmation({ open: true, type: 'delete' });
      setCurrentComment(comment);
    },
    []
  );

  const handleCloseConfirmation = useCallback(() => {
    setConfirmation(c => ({ ...c, open: false }));
  }, []);

  const handleRefreshComments = useCallback(() => {
    if (!sha256) return;
    apiCall({
      method: 'GET',
      url: `/api/v4/archive/comment/${sha256}/`,
      onSuccess: ({ api_response }) => {
        setAuthors(a => ({ ...a, ...api_response.authors }));
        setComments([...api_response.comments]);
      },
      onFailure: ({ api_error_message }) => showErrorMessage(api_error_message)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sha256]);

  const handleAddComment = useCallback(
    (comment: Comment) => () => {
      if (!sha256) return;
      apiCall({
        method: 'PUT',
        url: `/api/v4/archive/comment/${sha256}/`,
        body: comment,
        onSuccess: ({ api_response }) => {
          setComments(c => [api_response, ...(c ? c : [])]);
          showSuccessMessage(t('comment.snackbar.add'));
        },
        onFailure: ({ api_error_message }) => showErrorMessage(api_error_message),
        onEnter: () => setWaiting(true),
        onExit: () => {
          setWaiting(false);
          setConfirmation(c => ({ ...c, open: false }));
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sha256]
  );

  const handleEditComment = useCallback(
    (comment: Comment) => () => {
      if (!sha256) return;
      apiCall({
        method: 'POST',
        url: `/api/v4/archive/comment/${sha256}/${comment?.cid}/`,
        body: comment,
        onSuccess: () => {
          setComments(c => c.map(v => (v?.cid === comment?.cid ? comment : v)));
          showSuccessMessage(t('comment.snackbar.edit'));
        },
        onFailure: ({ api_error_message }) => showErrorMessage(api_error_message),
        onEnter: () => setWaiting(true),
        onExit: () => {
          setWaiting(false);
          setConfirmation(c => ({ ...c, open: false }));
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sha256]
  );

  const handleDeleteComment = useCallback(
    (comment: Comment) => () => {
      if (!sha256) return;
      apiCall({
        method: 'DELETE',
        url: `/api/v4/archive/comment/${sha256}/${comment?.cid}/`,
        body: comment,
        onSuccess: ({ api_response }) => {
          setComments(c => c.filter(v => v?.cid !== comment?.cid));
          showSuccessMessage(t('comment.snackbar.delete'));
        },
        onFailure: ({ api_error_message }) => showErrorMessage(api_error_message),
        onEnter: () => setWaiting(true),
        onExit: () => {
          setWaiting(false);
          setConfirmation(c => ({ ...c, open: false }));
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sha256]
  );

  const handleReactionClick = useCallback(
    (comment: Comment, reaction: string) => () => {
      if (!sha256) return;
      apiCall({
        method: 'PUT',
        url: `/api/v4/archive/reaction/${sha256}/${comment?.cid}/${reaction}/`,
        body: comment,
        onSuccess: ({ api_response }) => {
          setComments(c =>
            c.map(v => {
              if (v?.cid === comment?.cid) v.reactions = api_response;
              return v;
            })
          );
        },
        onFailure: ({ api_error_message }) => showErrorMessage(api_error_message),
        onEnter: () => setWaiting(true),
        onExit: () => setWaiting(false)
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sha256]
  );

  const handleTextChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setCurrentComment(c => ({ ...c, text: event.target.value }));
  }, []);

  useEffect(() => {
    setAuthors(a => ({
      ...a,
      [currentUser.username]: {
        uname: currentUser?.username,
        name: currentUser?.name,
        avatar: currentUser?.avatar,
        email: currentUser?.email
      }
    }));
  }, [currentUser]);

  useEffect(() => {
    if (sha256) handleRefreshComments();
    return () => setComments(null);
  }, [handleRefreshComments, sha256]);

  useEffect(() => {
    if (!sha256) return;

    socket.current = io(SOCKETIO_NAMESPACE);

    socket.current.on('connect', () => {
      socket.current.emit('enter_room', { sha256: sha256 });
      // eslint-disable-next-line no-console
      console.debug('Socket-IO :: Connected from socketIO server.');
    });

    socket.current.on('disconnect', () => {
      // eslint-disable-next-line no-console
      console.debug('Socket-IO :: Disconnected from socketIO server.');
    });

    socket.current.on('refresh_comments', () => {
      // eslint-disable-next-line no-console
      console.debug('Socket-IO :: Someone made a new comment');
      handleRefreshComments();
    });

    return () => {
      socket.current.disconnect();
    };
  }, [handleRefreshComments, sha256]);

  return (
    <SectionContainer
      title={t('comments')}
      nocollapse={nocollapse}
      slots={{
        end: currentUser.roles.includes('archive_comment') && (
          <Tooltip title={t('comment.tooltip.add')}>
            <span>
              <IconButton
                disabled={!comments}
                size="large"
                style={{
                  color: !comments
                    ? theme.palette.text.disabled
                    : theme.palette.mode === 'dark'
                    ? theme.palette.success.light
                    : theme.palette.success.dark
                }}
                onClick={handleAddConfirmation}
              >
                <AddCircleOutlineIcon />
              </IconButton>
            </span>
          </Tooltip>
        )
      }}
    >
      {!comments
        ? Array.from({ length: 3 }).map((_, i) => <CommentCard key={i} />)
        : authors &&
          sortedComments &&
          sortedComments.map((comment, i) => (
            <CommentCard
              key={i}
              currentComment={comment}
              previousComment={i > 0 && sortedComments[i - 1]}
              nextComment={i < sortedComments.length - 1 && sortedComments[i + 1]}
              authors={authors}
              onEditClick={handleEditConfirmation}
              onDeleteClick={handleDeleteConfirmation}
              onReactionClick={handleReactionClick}
            />
          ))}
      <Dialog classes={{ paper: classes.dialog }} open={confirmation.open} onClose={handleCloseConfirmation}>
        <DialogTitle>
          {confirmation.type === 'add' && t('comment.confirmation.title.add')}
          {confirmation.type === 'edit' && t('comment.confirmation.title.edit')}
          {confirmation.type === 'delete' && t('comment.confirmation.title.delete')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            <Grid container flexDirection="column" spacing={2}>
              <Grid item>
                {confirmation.type === 'add' && t('comment.confirmation.content.add')}
                {confirmation.type === 'edit' && t('comment.confirmation.content.edit')}
                {confirmation.type === 'delete' && t('comment.confirmation.content.delete')}
              </Grid>
              {['add', 'edit'].includes(confirmation.type) && (
                <Grid item>
                  <TextField
                    value={currentComment?.text}
                    disabled={waiting}
                    label={t('comment.content')}
                    margin="dense"
                    size="small"
                    type="text"
                    minRows={3}
                    autoFocus
                    fullWidth
                    multiline
                    onChange={handleTextChange}
                  />
                </Grid>
              )}
              {confirmation.type === 'delete' && (
                <Grid item>
                  <Typography variant="subtitle2" children={t('comment.content')} />
                  <Paper component="pre" variant="outlined" className={classes.preview}>
                    {currentComment?.text}
                  </Paper>
                </Grid>
              )}
              <Grid item>{t('comment.confirmation.confirm')}</Grid>
            </Grid>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="secondary" children={t('cancel')} onClick={handleCloseConfirmation} />
          <Button
            color="primary"
            autoFocus
            disabled={[null, undefined, ''].includes(currentComment?.text) || waiting}
            children={
              <>
                {confirmation.type === 'add' && t('comment.confirmation.action.add')}
                {confirmation.type === 'edit' && t('comment.confirmation.action.edit')}
                {confirmation.type === 'delete' && t('comment.confirmation.action.delete')}
                {waiting && (
                  <CircularProgress
                    size={24}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: -12,
                      marginLeft: -12
                    }}
                  />
                )}
              </>
            }
            onClick={
              confirmation.type === 'add'
                ? handleAddComment(currentComment)
                : confirmation.type === 'edit'
                ? handleEditComment(currentComment)
                : confirmation.type === 'delete'
                ? handleDeleteComment(currentComment)
                : null
            }
          />
        </DialogActions>
      </Dialog>
    </SectionContainer>
  );
};

export const CommentSection = React.memo(WrappedCommentSection);
export default CommentSection;
