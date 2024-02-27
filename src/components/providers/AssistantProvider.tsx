import AssistantIcon from '@mui/icons-material/Assistant';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import {
  Avatar,
  Button,
  ClickAwayListener,
  Divider,
  Fab,
  Fade,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import MuiPopper from '@mui/material/Popper';
import { styled } from '@mui/material/styles';
import { AppUser } from 'commons/components/app/AppUserService';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import AppAvatar from 'commons/components/display/AppAvatar';
import { useEffectOnce } from 'commons/components/utils/hooks/useEffectOnce';
import { isEnter } from 'commons/components/utils/keyboard';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import AIMarkdown from 'components/visual/AiMarkdown';
import CustomChip from 'components/visual/CustomChip';
import { ThinkingBadge } from 'components/visual/ThinkingBadge';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const Popper = styled(MuiPopper, {
  shouldForwardProp: prop => prop !== 'arrow'
})(({ theme }) => ({
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
  '&::before': {
    content: '""',
    margin: 'auto',
    display: 'block',
    width: 14,
    height: 14,
    backgroundColor: theme.palette.background.paper,
    transform: 'translateY(-50%) rotate(45deg)',
    boxShadow: '2px 2px 2px 0px rgb(0 0 0 / 25%)',
    borderRadius: '3px 0px'
  }
}));

export type AssistantContextProps = {
  addInsight: (insigh: AssistantInsightProps) => void;
  removeInsight: (insigh: AssistantInsightProps) => void;
};

export interface AssistantProviderProps {
  children: React.ReactNode;
}

export interface AssistantInsightProps {
  type: 'file' | 'submission' | 'code' | 'report';
  value: string;
}

interface ContextMessageProps {
  role: 'system' | 'user' | 'assistant' | 'al';
  content: string;
}

const DEFAULT_CONTEXT = [
  {
    role: 'system' as 'system',
    content:
      'You are the Assemblyline AI Assistant, you are here to help users understand the different outputs of Assemblyline.'
  }
];

export const AssistantContext = React.createContext<AssistantContextProps>(null);

const ASSISTANT_EVENT_ADD_INSIGHT = 'Assistant.AddInsight';
const ASSISTANT_EVENT_REMOVE_INSIGHT = 'Assistant.RemoveInsight';

function AssistantProvider({ children }: AssistantProviderProps) {
  const { t } = useTranslation(['assistant']);
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [arrowRef, setArrowRef] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const appUser = useAppUser<AppUser>();
  const { configuration } = useALContext();

  const { apiCall } = useMyAPI();
  const [currentInsights, setCurrentInsights] = React.useState<AssistantInsightProps[]>([]);
  const [thinking, setThinking] = React.useState(false);
  const [currentContext, setCurrentContext] = React.useState<ContextMessageProps[]>([]);
  const [currentHistory, setCurrentHistory] = React.useState<ContextMessageProps[]>([]);
  const [currentInput, setCurrentInput] = React.useState<string>('');
  const inputRef = React.useRef(null);

  useEffect(() => {
    const proceedAddInsight = (event: CustomEvent) => {
      const { detail: insight } = event;
      if (!currentInsights.some(i => i.type === insight.type && i.value === insight.value)) {
        setCurrentInsights([...currentInsights, insight]);
      }
    };

    const proceedRemoveInsight = (event: CustomEvent) => {
      const { detail: insight } = event;
      setCurrentInsights([...currentInsights.filter(i => !(i.type === insight.type && i.value === insight.value))]);
    };

    window.addEventListener(ASSISTANT_EVENT_ADD_INSIGHT, proceedAddInsight);
    window.addEventListener(ASSISTANT_EVENT_REMOVE_INSIGHT, proceedRemoveInsight);
    return () => {
      window.removeEventListener(ASSISTANT_EVENT_ADD_INSIGHT, proceedAddInsight);
      window.removeEventListener(ASSISTANT_EVENT_REMOVE_INSIGHT, proceedRemoveInsight);
    };
  }, [currentInsights]);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
    setOpen(!open);

    setTimeout(() => {
      inputRef.current.focus();
    }, 250);
  };

  const addInsight = (insight: AssistantInsightProps) => {
    setTimeout(
      () => {
        window.dispatchEvent(new CustomEvent(ASSISTANT_EVENT_ADD_INSIGHT, { detail: insight }));
      },
      // We will delay adding insight event as it is possible that by switching page we try to re-add right away
      // what we just remove and the events get proceesed in the wrong order
      500
    );
  };

  const removeInsight = (insight: AssistantInsightProps) => {
    window.dispatchEvent(new CustomEvent(ASSISTANT_EVENT_REMOVE_INSIGHT, { detail: insight }));
  };

  const askAssistant = () => {
    const data = [...currentContext];
    const history = [...currentHistory];
    const newUserQuestion = { role: 'user' as 'user', content: currentInput };
    data.push(newUserQuestion);
    history.push(newUserQuestion);
    setCurrentContext(data);
    setCurrentHistory(history);
    setCurrentInput('');
    apiCall({
      method: 'POST',
      body: data,
      url: `/api/v4/assistant/`,
      onSuccess: api_data => {
        setCurrentContext(api_data.api_response.trace);
        setCurrentHistory([...history, ...api_data.api_response.trace.slice(-1)]);
      },
      onEnter: () => setThinking(true),
      onFinalize: () => {
        setThinking(false);

        setTimeout(() => {
          inputRef.current.focus();
        }, 250);
      }
    });
  };

  const askAssistantWithInsight = (insight: AssistantInsightProps) => {
    if (insight.type === 'submission' || insight.type === 'report') {
      apiCall({
        method: 'GET',
        url: `/api/v4/submission/ai/${insight.value}/?${insight.type === 'report' ? 'detailed&' : ''}with_trace`,
        onSuccess: api_data => {
          setCurrentContext(api_data.api_response.trace);
          setCurrentHistory([...currentHistory, ...api_data.api_response.trace]);
        },
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
        url: `/api/v4/file/ai/${insight.value}/?with_trace`,
        onSuccess: api_data => {
          setCurrentContext(api_data.api_response.trace);
          setCurrentHistory([...currentHistory, ...api_data.api_response.trace]);
        },
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
        url: `/api/v4/file/code_summary/${insight.value}/?with_trace`,
        onSuccess: api_data => {
          setCurrentContext(api_data.api_response.trace);
          setCurrentHistory([...currentHistory, ...api_data.api_response.trace]);
        },
        onEnter: () => setThinking(true),
        onFinalize: () => {
          setThinking(false);

          setTimeout(() => {
            inputRef.current.focus();
          }, 250);
        }
      });
    }
  };

  const clearAssistant = () => {
    setCurrentContext([...DEFAULT_CONTEXT]);
    setCurrentHistory([...DEFAULT_CONTEXT]);
  };

  const resetAssistant = () => {
    setCurrentContext([...DEFAULT_CONTEXT]);
    setCurrentHistory([...currentHistory, ...DEFAULT_CONTEXT]);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (isEnter(event.key)) {
      askAssistant();
    }
  };

  const handleInputChange = event => {
    setCurrentInput(event.target.value);
  };

  useEffect(() => {
    if (currentContext.length === 1) {
      askAssistant();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffectOnce(() => {
    clearAssistant();
  });

  return (
    <AssistantContext.Provider
      value={{
        addInsight,
        removeInsight
      }}
    >
      {children}
      {configuration && configuration.ui.ai.enabled && (
        <ClickAwayListener onClickAway={() => setOpen(false)}>
          <div
            style={{
              display: 'flex',
              position: 'fixed',
              bottom: theme.spacing(2),
              right: theme.spacing(4),
              zIndex: 1300
            }}
          >
            <Popper
              // Note: The following zIndex style is specifically for documentation purposes and may not be necessary in your application.
              sx={{ zIndex: 1200, width: '50%', maxWidth: '960px', height: '75%', display: 'flex' }}
              style={{ marginBottom: theme.spacing(4) }}
              open={open}
              anchorEl={anchorEl}
              placement="top-end"
              transition
              modifiers={[
                {
                  name: 'arrow',
                  enabled: true,
                  options: {
                    element: arrowRef
                  }
                }
              ]}
            >
              {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={350}>
                  <div style={{ flexGrow: 1, width: '100%' }}>
                    <Paper style={{ height: '100%', display: 'flex', overflow: 'hidden' }} elevation={3}>
                      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <div style={{ display: 'flex', padding: theme.spacing(1) }}>
                          <Typography style={{ flexGrow: 1, alignSelf: 'center' }}>{t('title')}</Typography>
                          <Tooltip title={t('reset')}>
                            <IconButton onClick={resetAssistant} color="inherit">
                              <RestartAltOutlinedIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('clear')}>
                            <IconButton onClick={clearAssistant} color="inherit">
                              <ClearAllIcon />
                            </IconButton>
                          </Tooltip>
                        </div>
                        <div
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
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'center',
                                      marginTop: theme.spacing(2),
                                      marginBottom: theme.spacing(2)
                                    }}
                                  >
                                    <div
                                      style={{
                                        minWidth: '20rem',
                                        maxWidth: '40rem',
                                        textAlign: 'center',
                                        flexGrow: 1,
                                        color: theme.palette.text.disabled
                                      }}
                                    >
                                      <Divider />
                                      {t('new_chat')}
                                    </div>
                                  </div>
                                ) : null
                              ) : (
                                <Stack
                                  key={id}
                                  direction={message.role === 'assistant' ? 'row' : 'row-reverse'}
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
                                      backgroundColor:
                                        theme.palette.mode === 'dark'
                                          ? theme.palette.background.default
                                          : theme.palette.background.paper
                                    }}
                                  >
                                    <AIMarkdown markdown={message.content} truncated={false} dense />
                                  </Paper>
                                </Stack>
                              )
                            )}
                          {thinking && (
                            <Stack direction={'row'} p={1} spacing={1} style={{ wordBreak: 'break-word' }}>
                              <Avatar>
                                <SmartToyOutlinedIcon />
                              </Avatar>
                              <Paper
                                sx={{
                                  p: 1,
                                  backgroundColor:
                                    theme.palette.mode === 'dark'
                                      ? theme.palette.background.default
                                      : theme.palette.background.paper
                                }}
                              >
                                <ThinkingBadge />
                              </Paper>
                            </Stack>
                          )}
                        </div>
                        {currentInsights.length > 0 && (
                          <Stack direction={'row-reverse'} mt={1} ml={1} mr={1} spacing={1}>
                            {currentInsights.map(insight => (
                              <CustomChip
                                variant="outlined"
                                color="secondary"
                                label={t(`insight.${insight.type}`)}
                                tooltip={`ID: ${insight.value}`}
                                size="small"
                                onClick={() => askAssistantWithInsight(insight)}
                              />
                            ))}
                          </Stack>
                        )}
                        <div style={{ display: 'flex', margin: theme.spacing(1) }}>
                          <TextField
                            inputRef={inputRef}
                            value={currentInput}
                            onChange={handleInputChange}
                            onKeyDown={onKeyDown}
                            fullWidth
                            size="small"
                            disabled={thinking}
                          />
                          <Tooltip title={t('send')}>
                            <Button onClick={askAssistant} color="inherit" disabled={thinking}>
                              <SendOutlinedIcon />
                            </Button>
                          </Tooltip>
                        </div>
                      </div>
                    </Paper>
                    <Arrow ref={setArrowRef} className="MuiPopper-arrow" />
                  </div>
                </Fade>
              )}
            </Popper>
            <Tooltip title={t('title')}>
              <Fab color="primary" onClick={handleClick}>
                <AssistantIcon />
              </Fab>
            </Tooltip>
          </div>
        </ClickAwayListener>
      )}
    </AssistantContext.Provider>
  );
}

export default AssistantProvider;
