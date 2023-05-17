import { Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { AppUserAvatar } from 'commons/components/topnav/UserProfile';
import React, { useMemo } from 'react';
import Moment from 'react-moment';

export type Comment = {
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
};

const useStyles = makeStyles(theme => ({
  comment: {
    marginTop: theme.spacing(2),
    display: 'grid',
    alignItems: 'center',
    gridTemplateAreas: `"icon name date ." "icon text text text"`,
    gridTemplateColumns: 'auto auto auto 1fr',
    gridTemplateRows: 'auto auto',
    gap: `${theme.spacing(0.25)} ${theme.spacing(1)}`
  },
  icon: { gridArea: 'icon', alignSelf: 'start', marginRight: theme.spacing(0.5) },
  name: { gridArea: 'name', fontWeight: 500 },
  date: { gridArea: 'date', color: theme.palette.text.secondary },
  text: { gridArea: 'text' }
}));

const CommentCard: React.FC<CommentCardProps> = ({ comment }) => {
  const classes = useStyles();

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
      <div className={classes.text} children={comment?.content?.text} />
    </Typography>
  );
};

export default CommentCard;
