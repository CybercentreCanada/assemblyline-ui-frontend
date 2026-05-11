import { AssistantInsightProps } from './assistant.models';

export type UseAppAssistant = {
  assistantAllowed: boolean;
  hasInsights: boolean;
  addInsight: (insigh: AssistantInsightProps) => void;
  removeInsight: (insigh: AssistantInsightProps) => void;
  toggleAssistant: (event: any) => void;
};

export const useAppAssistant = () => {
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
  };

  const buildDefaultSystemMessage = (): ContextMessageProps => {
    return {
      role: 'system' as const,
      content: null
    };
  };

  const clearAssistant = () => {
    const defaultSystemPrompt = buildDefaultSystemMessage();
    setCurrentContext([defaultSystemPrompt]);
    setCurrentHistory([defaultSystemPrompt]);
  };

  const resetAssistant = () => {
    const defaultSystemPrompt = buildDefaultSystemMessage();
    const lastPrompt = currentHistory[currentHistory.length - 1];
    setCurrentContext([defaultSystemPrompt]);
    if (lastPrompt?.content !== defaultSystemPrompt.content) {
      setCurrentHistory([...currentHistory, defaultSystemPrompt]);
    }
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

  useEffect(() => setHasInsights(currentInsights.length !== 0), [currentInsights]);

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

  return {
    assistantAllowed,
    hasInsights,
    addInsight,
    removeInsight,
    toggleAssistant
  };
};
