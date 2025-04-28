import { Divider, Link, styled, Typography, useTheme } from '@mui/material';
import CustomChip from 'components/visual/CustomChip';
import Moment from 'components/visual/Moment';
import type { JSONFeedAuthor, JSONFeedItem } from 'components/visual/Notification/useNotificationFeed';
import DOMPurify from 'dompurify';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';

const Container = styled('div')(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(1.25)
}));

const Time = styled(Typography)(() => ({
  lineHeight: 'revert'
}));

const Header = styled('div')(() => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center'
}));

const Content = styled('div')(() => ({}));

const Description = styled(Typography)(({ theme }) => ({
  '& a': {
    textDecoration: 'none',
    color: theme.palette.primary.main,
    transition: 'color 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
    '&:hover': {
      color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark
    }
  },
  '& > *': {
    marginBlockStart: theme.spacing(0.5),
    marginBlockEnd: theme.spacing(0.5)
  }
}));

type Props = {
  notification?: JSONFeedItem;
  hideDivider?: boolean;
};

const WrappedNotificationItem = ({ notification = null, hideDivider = false }: Props) => {
  const { i18n } = useTranslation('notification');
  const theme = useTheme();

  const Author = useCallback(
    ({ author, index, last }: { author: JSONFeedAuthor; index: number; last: number }) => (
      <>
        {author?.url && author?.url !== '' ? (
          <Link
            title={author.url}
            href={author.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'contents' }}
          >
            {author?.avatar && (
              <img
                src={author.avatar}
                alt={author.avatar}
                style={{
                  marginLeft: theme.spacing(0.25),
                  marginRight: theme.spacing(0.25),
                  color: theme.palette.text.secondary,
                  maxHeight: '25px',
                  borderRadius: '50%'
                }}
              />
            )}
            {author?.name && (
              <Typography
                variant="caption"
                color="textSecondary"
                children={author.name}
                sx={{
                  marginLeft: theme.spacing(0.25),
                  marginRight: theme.spacing(0.25),
                  color: theme.palette.text.secondary,

                  transition: 'color 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
                  '&:hover': {
                    color: theme.palette.mode === 'dark' ? theme.palette.secondary.light : theme.palette.secondary.dark
                  }
                }}
              />
            )}
          </Link>
        ) : (
          <div style={{ display: 'contents' }}>
            {author?.avatar && (
              <img
                src={author.avatar}
                alt={author.avatar}
                style={{
                  marginLeft: theme.spacing(0.25),
                  marginRight: theme.spacing(0.25),
                  color: theme.palette.text.secondary,
                  maxHeight: '25px',
                  borderRadius: '50%'
                }}
              />
            )}
            {author?.name && (
              <Typography
                variant="caption"
                color="textSecondary"
                children={author.name}
                sx={{
                  marginLeft: theme.spacing(0.25),
                  marginRight: theme.spacing(0.25),
                  color: theme.palette.text.secondary
                }}
              />
            )}
          </div>
        )}
      </>
    ),
    [theme]
  );

  if (notification === null) return <></>;
  else
    return (
      <>
        <Container>
          <Time variant="caption" color="secondary">
            <Moment variant="localeDate">{notification.date_published}</Moment>
          </Time>
          <Header>
            {notification.url ? (
              <div>
                <Link
                  title={notification.url}
                  href={notification.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '100%',
                    flex: 1,
                    overflow: 'hidden',
                    textDecoration: 'none'
                  }}
                >
                  <Typography
                    variant="body1"
                    color="secondary"
                    children={notification.title}
                    sx={{
                      flex: 1,
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      color: theme.palette.primary.main,
                      fontSize: 'large',

                      transition: 'color 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
                      '&:hover': {
                        color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark
                      },

                      ...(notification._isNew && {
                        fontWeight: 800
                      })
                    }}
                  />
                </Link>
              </div>
            ) : (
              <Typography
                variant="body1"
                color="secondary"
                children={notification.title}
                sx={{
                  flex: 1,
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: theme.palette.primary.main,
                  fontSize: 'large',

                  ...(notification._isNew && {
                    fontWeight: 800
                  })
                }}
              />
            )}
          </Header>
          {notification.content_md && notification.content_md !== '' ? (
            <Content>
              <Markdown
                // TODO: check this
                // className={classes.description}
                components={{ a: props => <Link href={props.href}>{props.children}</Link> }}
                children={notification.content_md}
              />
            </Content>
          ) : notification.content_html && notification.content_html !== '' ? (
            <Content>
              <Description
                variant="body2"
                color="textPrimary"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(notification.content_html, { USE_PROFILES: { html: true } })
                }}
              />
            </Content>
          ) : notification.content_text && notification.content_text !== '' ? (
            <Content>
              <Description variant="body2" color="textPrimary" children={notification.content_text} />
            </Content>
          ) : (
            <></>
          )}
          {notification.image && (
            <div style={{ display: 'grid', justifyContent: 'center' }}>
              <img
                src={notification.image}
                alt={notification.image}
                style={{
                  maxWidth: '256px',
                  maxHeight: '256px',
                  borderRadius: '5px',
                  marginTop: '8px'
                }}
              />
            </div>
          )}
          {notification.authors && (
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                color: theme.palette.secondary.main,
                justifyContent: 'right',
                paddingTop: theme.spacing(1),
                paddingRight: theme.spacing(1)
              }}
            >
              <div style={{ flexGrow: 1 }}>
                {notification.tags
                  .filter(tag => ['new', 'current', 'dev', 'service', 'blog', 'community'].includes(tag))
                  .map((tag, i) => (
                    <CustomChip
                      key={'tag-' + i}
                      type="round"
                      size="small"
                      variant="outlined"
                      color={
                        tag === 'new'
                          ? 'info'
                          : tag === 'current'
                            ? 'success'
                            : tag === 'dev' || tag === 'community'
                              ? 'warning'
                              : tag === 'service'
                                ? 'secondary'
                                : 'default'
                      }
                      label={tag}
                      sx={{
                        marginLeft: theme.spacing(0.25),
                        marginRight: theme.spacing(0.25),
                        textTransform: 'capitalize'
                      }}
                    />
                  ))}
              </div>
              {notification.authors
                .filter((_, i) => i < 2)
                .map((author, i) => (
                  <Author
                    key={`${i} - ${author.name}`}
                    author={author}
                    index={i}
                    last={notification.authors.length - 1}
                  />
                ))}
            </div>
          )}
        </Container>
        {!hideDivider && (
          <Divider
            variant="fullWidth"
            sx={{
              width: '95%',
              '@media print': {
                backgroundColor: '#0000001f !important'
              }
            }}
          />
        )}
      </>
    );
};

export const NotificationItem = React.memo(WrappedNotificationItem);
export default NotificationItem;
