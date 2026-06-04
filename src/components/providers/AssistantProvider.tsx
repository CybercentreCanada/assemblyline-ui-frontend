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
import { fetchServerSentEvents } from '@tanstack/ai-client';
import { useChat } from '@tanstack/ai-react';
import type { AppUser } from 'commons/components/app/AppUserService';
import { useAppUser } from 'commons/components/app/hooks';
import AppAvatar from 'commons/components/display/AppAvatar';
import { isEnter } from 'commons/components/utils/keyboard';
import useALContext from 'components/hooks/useALContext';
import AIMarkdown from 'components/visual/AiMarkdown';
import CustomChip from 'components/visual/CustomChip';
import { ThinkingBadge } from 'components/visual/ThinkingBadge';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

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

export type AssistantContextProps = {
  assistantAllowed: boolean;
  hasInsights: boolean;
  addInsight: (insigh: AssistantInsightProps) => void;
  removeInsight: (insigh: AssistantInsightProps) => void;
  toggleAssistant: (event: any) => void;
};

export interface AssistantProviderProps {
  children: React.ReactNode;
}

export interface AssistantInsightProps {
  type: 'file' | 'submission' | 'code' | 'report';
  value: string;
}

export const AssistantContext = React.createContext<AssistantContextProps>(null);

function AssistantProvider({ children }: AssistantProviderProps) {
  const { t } = useTranslation(['assistant']);
  const theme = useTheme();
  const appUser = useAppUser<AppUser>();
  const { user: currentUser, configuration } = useALContext();

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentInsights, setCurrentInsights] = useState<AssistantInsightProps[]>([]);
  const [hasInsights, setHasInsights] = useState<boolean>(false);
  const upSM = useMediaQuery(theme.breakpoints.up('md'));
  const isXS = useMediaQuery(theme.breakpoints.only('xs'));
  const inputRef = useRef(null);
  const chatRef = useRef(null);
  const [currentInput, setCurrentInput] = useState<string>('');

  const { messages, sendMessage, isLoading, clear } = useChat({
    connection: fetchServerSentEvents('/api/v4/assistant/chat')
  });

  const assistantAllowed =
    currentUser && currentUser.roles.includes('assistant_use') && configuration && configuration.ui.ai.enabled;

  const toggleAssistant = target => {
    setAnchorEl(target);
    setOpen(!open);
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
    if (!currentInput.trim()) return;
    sendMessage({ content: currentInput });
    setCurrentInput('');
  };

  const askAssistantWithInsight = (insight: AssistantInsightProps) => {
    const prompt = `${t(`insight.${insight.type}`)}: ${insight.value}`;
    sendMessage({ content: prompt });
  };

  const clearAssistant = () => {
    clear();
  };

  const resetAssistant = () => {
    clear();
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
    if (chatRef && chatRef.current)
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, left: 0, behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => setHasInsights(currentInsights.length !== 0), [currentInsights]);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (chatRef && chatRef.current) chatRef.current.scrollTo(0, chatRef.current.scrollHeight);
      }, 50);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 250);
    }
  }, [open]);

  return (
    <AssistantContext.Provider
      value={{
        assistantAllowed,
        addInsight,
        hasInsights,
        removeInsight,
        toggleAssistant
      }}
    >
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
                          {messages.length === 0 && !isLoading && (
                            <Stack
                              direction={isXS ? 'column' : 'row'}
                              p={1}
                              spacing={1}
                              style={{ wordBreak: 'break-word' }}
                            >
                              <Avatar>
                                <SmartToyOutlinedIcon />
                              </Avatar>
                              <Paper sx={{ p: 0, backgroundColor: theme.palette.background.paper }}>
                                <AIMarkdown markdown={t('greeting')} truncated={false} dense />
                              </Paper>
                            </Stack>
                          )}
                          {messages.map(message => (
                            <Stack
                              key={message.id}
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
                                  backgroundColor: theme.palette.background.paper
                                }}
                              >
                                <AIMarkdown
                                  markdown={message.parts
                                    .filter(p => p.type === 'text')
                                    .map(p => p.content)
                                    .join('')}
                                  truncated={false}
                                  dense
                                />
                              </Paper>
                            </Stack>
                          ))}
                          {isLoading && (
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
                            disabled={isLoading}
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
                                        disabled={isLoading || currentInput === ''}
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
    </AssistantContext.Provider>
  );
}

export default AssistantProvider;
