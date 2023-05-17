import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import { IconButton, Tooltip, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { AppUserAvatar } from 'commons/components/topnav/UserProfile';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';

export type Comment = {
  cid?: string;
  author?: {
    name?: string;
    avatar?: string;
    email?: string;
  };
  content?: {
    text?: string;
    date?: string;
  };
};

type CommentCardProps = {
  comment: Comment;
  onEdit?: (cid: string) => void;
  onDelete?: (cid: string) => void;
};

const useStyles = makeStyles(theme => ({
  comment: {
    marginTop: theme.spacing(2),
    display: 'grid',
    alignItems: 'center',
    gridTemplateAreas: `"icon name date edit delete ." "icon text text text text text"`,
    gridTemplateColumns: 'auto auto auto auto auto 1fr',
    gridTemplateRows: 'auto auto',
    gap: `${theme.spacing(0.25)} ${theme.spacing(1)}`,
    '&:hover>div': {
      opacity: 1
    }
  },
  icon: { gridArea: 'icon', alignSelf: 'start', marginRight: theme.spacing(0.5) },
  name: { gridArea: 'name', fontWeight: 500 },
  date: { gridArea: 'date', color: theme.palette.text.secondary },
  edit: { gridArea: 'edit', opacity: 0 },
  delete: { gridArea: 'delete', opacity: 0 },
  text: { gridArea: 'text' }
}));

const CommentCard: React.FC<CommentCardProps> = ({ comment, onEdit = () => null, onDelete = () => null }) => {
  const { t } = useTranslation(['fileDetail']);
  const classes = useStyles();
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useALContext();

  const username = useMemo<string>(
    () =>
      !comment || !comment?.author || !comment?.author?.name
        ? ''
        : comment?.author?.name
            .split(' ')
            .filter(w => w !== '')
            .splice(0, 2)
            .map(n => (n ? n[0].toUpperCase() : ''))
            .join(''),
    [comment]
  );

  return (
    <Typography component="div" className={classes.comment} variant="body2">
      <AppUserAvatar
        className={classes.icon}
        children={username}
        alt={comment?.author?.name}
        url={comment?.author?.avatar}
        email={comment?.author?.email}
      />
      <Typography className={classes.name} children={comment?.author?.name} variant="body1" />
      <div className={classes.date} children={<Moment children={comment?.content?.date} fromNow />} />
      {currentUser?.name === comment?.author?.name && (
        <>
          <div className={classes.edit}>
            <Tooltip title={t('edit-comment')}>
              <IconButton
                children={<CreateOutlinedIcon fontSize="inherit" />}
                size="small"
                onClick={() => onEdit(comment?.cid)}
              />
            </Tooltip>
          </div>
          <div className={classes.delete}>
            <Tooltip title={t('delete-comment')}>
              <IconButton
                children={<ClearOutlinedIcon fontSize="inherit" />}
                size="small"
                onClick={() => onDelete(comment?.cid)}
              />
            </Tooltip>
          </div>
        </>
      )}

      <div className={classes.text} children={comment?.content?.text} />
    </Typography>
  );
};

export default CommentCard;
