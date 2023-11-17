import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import {
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import { AppUserAvatar } from 'commons/components/topnav/UserProfile';
import useALContext from 'components/hooks/useALContext';
import 'moment/locale/fr';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';

const PREVIOUS_CLASS = 'previous';
const NEXT_CLASS = 'next';
const CURRENT_USER_CLASS = 'current_user';
const LOADING_CLASS = 'loading';
const REACTIONS_CLASS = 'reactions';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1.5),
    [`&.${PREVIOUS_CLASS}`]: {
      marginTop: theme.spacing(0.5)
    },
    [`&.${CURRENT_USER_CLASS}`]: {
      justifyContent: 'flex-end'
    },
    [`&.${REACTIONS_CLASS}`]: {
      margin: `${theme.spacing(1.5)} 0px`
    }
  },
  icon: {
    alignSelf: 'start',
    minWidth: '40px',
    minHeight: '40px',
    marginTop: '20px'
  },

  container: {
    maxWidth: '85%',
    display: 'flex',
    flexDirection: 'column',
    [`&.${LOADING_CLASS}`]: {
      flex: 1
    }
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: theme.spacing(2.5),
    marginLeft: theme.spacing(1),
    height: '20px',
    [`&.${CURRENT_USER_CLASS}`]: {
      justifyContent: 'flex-end'
    }
  },
  content: {
    minHeight: '40px',
    padding: `${theme.spacing(1)} ${theme.spacing(1.75)}`,
    borderRadius: theme.spacing(1),
    color: theme.palette.common.white,
    boxShadow: theme.shadows[2],
    [`&:not(.${CURRENT_USER_CLASS})`]: {
      backgroundColor: theme.palette.grey[theme.palette.mode === 'dark' ? 700 : 500],
      [`&.${PREVIOUS_CLASS}`]: {
        borderTopLeftRadius: '0px'
      },
      [`&.${NEXT_CLASS}`]: {
        borderBottomLeftRadius: '0px'
      }
    },
    [`&.${CURRENT_USER_CLASS}`]: {
      backgroundColor: theme.palette.primary.main,
      [`&.${PREVIOUS_CLASS}`]: {
        borderTopRightRadius: '0px'
      },
      [`&.${NEXT_CLASS}`]: {
        borderBottomRightRadius: '0px'
      }
    },
    [`&.${REACTIONS_CLASS}`]: {
      paddingBottom: theme.spacing(2)
    }
  },
  commentTooltip: {
    margin: `${theme.spacing(0.5)} !important`,
    padding: '0px !important'
  },
  date: {
    color: theme.palette.text.secondary
  },
  authorText: {},
  actions: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.palette.background.default,
    borderRadius: '4px',
    boxShadow: theme.shadows[4]
    // border: '1px solid black'
  },
  action: {
    padding: `${theme.spacing(0.25)} ${theme.spacing(0.5)}`,
    minWidth: 'auto !important',
    height: `32px`,
    color: theme.palette.text.primary
  },
  divider: {
    width: '1px',
    height: '25px',
    backgroundColor: theme.palette.text.primary
  },
  tooltip: {
    backgroundColor: theme.palette.grey[theme.palette.mode === 'dark' ? 700 : 500],
    margin: `${theme.spacing(0.5)} !important`
  },
  reactionTooltip: {
    padding: 0
  },
  reactionList: {
    borderRadius: '4px',
    backgroundColor: theme.palette.background.default,
    boxShadow: theme.shadows[4]
  },
  reactionSubHeader: {
    borderRadius: '4px',
    backgroundColor: theme.palette.background.default,
    lineHeight: '36px'
  },
  reactionContainer: {
    display: 'flex',
    gap: theme.spacing(1),
    padding: `0px ${theme.spacing(1)}`,
    justifyContent: 'flex-start',
    [`&.${CURRENT_USER_CLASS}`]: {
      justifyContent: 'flex-end'
    },
    [`&.${REACTIONS_CLASS}`]: {
      margin: `-${theme.spacing(1)} 0px`
      // transform: `translateY(${theme.spacing(2)})`
    }
  },
  reactionChip: {
    backgroundColor: theme.palette.background.default,
    borderRadius: '14px'
  },
  actionIcon: {
    fontSize: 'medium'
  },
  justifyEnd: {
    justifyContent: 'flex-end'
  }
}));

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

export const REACTIONS = {
  thumbs_up: '👍',
  thumbs_down: '👎',
  love: '🧡',
  smile: '😀',
  surprised: '😲',
  party: '🎉'
};

export type Reaction = {
  uname: string;
  icon: keyof typeof REACTIONS;
};

export type Comment = {
  cid?: string;
  date?: string;
  text?: string;
  uname?: string;
  reactions?: Reaction[];
};

