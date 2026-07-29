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
import MuiPopper from '@mui/material/Popper';
import { styled } from '@mui/material/styles';
import { AppAvatar } from '@tui/core';
import useALContext from 'deprecated/hooks/useALContext';
import useMyAPI from 'deprecated/hooks/useMyAPI';
import { isEnter } from 'deprecated/utils/keyboard';
import type { AssistantContextProps, AssistantInsightProps, ContextMessageProps } from 'layout/assistant';
import { useAppAssistantStore, useAppAssistantStoreApi } from 'layout/assistant/assistant.store';
import type { PropsWithChildren } from 'react';
import React, { createContext, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AIMarkdown from 'ui/AiMarkdown';
import CustomChip from 'ui/CustomChip';
import { ThinkingBadge } from 'ui/ThinkingBadge';

const Popper = styled(MuiPopper)(() => ({
  zIndex: 1,
  '& > div': {
    position: 'relative'
  },
  '&[data-popper-placement*="top"]': {
    '& > div': {
      marginBottom: 12
    }
  }
}));

const Arrow = styled('div')(({ theme }) => ({
  position: 'absolute',
  right: 18,
  '&::before': {
    content: '""',
    margin: 'auto',
    display: 'block',
    width: 12,
    height: 12,
    backgroundColor: theme.palette.background.paper,
    transform: 'translateY(-50%) rotate(45deg)',
    boxShadow: '2px 2px 2px 0px rgb(0 0 0 / 25%)',
    borderRadius: '3px 0px'
  }
}));

export const AppAssistantContext = createContext<AssistantContextProps>(null);

export const AppAssistantProvider = memo(({ children }: PropsWithChildren) => {
  const { user: currentUser, configuration } = useALContext();

  const storeApi = useAppAssistantStoreApi();
  const hasInsights = useAppAssistantStore(s => s.insights?.length > 0);

  const assistantAllowed = useMemo<boolean>(
    () => !!(currentUser?.roles.includes('assistant_use') && configuration?.ui.ai.enabled),
    [configuration, currentUser]
  );

  const toggleAssistant = useCallback(() => {
    storeApi?.setState(prev => ({ open: !prev.open }));
  }, [storeApi]);

  const addInsight = useCallback(
    (insight: AssistantInsightProps) => {
      storeApi?.setState(prev => ({
        insights: prev.insights.some(i => i.type === insight.type && i.value === insight.value)
          ? prev.insights
          : [...prev.insights, insight]
      }));
    },
    [storeApi]
  );

  const removeInsight = useCallback(
    (insight: AssistantInsightProps) => {
      storeApi?.setState(prev => ({
        insights: prev.insights.filter(i => !(i.type === insight.type && i.value === insight.value))
      }));
    },
    [storeApi]
  );

  const contextValue = useMemo(
    () => ({ assistantAllowed, addInsight, hasInsights, removeInsight, toggleAssistant }),
    [assistantAllowed, addInsight, hasInsights, removeInsight, toggleAssistant]
  );

  return <AppAssistantContext.Provider value={contextValue}>{children}</AppAssistantContext.Provider>;
});

AppAssistantProvider.displayName = 'AppAssistantProvider';

export const AppAssistantLayout = memo(({ children }: PropsWithChildren) => {
  const { t, i18n } = useTranslation(['assistant']);
  const theme = useTheme();
  const { user: currentUser, configuration } = useALContext();
  const { apiCall } = useMyAPI();

  const currentInsights = useAppAssistantStore(s => s.insights);
  const hasInsights = useAppAssistantStore(s => s.insights?.length > 0);
  const open = useAppAssistantStore(s => s.open);
  const storeApi = useAppAssistantStoreApi();

  const [anchorEl, setAnchorEl] = useState(null);
  const [thinking, setThinking] = useState<boolean>(false);
  const [currentContext, setCurrentContext] = useState<ContextMessageProps[]>([]);
  const [currentHistory, setCurrentHistory] = useState<ContextMessageProps[]>([]);
  const [currentInput, setCurrentInput] = useState<string>('');

  const inputRef = useRef(null);
  const chatRef = useRef(null);

  const upSM = useMediaQuery(theme.breakpoints.up('md'));
  const isXS = useMediaQuery(theme.breakpoints.only('xs'));

  const assistantAllowed = useMemo<boolean>(
    () => currentUser && currentUser.roles.includes('assistant_use') && configuration && configuration.ui.ai.enabled,
    [configuration, currentUser]
  );

  const toggleAssistant = useCallback(
    (target: EventTarget) => {
      setAnchorEl(target);
      storeApi?.setState(prev => ({ open: !prev.open }));
    },
    [storeApi]
  );

  const askAssistant = useCallback(() => {
    const data = [...currentContext];
    const history = [...currentHistory];
    const newUserQuestion = { role: 'user' as const, content: currentInput };
    data.push(newUserQuestion);
    history.push(newUserQuestion);
    setCurrentContext(data);
    setCurrentHistory(history);
    setCurrentInput('');
    apiCall({
      method: 'POST',
      body: data,
      url: `/api/v4/assistant/?lang=${i18n.language === 'en' ? 'english' : 'french'}`,
      onSuccess: api_data => {
        setCurrentContext(api_data.api_response.trace);
        setCurrentHistory([...history, ...api_data.api_response.trace.slice(-1)]);
      },
      onFailure: api_data =>
        setCurrentHistory([...history, { role: 'assistant', content: api_data.api_error_message, isError: true }]),
      onEnter: () => setThinking(true),
      onFinalize: () => {
        setThinking(false);

        setTimeout(() => {
          inputRef.current.focus();
        }, 250);
      }
    });
  }, [currentContext, currentHistory, currentInput, i18n.language]);

  const askAssistantWithInsight = useCallback(
    (insight: AssistantInsightProps) => {
      setCurrentHistory(history => [
        ...history,
        { role: 'system', content: `"Default system prompt for insight: ${insight.type}`, isInsight: true },
        { role: 'user', content: `${t(`insight.${insight.type}`)}: ${insight.value}`, isInsight: true }
      ]);
      if (insight.type === 'submission' || insight.type === 'report') {
        apiCall({
          method: 'GET',
          url: `/api/v4/submission/ai/${insight.value}/?lang=${i18n.language === 'en' ? 'english' : 'french'}&${
            insight.type === 'report' ? 'detailed&' : ''
          }with_trace`,
          onSuccess: api_data => {
            setCurrentContext(api_data.api_response.trace);
            setCurrentHistory(history => [...history, ...api_data.api_response.trace.splice(-1)]);
          },
          onFailure: api_data =>
            setCurrentHistory(history => [
              ...history,
              { role: 'assistant', content: api_data.api_error_message, isError: true }
            ]),
          onEnter: () => setThinking(true),
          onFinalize: () => {
            setThinking(false);

            setTimeout(() => {
              inputRef.current.focus();
            }, 250);
          }
        });
      } else if (insight.type === 'file') {
        apiCall({
          method: 'GET',
          url: `/api/v4/file/ai/${insight.value}/?lang=${i18n.language === 'en' ? 'english' : 'french'}&with_trace`,
          onSuccess: api_data => {
            setCurrentContext(api_data.api_response.trace);
            setCurrentHistory(history => [...history, ...api_data.api_response.trace.splice(-1)]);
          },
          onFailure: api_data =>
            setCurrentHistory(history => [
              ...history,
              { role: 'assistant', content: api_data.api_error_message, isError: true }
            ]),
          onEnter: () => setThinking(true),
          onFinalize: () => {
            setThinking(false);

            setTimeout(() => {
              inputRef.current.focus();
            }, 250);
          }
        });
      } else if (insight.type === 'code') {
        apiCall({
          method: 'GET',
          url: `/api/v4/file/code_summary/${insight.value}/?lang=${
            i18n.language === 'en' ? 'english' : 'french'
          }&with_trace`,
          onSuccess: api_data => {
            setCurrentContext(api_data.api_response.trace);
            setCurrentHistory(history => [...history, ...api_data.api_response.trace.splice(-1)]);
          },
          onFailure: api_data =>
            setCurrentHistory(history => [
              ...history,
              { role: 'assistant', content: api_data.api_error_message, isError: true }
            ]),
          onEnter: () => setThinking(true),
          onFinalize: () => {
            setThinking(false);

            setTimeout(() => {
              inputRef.current.focus();
            }, 250);
          }
        });
      }
    },
    [i18n.language, t]
  );

  const buildDefaultSystemMessage = useCallback(
    (): ContextMessageProps => ({ role: 'system' as const, content: null }),
    []
  );

  const clearAssistant = useCallback(() => {
    const defaultSystemPrompt = buildDefaultSystemMessage();
    setCurrentContext([defaultSystemPrompt]);
    setCurrentHistory([defaultSystemPrompt]);
  }, [buildDefaultSystemMessage]);

  const resetAssistant = useCallback(() => {
    const defaultSystemPrompt = buildDefaultSystemMessage();
    const lastPrompt = currentHistory[currentHistory.length - 1];
    setCurrentContext([defaultSystemPrompt]);
    if (lastPrompt?.content !== defaultSystemPrompt.content) {
      setCurrentHistory([...currentHistory, defaultSystemPrompt]);
    }
  }, [buildDefaultSystemMessage, currentHistory]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (isEnter(event.key)) {
        askAssistant();
      }
    },
    [askAssistant]
  );

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentInput(event.target.value);
  }, []);

  useEffect(() => {
    if (open && currentContext.length === 1) {
      askAssistant();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (configuration) {
      clearAssistant();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuration, i18n.language]);

  useEffect(() => {
    if (chatRef && chatRef.current)
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, left: 0, behavior: 'smooth' });
  }, [currentHistory, thinking]);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (chatRef && chatRef.current) chatRef.current.scrollTo(0, chatRef.current.scrollHeight);
      }, 50);

      setTimeout(() => {
        inputRef.current.focus();
      }, 250);
    }
  }, [open]);

  return (
    <>
      {children}
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
          <Backdrop open={open} onClick={() => storeApi?.setState({ open: false })}>
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
                                    <AppAvatar url={currentUser.avatar} email={currentUser.email} />
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

AppAssistantLayout.displayName = 'AppAssistantLayout';
