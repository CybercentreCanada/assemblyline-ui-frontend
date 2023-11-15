import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import {
  Button,
  ButtonGroup,
  Chip,
  Fade,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Popper,
  Tooltip,
  Typography,
  useTheme
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
  container: {
    flex: 1,
    display: 'grid',
    gridTemplateAreas: `"input input input" ". cancel button"`,
    gridTemplateColumns: '1fr auto auto',
    gridTemplateRows: 'auto auto',
    gap: theme.spacing(1)
  },

  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    padding: `${theme.spacing(1)} ${theme.spacing(1.75)}`
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(1.5)
  },
  textfield: {
    gridArea: 'input',
    margin: 0
  },
  cancel: { gridArea: 'cancel' },
  add: { gridArea: 'button' },
  edit: { gridArea: 'button' },
  name: { gridArea: 'name', fontWeight: 500 },
  date: { gridArea: 'date', color: theme.palette.text.secondary },
  text: { gridArea: 'text' },
  authorText: { borderColor: theme.palette.primary.main },
  hide: { display: 'none' },
  actions: { backgroundColor: theme.palette.background.paper },
  action: {
    padding: `${theme.spacing(0.25)} ${theme.spacing(0.5)}`,
    minWidth: 'auto !important'
  },
  tooltip: {
    backgroundColor: theme.palette.grey[700],
    marginTop: `${theme.spacing(1)} !important`
  },
  progress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  reactionTooltip: {
    padding: 0
  }
}));

export const REACTIONS = {
  thumbs_up: '👍',
  thumbs_down: '👎',
  heart: '🧡',
  smiley: '😀',
  surprise: '🎉',
  party: '🚀'
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
  const theme = useTheme();
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

  const avatar = useMemo<string>(
    () =>
      (currentAuthor?.name || currentUser?.name || '')
        .split(' ')
        .filter(w => w !== '')
        .splice(0, 2)
        .map(n => (n ? n[0].toUpperCase() : ''))
        .join(''),
    [currentAuthor?.name, currentUser?.name]
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

  const handlePopoverOpen = useCallback(() => setAnchorEl(contentRef.current), []);

  const handlePopoverClose = useCallback(() => setAnchorEl(null), []);

  const getEmoji = useCallback((value: string) => {
    try {
      return String.fromCodePoint(parseInt(value.substring(1)));
    } catch {
      return null;
    }
  }, []);

  return (
    <div className={clsx(classes.comment, (!isSameAuthor || !isNarrowTimeSpan) && classes.diffComment)}>
      <div className={classes.icon}>
        {!isSameAuthor ? (
          <AppUserAvatar
            children={avatar}
            alt={currentAuthor?.name}
            url={currentAuthor?.avatar}
            email={currentAuthor?.email}
          />
        ) : (
          <div />
        )}
      </div>

      <Paper
        className={clsx(classes.content, currentAuthor?.email === currentUser?.email && classes.authorText)}
        ref={contentRef}
        variant="outlined"
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
      >
        {(!isSameAuthor || !isNarrowTimeSpan) && (
          <div className={classes.header}>
            {!isSameAuthor && (
              <Typography className={classes.name} variant="body1">
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

        <Typography className={classes.text} variant="body2">
          {currentComment?.text}
        </Typography>

        <div style={{ display: 'flex', gap: theme.spacing(1) }}>
          {Object.entries(reactions).map(
            ([reaction, names], i) =>
              names?.length > 0 && (
                <Tooltip
                  key={i}
                  classes={{ tooltip: classes.reactionTooltip }}
                  title={
                    <div>
                      <List
                        dense={true}
                        style={{ borderRadius: '4px', backgroundColor: theme.palette.background.default }}
                      >
                        {names.map((name, j) => (
                          <ListItem key={`${i}-${j}`}>
                            <ListItemIcon>
                              {name in authors && (
                                <AppUserAvatar
                                  children={authors[name]?.avatar}
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
                    </div>
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
                    color={isCurrentUser ? 'primary' : 'default'}
                    onClick={onReactionClick(currentComment, reaction)}
                  />
                </Tooltip>
              )
          )}
        </div>

        <Popper open={actionsOpen} anchorEl={anchorEl} placement="top-end" transition disablePortal>
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <ButtonGroup className={classes.actions} variant="outlined" color="inherit">
                {Object.entries(REACTIONS).map(([icon, emoji]: [keyof typeof REACTIONS, string], i) => (
                  <Tooltip key={i} classes={{ tooltip: classes.tooltip }} title={t(icon)}>
                    <Button className={classes.action} size="small" onClick={onReactionClick(currentComment, icon)}>
                      <span style={{ fontSize: 'medium' }}>{emoji}</span>
                    </Button>
                  </Tooltip>
                ))}

                {isCurrentUser && (
                  <>
                    <Tooltip classes={{ tooltip: classes.tooltip }} title={t('comment.tooltip.edit')}>
                      <Button className={classes.action} size="small" onClick={onEditClick(currentComment)}>
                        <CreateOutlinedIcon />
                      </Button>
                    </Tooltip>
                    <Tooltip classes={{ tooltip: classes.tooltip }} title={t('comment.tooltip.delete')}>
                      <Button className={classes.action} size="small" onClick={onDeleteClick(currentComment)}>
                        <ClearOutlinedIcon />
                      </Button>
                    </Tooltip>
                  </>
                )}
              </ButtonGroup>
            </Fade>
          )}
        </Popper>
      </Paper>
    </div>
  );
};

export const CommentCard = React.memo(WrappedCommentCard);
export default CommentCard;