export type Author = {
  uname?: string;
  name?: string;
  avatar?: string;
  email?: string;
};

export type Comments = Comment[];

export type Authors = Record<string, Author>;

export const DEFAULT_COMMENT: Comment = {
  cid: null,
  date: null,
  text: '',
  uname: null,
  reactions: []
};

export const DEFAULT_AUTHOR: Author = {
  uname: null,
  name: null,
  avatar: null,
  email: null
};

type Props = {
  currentComment?: Comment;
  previousComment?: Comment;
  nextComment?: Comment;
  authors?: Authors;
  onEditClick?: (comment: Comment) => (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onDeleteClick?: (comment: Comment) => (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onReactionClick?: (
    comment: Comment,
    reaction: string
  ) => (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

const WrappedCommentCard: React.FC<Props> = ({
  currentComment = null,
  previousComment = null,
  nextComment = null,
  authors = null,
  onEditClick = () => null,
  onDeleteClick = () => null,
  onReactionClick = () => null
}) => {
  const { t, i18n } = useTranslation(['archive']);
  const theme = useTheme();
  const classes = useStyles();
  const { user: currentUser } = useALContext();

  const reactions = useMemo<Record<keyof typeof REACTIONS, string[]> | object>(
    () =>
      !currentComment || !('reactions' in currentComment)
        ? {}
        : (Object.fromEntries(
            Object.keys(REACTIONS).map(reaction => [
              reaction,
              currentComment?.reactions
                ?.filter((v, i, a) => v?.icon === reaction)
                .map(r => r?.uname)
                .filter((v, i, a) => a.findIndex(e => e === v) === i)
                .sort((n1, n2) => n1.localeCompare(n2))
            ])
          ) as Record<keyof typeof REACTIONS, string[]>),
    [currentComment]
  );

  const hasReactions = useMemo<boolean>(
    () =>
      !!reactions &&
      Object.entries(reactions)
        .map(([_, v]) => (Array.isArray(v) ? v?.length : 0))
        .reduce((p, c) => p + c, 0) > 0,
    [reactions]
  );

  const isCurrentUser = useMemo<boolean>(
    () => currentUser?.username === currentComment?.uname,
    [currentComment, currentUser]
  );

  const calendar = useMemo<(typeof CALENDAR_STRINGS)['en']>(
    () => (i18n.language in CALENDAR_STRINGS ? CALENDAR_STRINGS[i18n.language] : true),
    [i18n.language]
  );

  const samePreviousAuthor = useMemo<boolean>(
    () => currentComment?.uname === previousComment?.uname,
    [currentComment?.uname, previousComment?.uname]
  );

  const sameNextAuthor = useMemo<boolean>(
    () => currentComment?.uname === nextComment?.uname,
    [currentComment?.uname, nextComment?.uname]
  );

  const previousNarrowTimeSpan = useMemo<boolean>(
    () => Date.parse(previousComment?.date) - Date.parse(currentComment?.date) < 5 * 60 * 1000,
    [currentComment?.date, previousComment?.date]
  );

  const nextNarrowTimeSpan = useMemo<boolean>(
    () => Date.parse(currentComment?.date) - Date.parse(nextComment?.date) < 5 * 60 * 1000,
    [currentComment?.date, nextComment?.date]
  );

  const AvatarIcon: React.FC<{ comment?: Comment }> = useCallback(
    ({ comment = null }) =>
      comment &&
      comment?.uname in authors && (
        <AppUserAvatar
          children={authors[comment?.uname]?.name
            .split(' ')
            .filter(w => w !== '')
            .splice(0, 2)
            .map(n => (n ? n[0].toUpperCase() : ''))
            .join('')}
          alt={authors[comment?.uname]?.name}
          url={authors[comment?.uname]?.avatar}
          email={authors[comment?.uname]?.email}
        />
      ),
    [authors]
  );

  return (
    <div
      className={clsx(
        classes.root,
        isCurrentUser && CURRENT_USER_CLASS,
        samePreviousAuthor && previousNarrowTimeSpan && PREVIOUS_CLASS,
        hasReactions && REACTIONS_CLASS
      )}
    >
      {!currentComment ? (
        <Skeleton className={classes.icon} variant="circular" />
      ) : (
        !isCurrentUser && (
          <div className={classes.icon}>{!samePreviousAuthor ? <AvatarIcon comment={currentComment} /> : <div />}</div>
        )
      )}

      <div className={clsx(classes.container, !currentComment && LOADING_CLASS)}>
        {!currentComment ? (
          <Typography variant="caption" children={<Skeleton style={{ width: '50%' }} />} />
        ) : (
          (!samePreviousAuthor || !previousNarrowTimeSpan) && (
            <div className={clsx(classes.header, isCurrentUser && CURRENT_USER_CLASS)}>
              {!isCurrentUser && !samePreviousAuthor && (
                <Typography
                  color={theme.palette.text.secondary}
                  variant="caption"
                  children={authors[currentComment?.uname]?.name}
                />
              )}
              {(!samePreviousAuthor || !previousNarrowTimeSpan) && (
                <Typography className={classes.date} variant="caption">
                  <Moment calendar={calendar} locale={i18n.language} children={currentComment?.date} />
                </Typography>
              )}
            </div>
          )
        )}

        {!currentComment ? (
          <Skeleton style={{ minHeight: '40px', padding: `${theme.spacing(1)} ${theme.spacing(1.75)}` }} />
        ) : (
          <Tooltip
            classes={{ tooltip: classes.commentTooltip }}
            placement="top-end"
            title={
              <Stack className={classes.actions} direction="row">
                {Object.entries(REACTIONS).map(([icon, emoji]: [keyof typeof REACTIONS, string], i) => (
                  <Tooltip key={i} classes={{ tooltip: classes.tooltip }} placement="top" title={t(`reaction.${icon}`)}>
                    <Button
                      className={classes.action}
                      size="small"
                      color="inherit"
                      onClick={onReactionClick(currentComment, icon)}
                    >
                      <span className={classes.actionIcon}>{emoji}</span>
                    </Button>
                  </Tooltip>
                ))}

                {isCurrentUser && (
                  <>
                    <Divider className={classes.divider} />
                    <Tooltip classes={{ tooltip: classes.tooltip }} placement="top" title={t('comment.tooltip.edit')}>
                      <Button className={classes.action} size="small" onClick={onEditClick(currentComment)}>
                        <CreateOutlinedIcon />
                      </Button>
                    </Tooltip>
                    <Tooltip classes={{ tooltip: classes.tooltip }} placement="top" title={t('comment.tooltip.delete')}>
                      <Button className={classes.action} size="small" onClick={onDeleteClick(currentComment)}>
                        <ClearOutlinedIcon />
                      </Button>
                    </Tooltip>
                  </>
                )}
              </Stack>
            }
          >
            <div
              className={clsx(
                classes.content,
                isCurrentUser && CURRENT_USER_CLASS,
                previousNarrowTimeSpan && samePreviousAuthor && PREVIOUS_CLASS,
                nextNarrowTimeSpan && sameNextAuthor && NEXT_CLASS,
                hasReactions && REACTIONS_CLASS
              )}
            >
              <Typography variant="body2" children={currentComment?.text} />
            </div>
          </Tooltip>
        )}

        <div
          className={clsx(
            classes.reactionContainer,
            isCurrentUser && CURRENT_USER_CLASS,
            hasReactions && REACTIONS_CLASS
          )}
        >
          {Object.entries(reactions).map(
            ([reaction, names], i) =>
              names?.length > 0 && (
                <Tooltip
                  key={i}
                  classes={{ tooltip: classes.reactionTooltip }}
                  title={
                    <List
                      className={classes.reactionList}
                      dense={true}
                      subheader={
                        <ListSubheader className={classes.reactionSubHeader}>{t(`reaction.${reaction}`)}</ListSubheader>
                      }
                    >
                      {names.map((name: string, j: number) => (
                        <ListItem key={`${i}-${j}`}>
                          <ListItemIcon>
                            {name in authors && (
                              <AppUserAvatar
                                children={authors[name]?.name
                                  .split(' ')
                                  .filter(w => w !== '')
                                  .splice(0, 2)
                                  .map(n => (n ? n[0].toUpperCase() : ''))
                                  .join('')}
                                alt={authors[name]?.name}
                                url={authors[name]?.avatar}
                                email={authors[name]?.email}
                                sx={{ width: 30, height: 30 }}
                              />
                            )}
                          </ListItemIcon>
                          <ListItemText primary={authors[name]?.name} sx={{ color: theme.palette.text.primary }} />
                        </ListItem>
                      ))}
                    </List>
                  }
                >
                  <div className={classes.reactionChip}>
                    <Chip
                      label={
                        <>
                          <span style={{ fontSize: 'medium' }}>{REACTIONS[reaction]}</span>
                          <span>{names.length}</span>
                        </>
                      }
                      size="small"
                      variant="outlined"
                      color={names.includes(currentUser?.username) ? 'primary' : 'default'}
                      onClick={onReactionClick(currentComment, reaction)}
                    />
                  </div>
                </Tooltip>
              )
          )}
        </div>
      </div>
    </div>
  );
};

export const CommentCard = React.memo(WrappedCommentCard);
export default CommentCard;
