import type { ApiResponse } from 'core/api';
import { useApiCallFn } from 'core/api';
import { useAppConfig } from 'core/config';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppAssistantContextProps, AssistantInsightProps, AssistantMessageProps } from './assistant.models';

//*****************************************************************************************
// useAppAssistantAllowed
//*****************************************************************************************

/**
 * @name useAppAssistantAllowed
 * @description Determines if the current user has access to the assistant feature.
 * @returns Whether the assistant is allowed
 */
export const useAppAssistantAllowed = (): boolean => {
  const userRoles = useAppConfig(s => s?.user?.roles);
  const aiEnabled = useAppConfig(s => s?.configuration?.ui?.ai?.enabled);

  return useMemo(() => Boolean(userRoles?.includes('assistant_use') && aiEnabled), [userRoles, aiEnabled]);
};

//*****************************************************************************************
// useAppAssistantState
//*****************************************************************************************

/**
 * @name useAppAssistantState
 * @description Internal hook that manages the full assistant state for the provider.
 * @returns AppAssistantContextProps plus internal state for the UI
 */
export const useAppAssistantState = (): AppAssistantContextProps & {
  anchorEl: HTMLElement | null;
  askAssistant: () => void;
  askAssistantWithInsight: (insight: AssistantInsightProps) => void;
  chatRef: React.RefObject<HTMLDivElement>;
  clearAssistant: () => void;
  currentHistory: AssistantMessageProps[];
  currentInput: string;
  currentInsights: AssistantInsightProps[];
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  onKeyDown: (event: React.KeyboardEvent) => void;
  open: boolean;
  resetAssistant: () => void;
  setOpen: (value: boolean) => void;
  thinking: boolean;
} => {
  const { t, i18n } = useTranslation(['assistant']);
  const apiCallFn = useApiCallFn<ApiResponse<{ trace: AssistantMessageProps[] }>>();
  const assistantAllowed = useAppAssistantAllowed();

  const [open, setOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [currentInsights, setCurrentInsights] = useState<AssistantInsightProps[]>([]);
  const [thinking, setThinking] = useState<boolean>(false);
  const [currentContext, setCurrentContext] = useState<AssistantMessageProps[]>([]);
  const [currentHistory, setCurrentHistory] = useState<AssistantMessageProps[]>([]);
  const [currentInput, setCurrentInput] = useState<string>('');

  const inputRef = { current: null } as React.RefObject<HTMLInputElement>;
  const chatRef = { current: null } as React.RefObject<HTMLDivElement>;

  const hasInsights = useMemo(() => currentInsights.length !== 0, [currentInsights]);

  const lang = useMemo(() => (i18n.language === 'en' ? 'english' : 'french'), [i18n.language]);

  const buildDefaultSystemMessage = useCallback((): AssistantMessageProps => ({ role: 'system', content: null }), []);

  const toggleAssistant = useCallback((target: HTMLElement) => {
    setAnchorEl(target);
    setOpen(prev => !prev);
  }, []);

  const addInsight = useCallback((insight: AssistantInsightProps) => {
    setCurrentInsights(current =>
      !current.some(i => i.type === insight.type && i.value === insight.value) ? [...current, insight] : current
    );
  }, []);

  const removeInsight = useCallback((insight: AssistantInsightProps) => {
    setCurrentInsights(current => current.filter(i => !(i.type === insight.type && i.value === insight.value)));
  }, []);

  const focusInput = useCallback(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 250);
  }, [inputRef]);

  const askAssistant = useCallback(() => {
    const data = [...currentContext];
    const history = [...currentHistory];
    const newUserQuestion: AssistantMessageProps = { role: 'user', content: currentInput };
    data.push(newUserQuestion);
    history.push(newUserQuestion);
    setCurrentContext(data);
    setCurrentHistory(history);
    setCurrentInput('');

    apiCallFn({
      method: 'POST',
      body: data,
      url: `/api/v4/assistant/?lang=${lang}`,
      onEnter: () => setThinking(true),
      onSuccess: response => {
        setCurrentContext(response.api_response.trace);
        setCurrentHistory([...history, ...response.api_response.trace.slice(-1)]);
      },
      onFailure: error => {
        setCurrentHistory([
          ...history,
          { role: 'assistant', content: (error as ApiResponse<string>).api_error_message, isError: true }
        ]);
      },
      onExit: () => {
        setThinking(false);
        focusInput();
      }
    });
  }, [apiCallFn, currentContext, currentHistory, currentInput, focusInput, lang]);

  const askAssistantWithInsight = useCallback(
    (insight: AssistantInsightProps) => {
      setCurrentHistory(history => [
        ...history,
        { role: 'system', content: `"Default system prompt for insight: ${insight.type}`, isInsight: true },
        { role: 'user', content: `${t(`insight.${insight.type}`)}: ${insight.value}`, isInsight: true }
      ]);

      const urlMap: Record<string, string> = {
        submission: `/api/v4/submission/ai/${insight.value}/?lang=${lang}&with_trace`,
        report: `/api/v4/submission/ai/${insight.value}/?lang=${lang}&detailed&with_trace`,
        file: `/api/v4/file/ai/${insight.value}/?lang=${lang}&with_trace`,
        code: `/api/v4/file/code_summary/${insight.value}/?lang=${lang}&with_trace`
      };

      const url = urlMap[insight.type];
      if (!url) return;

      apiCallFn({
        method: 'GET',
        url,
        onEnter: () => setThinking(true),
        onSuccess: response => {
          setCurrentContext(response.api_response.trace);
          setCurrentHistory(history => [...history, ...response.api_response.trace.slice(-1)]);
        },
        onFailure: error => {
          setCurrentHistory(history => [
            ...history,
            { role: 'assistant', content: (error as ApiResponse<string>).api_error_message, isError: true }
          ]);
        },
        onExit: () => {
          setThinking(false);
          focusInput();
        }
      });
    },
    [apiCallFn, focusInput, lang, t]
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
      setCurrentHistory(prev => [...prev, defaultSystemPrompt]);
    }
  }, [buildDefaultSystemMessage, currentHistory]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
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
    clearAssistant();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, left: 0, behavior: 'smooth' });
    }
  }, [chatRef, currentHistory, thinking]);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
      }, 50);
      focusInput();
    }
  }, [chatRef, focusInput, open]);

  return {
    addInsight,
    anchorEl,
    askAssistant,
    askAssistantWithInsight,
    assistantAllowed,
    chatRef,
    clearAssistant,
    currentHistory,
    currentInput,
    currentInsights,
    handleInputChange,
    hasInsights,
    inputRef,
    onKeyDown,
    open,
    removeInsight,
    resetAssistant,
    setOpen,
    thinking,
    toggleAssistant
  };
};
