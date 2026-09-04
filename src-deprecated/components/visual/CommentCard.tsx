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
import { AppUserAvatar } from 'commons/components/topnav/UserProfile';
import useALContext from 'components/hooks/useALContext';
import type { Author, Comment, ReactionType } from 'components/models/base/file';
import { REACTIONS_TYPES } from 'components/models/base/file';
import Moment from 'components/visual/Moment';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  currentComment?: Comment;
  previousComment?: Comment;
  nextComment?: Comment;
  authors?: Author[];
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
  const { user: currentUser } = useALContext();

  const reactions = useMemo<Record<ReactionType, string[]> | object>(
    () =>
      !currentComment || !('reactions' in currentComment)
        ? {}
        : Object.fromEntries(
            Object.keys(REACTIONS_TYPES).map(reaction => [
              reaction,
              currentComment?.reactions
                ?.filter((v, i, a) => v?.icon === reaction)
                .map(r => r?.uname)
                .filter((v, i, a) => a.findIndex(e => e === v) === i)
                .sort((n1, n2) => n1.localeCompare(n2))
            ])
          ),
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
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        gap: theme.spacing(1),
        marginTop: theme.spacing(1.5),
        ...(samePreviousAuthor && previousNarrowTimeSpan && { marginTop: theme.spacing(0.5) }),
        ...(isCurrentUser && { justifyContent: 'flex-end' }),
        ...(hasReactions && { margin: `${theme.spacing(1.5)} 0px` })
      }}
    >
      {!currentComment ? (
        <Skeleton
          variant="circular"
          style={{ alignSelf: 'start', minWidth: '40px', minHeight: '40px', marginTop: '20px' }}
        />
      ) : (
        !isCurrentUser && (
          <div style={{ alignSelf: 'start', minWidth: '40px', minHeight: '40px', marginTop: '20px' }}>
            {!samePreviousAuthor ? <AvatarIcon comment={currentComment} /> : <div />}
          </div>
        )
      )}

      <div
        style={{
          maxWidth: '85%',
          display: 'flex',
          flexDirection: 'column',
          ...(!currentComment && { flex: 1 }),
          [theme.breakpoints.down('md')]: {
            maxWidth: '75%'
          }
        }}
      >
        {!currentComment ? (
          <Typography variant="caption" children={<Skeleton style={{ width: '50%' }} />} />
        ) : (
          (!samePreviousAuthor || !previousNarrowTimeSpan) && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: theme.spacing(2.5),
                marginLeft: theme.spacing(1),
                height: '20px',

                ...(isCurrentUser && { justifyContent: 'flex-end' })
              }}
            >
              {!isCurrentUser && !samePreviousAuthor && (
                <Typography
                  color={theme.palette.text.secondary}
                  variant="caption"
                  children={authors[currentComment?.uname]?.name}
                />
              )}
              {(!samePreviousAuthor || !previousNarrowTimeSpan) && (
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  <Moment variant="fromDateTime">{currentComment?.date}</Moment>
                </Typography>
              )}
            </div>
          )
        )}

        {!currentComment ? (
          <Skeleton style={{ minHeight: '40px', padding: `${theme.spacing(1)} ${theme.spacing(1.75)}` }} />
        ) : (
          <Tooltip
            slotProps={{
              tooltip: {
                sx: {
                  margin: `${theme.spacing(0.5)} !important`,
                  padding: '0px !important'
                }
              }
            }}
            placement="top-end"
            title={
              currentUser.roles.includes('archive_comment') && (
                <Stack
                  direction="row"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: theme.palette.background.default,
                    borderRadius: '4px',
                    boxShadow: theme.shadows[4]
                    // border: '1px solid black'
                  }}
                >
                  {Object.entries(REACTIONS_TYPES).map(([icon, emoji], i) => (
                    <Tooltip
                      key={i}
                      placement="top"
                      title={t(`reaction.${icon}`)}
                      slotProps={{
                        tooltip: {
                          sx: {
                            backgroundColor: theme.palette.grey[theme.palette.mode === 'dark' ? 700 : 500],
                            margin: `${theme.spacing(0.5)} !important`
                          }
                        }
                      }}
                    >
                      <Button
                        size="small"
                        color="inherit"
                        onClick={onReactionClick(currentComment, icon)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          backgroundColor: theme.palette.background.default,
                          borderRadius: '4px',
                          boxShadow: theme.shadows[4]
                          // border: '1px solid black'
                        }}
                      >
                        <span style={{ fontSize: 'medium' }}>{emoji}</span>
                      </Button>
                    </Tooltip>
                  ))}

                  {isCurrentUser && (
                    <>
                      <Divider
                        sx={{
                          width: '1px',
                          height: '25px',
                          margin: `0 ${theme.spacing(0.5)}`,
                          backgroundColor: theme.palette.text.primary
                        }}
                      />
                      <Tooltip
                        placement="top"
                        title={t('comment.tooltip.edit')}
                        slotProps={{
                          tooltip: {
                            sx: {
                              backgroundColor: theme.palette.grey[theme.palette.mode === 'dark' ? 700 : 500],
                              margin: `${theme.spacing(0.5)} !important`
                            }
                          }
                        }}
                      >
                        <Button
                          size="small"
                          onClick={onEditClick(currentComment)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: theme.palette.background.default,
                            borderRadius: '4px',
                            boxShadow: theme.shadows[4]
                            // border: '1px solid black'
                          }}
                        >
                          <CreateOutlinedIcon />
                        </Button>
                      </Tooltip>
                      <Tooltip
                        placement="top"
                        title={t('comment.tooltip.delete')}
                        slotProps={{
                          tooltip: {
                            sx: {
                              backgroundColor: theme.palette.grey[theme.palette.mode === 'dark' ? 700 : 500],
                              margin: `${theme.spacing(0.5)} !important`
                            }
                          }
                        }}
                      >
                        <Button
                          size="small"
                          onClick={onDeleteClick(currentComment)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: theme.palette.background.default,
                            borderRadius: '4px',
                            boxShadow: theme.shadows[4]
                            // border: '1px solid black'
                          }}
                        >
                          <ClearOutlinedIcon />
                        </Button>
                      </Tooltip>
                    </>
                  )}
                </Stack>
              )
            }
          >
            <div
              style={{
                minHeight: '40px',
                padding: `${theme.spacing(1)} ${theme.spacing(1.75)}`,
                borderRadius: theme.spacing(1),
                color: theme.palette.common.white,
                boxShadow: theme.shadows[2],

                ...(!isCurrentUser
                  ? {
                      backgroundColor: theme.palette.grey[theme.palette.mode === 'dark' ? 700 : 500],
                      ...(previousNarrowTimeSpan && samePreviousAuthor && { borderTopLeftRadius: '0px' }),
                      ...(nextNarrowTimeSpan && sameNextAuthor && { borderBottomLeftRadius: '0px' })
                    }
                  : {
                      backgroundColor: theme.palette.primary.main,
                      ...(previousNarrowTimeSpan && samePreviousAuthor && { borderTopRightRadius: '0px' }),
                      ...(nextNarrowTimeSpan && sameNextAuthor && { borderBottomRightRadius: '0px' })
                    }),
                ...(hasReactions && { paddingBottom: theme.spacing(2) })
              }}
            >
              <Typography variant="body2" children={currentComment?.text} />
            </div>
          </Tooltip>
        )}

        <div
          style={{
            display: 'flex',
            gap: theme.spacing(1),
            padding: `0px ${theme.spacing(1)}`,
            justifyContent: 'flex-start',
            ...(isCurrentUser && { justifyContent: 'flex-end' }),
            ...(hasReactions && { margin: `-${theme.spacing(1)} 0px`, transform: `translateY(${theme.spacing(2)})` })
          }}
        >
          {Object.entries(reactions).map(
            ([reaction, names], i) =>
              names?.length > 0 && (
                <Tooltip
                  key={i}
                  slotProps={{ tooltip: { sx: { padding: 0 } } }}
                  title={
                    <List
                      sx={{
                        borderRadius: '4px',
                        backgroundColor: theme.palette.background.default,
                        boxShadow: theme.shadows[4]
                      }}
                      dense={true}
                      subheader={
                        <ListSubheader
                          sx={{
                            borderRadius: '4px',
                            backgroundColor: theme.palette.background.default,
                            lineHeight: '36px'
                          }}
                        >
                          {t(`reaction.${reaction}`)}
                        </ListSubheader>
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
                  <div
                    style={{
                      backgroundColor: theme.palette.background.default,
                      borderRadius: '14px'
                    }}
                  >
                    <Chip
                      label={
                        <>
                          <span style={{ fontSize: 'medium' }}>{REACTIONS_TYPES[reaction]}</span>
                          <span>{names.length}</span>
                        </>
                      }
                      size="small"
                      variant="outlined"
                      color={names.includes(currentUser?.username) ? 'primary' : 'default'}
                      onClick={
                        currentUser.roles.includes('archive_comment') ? onReactionClick(currentComment, reaction) : null
                      }
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
