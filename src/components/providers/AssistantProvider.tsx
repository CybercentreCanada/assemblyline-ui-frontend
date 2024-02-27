import AssistantIcon from '@mui/icons-material/Assistant';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import {
  Avatar,
  Backdrop,
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
import { AppUser } from 'commons/components/app/AppUserService';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import AppAvatar from 'commons/components/display/AppAvatar';
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
  role: 'system' | 'user' | 'assistant';
  content: string;
  isError?: boolean;
  isInsight?: boolean;
}

export const AssistantContext = React.createContext<AssistantContextProps>(null);

function AssistantProvider({ children }: AssistantProviderProps) {
  const { t } = useTranslation(['assistant']);
  const theme = useTheme();
  const appUser = useAppUser<AppUser>();
  const { user: currentUser, configuration, c12nDef } = useALContext();
  const { apiCall } = useMyAPI();

  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [arrowRef, setArrowRef] = React.useState(null);
  const [currentInsights, setCurrentInsights] = React.useState<AssistantInsightProps[]>([]);
  const [thinking, setThinking] = React.useState(false);
  const [currentContext, setCurrentContext] = React.useState<ContextMessageProps[]>([]);
  const [currentHistory, setCurrentHistory] = React.useState<ContextMessageProps[]>([]);
  const [currentInput, setCurrentInput] = React.useState<string>('');
  const [serviceList, setServiceList] = React.useState(null);
  const upSM = useMediaQuery(theme.breakpoints.up('md'));
  const isXS = useMediaQuery(theme.breakpoints.only('xs'));
  const inputRef = React.useRef(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
    setOpen(!open);

    setTimeout(() => {
      inputRef.current.focus();
    }, 250);
  };

  const addInsight = (insight: AssistantInsightProps) => {
    setCurrentInsights(current =>
      !current.some(i => i.type === insight.type && i.value === insight.value) ? [...current, insight] : current
    );
  };

  const removeInsight = (insight: AssistantInsightProps) => {
    setCurrentInsights(current => [...current.filter(i => !(i.type === insight.type && i.value === insight.value))]);
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
  };

  const askAssistantWithInsight = (insight: AssistantInsightProps) => {
    setCurrentHistory(history => [
      ...history,
      { role: 'system', content: `"Default system prompt for insight: ${insight.type}`, isInsight: true },
      { role: 'user', content: `${t(`insight.${insight.type}`)}: ${insight.value}`, isInsight: true }
    ]);
    if (insight.type === 'submission' || insight.type === 'report') {
      apiCall({
        method: 'GET',
        url: `/api/v4/submission/ai/${insight.value}/?${insight.type === 'report' ? 'detailed&' : ''}with_trace`,
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
        url: `/api/v4/file/ai/${insight.value}/?with_trace`,
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
        url: `/api/v4/file/code_summary/${insight.value}/?with_trace`,
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
  };

  const buildDefaultSystemMessage = () => {
    // Automatically create the prompting of the score ranges
    const scoring = `Assemblyline uses a scoring mechanism where any scores below
${configuration.submission.verdicts.info} is considered safe, scores between
${configuration.submission.verdicts.info} and ${configuration.submission.verdicts.suspicious}
are considered informational, scores between ${configuration.submission.verdicts.suspicious}
and ${configuration.submission.verdicts.highly_suspicious} are considered suspicious,
scores between ${configuration.submission.verdicts.highly_suspicious} and
${configuration.submission.verdicts.malicious} are considered highly-suspicious
and scores with ${configuration.submission.verdicts.malicious} points and up are
considered malicious.`.replaceAll('\n', ' ');

    // Create list of Assemblyline services
    const services = `\nAssemblyline does its processing using only the following services/plugins:\n${serviceList
      .map(srv => ` - name: ${srv.name}\n   category: ${srv.category}\n   description: """${srv.description}"""\n`)
      .join('')}`;

    // Define AL's classification engine
    const classification = `Assemblyline can classify/restrict access to its output with the following markings:\n${Object.keys(
      c12nDef.description
    )
      .map(marking => ` - ${marking}: ${c12nDef.description[marking]}\n`)
      .join('')}`;

    // Create the default system prompt
    const defaultSystemPrompt = {
      role: 'system' as 'system',
      content: [configuration.ui.ai.assistant.system_message, scoring, services, classification].join('\n')
    };

    return defaultSystemPrompt;
  };

  const clearAssistant = () => {
    const defaultSystemPrompt = buildDefaultSystemMessage();
    setCurrentContext([defaultSystemPrompt]);
    setCurrentHistory([defaultSystemPrompt]);
  };

  const resetAssistant = () => {
    const defaultSystemPrompt = buildDefaultSystemMessage();
    setCurrentContext([defaultSystemPrompt]);
    setCurrentHistory([...currentHistory, defaultSystemPrompt]);
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

  useEffect(() => {
    if (configuration) {
      apiCall({
        url: `/api/v4/service/all/`,
        onSuccess: api_data => {
          setServiceList(api_data.api_response);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuration]);

  useEffect(() => {
    if (configuration && serviceList !== null) {
      clearAssistant();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuration, serviceList]);

  return (
    <AssistantContext.Provider
      value={{
        addInsight,
        removeInsight
      }}
    >
      {children}
      {currentUser && currentUser.roles.includes('assistant_use') && configuration && configuration.ui.ai.enabled && (
        <div
          style={{
            display: 'flex',
            position: 'fixed',
            bottom: theme.spacing(2),
            right: upSM ? theme.spacing(4) : theme.spacing(2.5),
            zIndex: 1300
          }}
        >
          <Backdrop open={open} onClick={() => setOpen(false)}>
            <Popper
              // Note: The following zIndex style is specifically for documentation purposes and may not be necessary in your application.
              sx={{
                zIndex: 1301,
                width: upSM ? '65%' : '90%',
                maxWidth: '1024px',
                height: upSM ? '75%' : '85%',
                display: 'flex'
              }}
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
              onClick={event => event.stopPropagation()}
            >
              {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={350}>
                  <div style={{ flexGrow: 1, width: '100%' }}>
                    <Paper style={{ height: '100%', display: 'flex', overflow: 'hidden' }} elevation={3}>
                      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <div style={{ display: 'flex', padding: `${theme.spacing(0.25)} ${theme.spacing(1)}` }}>
                          <div style={{ flexGrow: 1, alignSelf: 'center' }}>
                            <Tooltip title={t('caveat')}>
                              <Typography variant="caption" style={{ color: theme.palette.text.disabled }}>
                                {t('watermark')}
                              </Typography>
                            </Tooltip>
                          </div>
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
                                          ? '#444d5c'
                                          : '#d0e7f3'
                                        : message.isError
                                        ? theme.palette.mode === 'dark'
                                          ? '#4f1717'
                                          : '#ffe2e2'
                                        : theme.palette.mode === 'dark'
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
                          <Stack direction={'row-reverse'} mt={0.75} ml={1} mr={1} spacing={1}>
                            {currentInsights.map(insight => (
                              <CustomChip
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
                                  <Tooltip title={t('send')}>
                                    <Button
                                      onClick={askAssistant}
                                      disabled={thinking}
                                      size="small"
                                      sx={{
                                        minWidth: 0,
                                        padding: `${theme.spacing(0.5)} ${theme.spacing(1.5)}`,
                                        marginRight: theme.spacing(-1)
                                      }}
                                    >
                                      <SendOutlinedIcon />
                                    </Button>
                                  </Tooltip>
                                </>
                              )
                            }}
                          />
                        </div>
                      </div>
                    </Paper>
                    <Arrow ref={setArrowRef} className="MuiPopper-arrow" />
                  </div>
                </Fade>
              )}
            </Popper>
          </Backdrop>
          <Tooltip title={t('title')}>
            <Fab color="primary" onClick={handleClick}>
              <AssistantIcon />
            </Fab>
          </Tooltip>
        </div>
      )}
    </AssistantContext.Provider>
  );
}

export default AssistantProvider;
