import { Divider, Link, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import * as DOMPurify from 'dompurify';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';
import Moment from 'react-moment';
import { JSONFeedAuthor, JSONFeedItem } from '.';
import CustomChip from '../CustomChip';

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
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: theme.palette.primary.main,
    fontSize: 'large'
  },
  launch: {
    color: theme.palette.primary.main,
    transition: 'color 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
    '&:hover': {
      color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark
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

  userItem: {
    display: 'contents'
  },
  userElement: {
    marginLeft: theme.spacing(0.25),
    marginRight: theme.spacing(0.25),
    color: theme.palette.text.secondary
  },
  userLink: {
    transition: 'color 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
    '&:hover': {
      color: theme.palette.mode === 'dark' ? theme.palette.secondary.light : theme.palette.secondary.dark
    }
  },
  userImg: {
    maxHeight: '25px',
    borderRadius: '50%'
  },
  tags: {
    flexGrow: 1
  },
  content: {},
  badge: {
    marginLeft: theme.spacing(0.25),
    marginRight: theme.spacing(0.25),
    textTransform: 'capitalize'
  },
  center: { display: 'grid', justifyContent: 'center' },
  descriptionImage: {
    maxWidth: '256px',
    maxHeight: '256px',
    borderRadius: '5px',
    marginTop: '8px'
  },
  description: {
    '& a': {
      textDecoration: 'none',
      color: theme.palette.primary.main,
      transition: 'color 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
      '&:hover': {
        color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark
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
  const { i18n } = useTranslation('notification');

  const Author = React.memo(({ author, index, last }: { author: JSONFeedAuthor; index: number; last: number }) => (
    <>
      {author?.url && author?.url !== '' ? (
        <Link
          className={clsx(classes.userItem)}
          title={author.url}
          href={author.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {author?.avatar && (
            <img className={clsx(classes.userElement, classes.userImg)} src={author.avatar} alt={author.avatar} />
          )}
          {author?.name && (
            <Typography
              className={clsx(classes.userElement, classes.userLink)}
              variant="caption"
              color="textSecondary"
              children={author.name}
            />
          )}
        </Link>
      ) : (
        <div className={clsx(classes.userItem)}>
          {author?.avatar && (
            <img className={clsx(classes.userElement, classes.userImg)} src={author.avatar} alt={author.avatar} />
          )}
          {author?.name && (
            <Typography
              className={clsx(classes.userElement)}
              variant="caption"
              color="textSecondary"
              children={author.name}
            />
          )}
        </div>
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
              {notification.date_published}
            </Moment>
          </Typography>
          <div className={classes.header}>
            {notification.url ? (
              <div>
                <Link
                  className={clsx(classes.link)}
                  title={notification.url}
                  href={notification.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Typography
                    className={clsx(classes.title, classes.launch, notification._isNew && classes.isNew)}
                    variant="body1"
                    color="secondary"
                    children={notification.title}
                  />
                </Link>
              </div>
            ) : (
              <Typography
                className={clsx(classes.title, notification._isNew && classes.isNew)}
                variant="body1"
                color="secondary"
                children={notification.title}
              />
            )}
          </div>
          {notification.content_md && notification.content_md !== '' ? (
            <div className={classes.content}>
              <Markdown
                className={classes.description}
                components={{ a: props => <Link href={props.href}>{props.children}</Link> }}
                children={notification.content_md}
              />
            </div>
          ) : notification.content_html && notification.content_html !== '' ? (
            <div className={classes.content}>
              <Typography
                className={classes.description}
                variant="body2"
                color="textPrimary"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(notification.content_html, { USE_PROFILES: { html: true } })
                }}
              />
            </div>
          ) : notification.content_text && notification.content_text !== '' ? (
            <div className={classes.content}>
              <Typography
                className={classes.description}
                variant="body2"
                color="textPrimary"
                children={notification.content_text}
              />
            </div>
          ) : (
            <></>
          )}
          {notification.image && (
            <div className={classes.center}>
              <img className={classes.descriptionImage} src={notification.image} alt={notification.image} />
            </div>
          )}
          {notification.authors && (
            <div className={clsx(classes.row, classes.userRow)}>
              <div className={classes.tags}>
                {notification.tags
                  .filter(tag => ['new', 'current', 'dev', 'service', 'blog'].includes(tag))
                  .map((tag, i) => (
                    <CustomChip
                      className={classes.badge}
                      key={'tag-' + i}
                      type="round"
                      size="small"
                      variant="outlined"
                      color={
                        tag === 'new'
                          ? 'info'
                          : tag === 'current'
                          ? 'success'
                          : tag === 'dev'
                          ? 'warning'
                          : tag === 'service'
                          ? 'secondary'
                          : 'default'
                      }
                      label={tag}
                    />
                  ))}
              </div>
              {notification.authors
                .filter((_, i) => i < 2)
                .map((author, i) => (
                  <Author key={`${i} - ${author}`} author={author} index={i} last={notification.authors.length - 1} />
                ))}
            </div>
          )}
        </div>
        {!hideDivider && <Divider className={classes.divider} variant="fullWidth" />}
      </>
    );
};

export const NotificationItem = React.memo(WrappedNotificationItem);
export default NotificationItem;
