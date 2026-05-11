import AssistantIcon from '@mui/icons-material/Assistant';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import {
  Avatar,
  Backdrop,
  Badge,
  Button,
  Divider,
  Fab,
  Fade,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import AppAvatar from 'commons/components/display/AppAvatar';
import AIMarkdown from 'components/visual/AiMarkdown';
import CustomChip from 'components/visual/CustomChip';
import { ThinkingBadge } from 'components/visual/ThinkingBadge';
import { useAppInterfaceStore } from 'core/interface';
import { memo } from 'react';
import { useAppAssistant } from './assistant.hooks';

export const AppAssistantLayout = memo(() => {
  const theme = useTheme();

  const upSM = useMediaQuery(theme.breakpoints.up('md'));
  const isXS = useMediaQuery(theme.breakpoints.only('xs'));

  const open = useAppInterfaceStore(s => s.assistant.open);
  const currentInsights = useAppInterfaceStore(s => s.assistant.currentInsights);
  const thinking = useAppInterfaceStore(s => s.assistant.thinking);
  const currentContext = useAppInterfaceStore(s => s.assistant.currentContext);
  const currentHistory = useAppInterfaceStore(s => s.assistant.currentHistory);
  const currentInput = useAppInterfaceStore(s => s.assistant.currentInput);
  const hasInsights = useAppInterfaceStore(s => s.assistant.hasInsights);

  const { assistantAllowed, addInsight, removeInsight, toggleAssistant } = useAppAssistant();

  return (
    <>
      {assistantAllowed && (
        <div
          className="no-print"
          style={{
            display: 'flex',
            position: 'fixed',
            bottom: theme.spacing(upSM ? 2 : 1.5),
            right: theme.spacing(upSM ? 3 : 1.5),
            zIndex: 1300
          }}
        >
          <Backdrop open={open} onClick={() => setOpen(false)}>
            <Popper
              sx={{
                zIndex: 1301,
                width: upSM ? '65%' : '90%',
                maxWidth: '1024px',
                height: upSM ? '75%' : '85%',
                display: 'flex'
              }}
              open={open}
              anchorEl={anchorEl}
              placement="top-end"
              transition
              onClick={event => event.stopPropagation()}
            >
              {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={350}>
                  <div style={{ flexGrow: 1, width: '100%' }}>
                    <Paper style={{ height: '100%', display: 'flex', overflow: 'hidden' }} elevation={3}>
                      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <div style={{ display: 'flex', padding: `${theme.spacing(0.25)} ${theme.spacing(1)}` }}>
                          <div style={{ flexGrow: 1, alignSelf: 'center' }}>
                            <Tooltip title={t('caveat')} placement="right">
                              <Typography variant="caption" style={{ color: theme.palette.text.disabled }}>
                                {t('watermark')}
                              </Typography>
                            </Tooltip>
                          </div>
                          <Tooltip title={t('reset')} placement="top">
                            <IconButton onClick={resetAssistant} color="inherit">
                              <RestartAltOutlinedIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('clear')} placement="top">
                            <IconButton onClick={clearAssistant} color="inherit">
                              <ClearAllIcon />
                            </IconButton>
                          </Tooltip>
                        </div>
                        <div
                          ref={chatRef}
                          style={{
                            backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fafafa',
                            flexGrow: 1,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: theme.spacing(0.5),
                            marginLeft: theme.spacing(1),
                            marginRight: theme.spacing(1),
                            overflow: 'auto'
                          }}
                        >
                          {currentHistory
                            .filter(message => message.content !== '')
                            .map((message, id) =>
                              message.role === 'system' ? (
                                id !== 0 ? (
                                  <div
                                    key={id}
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'center',
                                      marginTop: theme.spacing(2),
                                      marginBottom: theme.spacing(1)
                                    }}
                                  >
                                    <div
                                      style={{
                                        minWidth: '10rem',
                                        maxWidth: '25rem',
                                        textAlign: 'center',
                                        flexGrow: 1,
                                        color: theme.palette.text.disabled,
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexDirection: 'column'
                                      }}
                                    >
                                      <Divider style={{ width: '100%' }} />
                                      <span
                                        style={{
                                          marginTop: theme.spacing(-1.25),
                                          backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fafafa'
                                        }}
                                      >
                                        &nbsp;&nbsp;&nbsp;{t('new_chat')}&nbsp;&nbsp;&nbsp;
                                      </span>
                                    </div>
                                  </div>
                                ) : null
                              ) : (
                                <Stack
                                  key={id}
                                  direction={isXS ? 'column' : message.role === 'assistant' ? 'row' : 'row-reverse'}
                                  p={1}
                                  spacing={1}
                                  style={{ wordBreak: 'break-word' }}
                                >
                                  {message.role === 'assistant' ? (
                                    <Avatar>
                                      <SmartToyOutlinedIcon />
                                    </Avatar>
                                  ) : (
                                    <AppAvatar url={appUser.user.avatar} email={appUser.user.email} />
                                  )}
                                  <Paper
                                    sx={{
                                      p: 0,
                                      backgroundColor: message.isInsight
                                        ? theme.palette.mode === 'dark'
                                          ? '#414f65'
                                          : '#BADDFB'
                                        : message.isError
                                          ? theme.palette.mode === 'dark'
                                            ? '#4f1717'
                                            : '#ffe2e2'
                                          : theme.palette.background.paper
                                    }}
                                  >
                                    <AIMarkdown markdown={message.content} truncated={false} dense />
                                  </Paper>
                                </Stack>
                              )
                            )}
                          {thinking && (
                            <Stack direction="row" p={1} spacing={1} style={{ wordBreak: 'break-word' }}>
                              <Avatar>
                                <SmartToyOutlinedIcon />
                              </Avatar>
                              <Paper
                                sx={{
                                  p: 1,
                                  backgroundColor: theme.palette.background.paper
                                }}
                              >
                                <ThinkingBadge />
                              </Paper>
                            </Stack>
                          )}
                        </div>
                        {currentInsights.length > 0 && (
                          <Stack direction="row-reverse" mt={0.75} ml={1} mr={1} spacing={1}>
                            {currentInsights.map((insight, id) => (
                              <CustomChip
                                key={id}
                                variant="outlined"
                                color="primary"
                                label={t(`insight.${insight.type}`)}
                                tooltip={insight.value}
                                tooltipPlacement="top-end"
                                size="small"
                                onClick={() => askAssistantWithInsight(insight)}
                              />
                            ))}
                          </Stack>
                        )}
                        <div
                          style={{
                            display: 'flex',
                            margin: `${theme.spacing(0)} ${theme.spacing(1)} ${theme.spacing(1)} ${theme.spacing(1)} `
                          }}
                        >
                          <TextField
                            inputRef={inputRef}
                            value={currentInput}
                            onChange={handleInputChange}
                            onKeyDown={onKeyDown}
                            fullWidth
                            size="small"
                            disabled={thinking}
                            sx={{}}
                            margin="dense"
                            InputProps={{
                              endAdornment: (
                                <>
                                  <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                                  <Tooltip title={t('send')} placement="left">
                                    <span>
                                      <Button
                                        onClick={askAssistant}
                                        disabled={thinking || currentInput === ''}
                                        size="small"
                                        sx={{
                                          minWidth: 0,
                                          padding: `${theme.spacing(0.5)} ${theme.spacing(1.5)}`,
                                          marginRight: theme.spacing(-1)
                                        }}
                                      >
                                        <SendOutlinedIcon />
                                      </Button>
                                    </span>
                                  </Tooltip>
                                </>
                              )
                            }}
                          />
                        </div>
                      </div>
                    </Paper>
                    <Arrow className="MuiPopper-arrow" />
                  </div>
                </Fade>
              )}
            </Popper>
          </Backdrop>
          <Tooltip title={t('title')} placement="left">
            <Fab
              color="primary"
              onClick={event => toggleAssistant(event.currentTarget)}
              size="medium"
              sx={{
                backgroundColor: theme.palette.mode === 'dark' ? '#616161' : '#888'
              }}
            >
              <Badge variant="dot" invisible={!hasInsights} color="primary">
                <AssistantIcon />
              </Badge>
            </Fab>
          </Tooltip>
        </div>
      )}
    </>
  );
});
