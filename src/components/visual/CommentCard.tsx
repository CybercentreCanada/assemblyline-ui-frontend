import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import {
  Button,
  Chip,
  Divider,
  Fade,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Popper,
  Stack,
  Tooltip,
  Typography
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import { AppUserAvatar } from 'commons/components/topnav/UserProfile';
import useALContext from 'components/hooks/useALContext';
import 'moment/locale/fr';
import React, { useCallback, useMemo, useRef, useState } from 'react';
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
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    padding: `${theme.spacing(1)} ${theme.spacing(1.75)}`,
    borderRadius: '6px',
    backgroundColor: '#0000001A'
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(1.5)
  },
  date: {
    color: theme.palette.text.secondary
  },
  authorText: {},
  actions: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.palette.background.default,
    borderRadius: '4px'
  },
  action: {
    padding: `${theme.spacing(0.25)} ${theme.spacing(0.5)}`,
    minWidth: 'auto !important',
    height: `32px`
  },
  divider: {
    width: '1px',
    height: '25px',
    backgroundColor: theme.palette.text.primary
  },
  tooltip: {
    backgroundColor: theme.palette.grey[700],
    marginTop: `${theme.spacing(1)} !important`
  },
  reactionTooltip: {
    padding: 0
  },
  reactionList: {
    borderRadius: '4px',
    backgroundColor: theme.palette.background.default
  },
  reactionSubHeader: {
    borderRadius: '4px',
    backgroundColor: theme.palette.background.default,
    lineHeight: '36px'
  },
  chipContainer: {
    display: 'flex',
    gap: theme.spacing(1)
  },
  actionIcon: {
    fontSize: 'medium'
  }
}));

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
  authors?: Authors;
  currentAuthor?: Author;
  onEditClick?: (comment: Comment) => (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onDeleteClick?: (comment: Comment) => (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onReactionClick?: (
    comment: Comment,
    reaction: string
  ) => (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
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
  authors = null,
  currentAuthor = DEFAULT_AUTHOR,
  onEditClick = () => null,
  onDeleteClick = () => null,
  onReactionClick = () => null
}) => {
  const { t, i18n } = useTranslation(['archive']);
  const classes = useStyles();
  const { user: currentUser } = useALContext();

  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const actionsOpen = Boolean(anchorEl);

  const reactions = useMemo<Record<keyof typeof REACTIONS, string[]> | object>(
    () =>
      !('reactions' in currentComment)
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

  const isCurrentUser = useMemo<boolean>(
    () => currentUser?.username === currentAuthor?.uname,
    [currentAuthor, currentUser]
  );

  const calendar = useMemo<(typeof CALENDAR_STRINGS)['en']>(
    () => (i18n.language in CALENDAR_STRINGS ? CALENDAR_STRINGS[i18n.language] : true),
    [i18n.language]
  );

  const isSameAuthor = useMemo<boolean>(
    () => currentComment?.uname === previousComment?.uname,
    [currentComment?.uname, previousComment?.uname]
  );

  const isNarrowTimeSpan = useMemo<boolean>(
    () => Date.parse(previousComment?.date) - Date.parse(currentComment?.date) < 5 * 60 * 1000,
    [currentComment?.date, previousComment?.date]
  );

  const getAvatar = useCallback(
    (name: string) =>
      (name || '')
        .split(' ')
        .filter(w => w !== '')
        .splice(0, 2)
        .map(n => (n ? n[0].toUpperCase() : ''))
        .join(''),
    []
  );

  const handlePopoverOpen = useCallback(() => setAnchorEl(contentRef.current), []);

  const handlePopoverClose = useCallback(() => setAnchorEl(null), []);

  return (
    <div className={clsx(classes.comment, (!isSameAuthor || !isNarrowTimeSpan) && classes.diffComment)}>
      <div className={classes.icon}>
        {!isSameAuthor ? (
          <AppUserAvatar
            children={getAvatar(currentAuthor?.name)}
            alt={currentAuthor?.name}
            url={currentAuthor?.avatar}
            email={currentAuthor?.email}
          />
        ) : (
          <div />
        )}
      </div>

      <div
        className={clsx(classes.content, currentAuthor?.email === currentUser?.email && classes.authorText)}
        ref={contentRef}
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
      >
        {(!isSameAuthor || !isNarrowTimeSpan) && (
          <div className={classes.header}>
            {!isSameAuthor && (
              <Typography variant="body1" fontWeight={500}>
                {currentAuthor?.name}
              </Typography>
            )}
            {(!isSameAuthor || !isNarrowTimeSpan) && (
              <Typography className={classes.date} variant="body2">
                <Moment calendar={calendar} locale={i18n.language} children={currentComment?.date} />
              </Typography>
            )}
          </div>
        )}

        <Typography variant="body2">{currentComment?.text}</Typography>

        <div className={classes.chipContainer}>
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
                                children={getAvatar(authors[name]?.name)}
                                alt={authors[name]?.name}
                                url={authors[name]?.avatar}
                                email={authors[name]?.email}
                                sx={{ width: 30, height: 30 }}
                              />
                            )}
                          </ListItemIcon>
                          <ListItemText primary={authors[name]?.name} />
                        </ListItem>
                      ))}
                    </List>
                  }
                >
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
                </Tooltip>
              )
          )}
        </div>

        <Popper open={actionsOpen} anchorEl={anchorEl} placement="top-end" transition disablePortal>
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <Stack className={classes.actions} direction="row">
                {Object.entries(REACTIONS).map(([icon, emoji]: [keyof typeof REACTIONS, string], i) => (
                  <Tooltip key={i} classes={{ tooltip: classes.tooltip }} title={t(`reaction.${icon}`)}>
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
                    <Tooltip classes={{ tooltip: classes.tooltip }} title={t('comment.tooltip.edit')}>
                      <Button
                        className={classes.action}
                        size="small"
                        color="inherit"
                        onClick={onEditClick(currentComment)}
                      >
                        <CreateOutlinedIcon />
                      </Button>
                    </Tooltip>
                    <Tooltip classes={{ tooltip: classes.tooltip }} title={t('comment.tooltip.delete')}>
                      <Button
                        className={classes.action}
                        size="small"
                        color="inherit"
                        onClick={onDeleteClick(currentComment)}
                      >
                        <ClearOutlinedIcon />
                      </Button>
                    </Tooltip>
                  </>
                )}
              </Stack>
            </Fade>
          )}
        </Popper>
      </div>
    </div>
  );
};

export const CommentCard = React.memo(WrappedCommentCard);
export default CommentCard;
