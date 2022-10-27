import { Divider, makeStyles, Typography } from '@material-ui/core';
import clsx from 'clsx';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import { JSONFeedAuthor, JSONFeedItem } from '.';

const useStyles = makeStyles(theme => ({
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(1.25)
  },
  row: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  header: {
    width: '100%',
    display: 'flex',
    alignItems: 'center'
  },
  time: { lineHeight: 'revert' },
  icon: { color: theme.palette.warning.main },
  link: {
    width: '100%',
    flex: 1,
    overflow: 'hidden',
    textDecoration: 'none'
  },
  title: {
    flex: 1,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: theme.palette.primary.main,
    fontSize: 'large'
  },
  launch: {
    color: theme.palette.primary.main,
    transition: 'color 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
    '&:hover': {
      color: theme.palette.type === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark
    }
  },
  isNew: {
    fontWeight: 800
  },
  userRow: {
    color: theme.palette.secondary.main,
    justifyContent: 'right',
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  user: {
    textAlign: 'right'
  },
  userName: {
    marginRight: '4px'
  },
  userImg: {
    maxHeight: '25px',
    marginRight: '4px',
    borderRadius: '50%'
  },
  content: {},
  descriptionImage: {
    maxWidth: '256px',
    maxHeight: '256px',
    borderRadius: '5px',
    marginTop: '8px'
  },
  description: {
    // overflow: 'hidden',
    // display: '-webkit-box',
    // '-webkit-line-clamp': 3,
    // '-webkit-box-orient': 'vertical',
    '&>a': {
      textDecoration: 'none',
      color: theme.palette.primary.main,
      transition: 'color 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
      '&:hover': {
        color: theme.palette.type === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark
      }
    },
    '&>*': {
      marginBlockStart: theme.spacing(0.5),
      marginBlockEnd: theme.spacing(0.5)
    }
  },
  divider: {
    width: '95%',
    '@media print': {
      backgroundColor: '#0000001f !important'
    }
  }
}));

type Props = {
  notification?: JSONFeedItem;
  hideDivider?: boolean;
};

const WrappedNotificationItem = ({ notification = null, hideDivider = false }: Props) => {
  const classes = useStyles();
  const { i18n } = useTranslation('alerts');

  const Author = React.memo(({ author, index, last }: { author: JSONFeedAuthor; index: number; last: number }) => (
    <>
      {author?.avatar && <img className={classes.userImg} src={author.avatar} alt={author.avatar} />}
      {author?.name && author?.url ? (
        <Typography
          className={classes.userName}
          variant="caption"
          color="textSecondary"
          children={<a href={author.url}>{`${author.name}${index !== last ? ',' : ''}`}</a>}
        />
      ) : (
        author?.name && (
          <Typography
            className={classes.userName}
            variant="caption"
            color="textSecondary"
            children={`${author.name}${index !== last ? ',' : ''}`}
          />
        )
      )}
    </>
  ));

  if (notification === null) return <></>;
  else
    return (
      <>
        <div className={classes.container}>
          <Typography className={classes.time} variant="caption" color="secondary">
            <Moment
              locale={i18n.language}
              format={
                i18n.language === 'en' ? 'MMMM Do YYYY' : i18n.language === 'fr' ? 'Do MMMM YYYY' : 'MMMM Do YYYY'
              }
            >
              {/* <Moment locale={i18n.language} fromNow>*/}
              {notification.date_published}
            </Moment>
          </Typography>
          <div className={classes.header}>
            {/* {notification._isNew && <PriorityHighIcon classes={{ root: clsx(classes.icon) }} fontSize="small" />} */}
            {notification.url ? (
              <div>
                <Link
                  className={clsx(classes.link)}
                  title={notification.url}
                  to={{ pathname: notification.url }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Typography
                    className={clsx(classes.title, classes.launch, notification._isNew && classes.isNew)}
                    variant="body1"
                    color="secondary"
                    children={notification.title}
                    // dangerouslySetInnerHTML={{ __html: notification.title }}
                  />
                </Link>
              </div>
            ) : (
              <Typography
                className={clsx(classes.title, notification._isNew && classes.isNew)}
                variant="body1"
                color="secondary"
                children={notification.title}
                // dangerouslySetInnerHTML={{ __html: notification.title }}
              />
            )}
            {/* {notification.link && (
              <Link
                className={clsx(classes.launch)}
                to={{ pathname: notification.link }}
                target="_blank"
                rel="noopener noreferrer"
              >
                <LaunchOutlinedIcon fontSize="small" />
              </Link>
            )} */}
          </div>
          {notification.content_text ? (
            <div className={classes.content}>
              <Typography
                className={classes.description}
                variant="body2"
                color="textPrimary"
                children={notification.content_text}
                // dangerouslySetInnerHTML={{ __html: notification.content_text }}
              />
              <img className={classes.descriptionImage} src={notification.image} alt="" />
            </div>
          ) : (
            <div className={classes.content}>
              <Typography
                className={classes.description}
                variant="body2"
                color="textPrimary"
                // children={notification.content_html}
                dangerouslySetInnerHTML={{ __html: notification.content_html }}
              />
              <img className={classes.descriptionImage} src={notification.image} alt="" />
            </div>
          )}
          {notification.authors && (
            <div className={clsx(classes.row, classes.userRow)}>
              {notification.authors.map((author, i) => (
                <Author key={`${i} - ${author}`} author={author} index={i} last={notification.authors.length - 1} />
              ))}
            </div>
          )}
          {notification.authors && (
            <span></span>
            // <div className={clsx(classes.row, classes.userRow)}>
            //   {notification.authors.map((author, i) => (
            //     <>
            //       {author.avatar && <img className={classes.userImg} src={author.avatar} alt="author.name" />}
            //       {author.name && author.url ? (
            //         <Typography
            //           className={clsx(classes.title, classes.launch, notification._isNew && classes.isNew)}
            //           variant="body1"
            //           color="secondary"
            //           children={<a href={author.url}>{author.name}</a>}
            //         />
            //       ) : (
            //         author.name && (
            //           <Typography
            //             className={classes.user}
            //             variant="caption"
            //             color="textSecondary"
            //             children={author.name}
            //             //  children={notification.authors.map(author => author.name).join(', ')}
            //           />
            //         )
            //       )}
            //     </>
            //   ))}
            // </div>
            // {/* <img className={classes.userImg} src={notification.image} alt="" /> */}
            // <Typography
            //   className={classes.user}
            //   variant="caption"
            //   color="textSecondary"
            //   children={notification.authors.map(author => author.name).join(', ')}
            // />}
            // </div>
          )}
        </div>
        {!hideDivider && <Divider className={classes.divider} variant="fullWidth" />}
      </>
    );
};

export const NotificationItem = React.memo(WrappedNotificationItem);
export default NotificationItem;
