import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  IInterviewSession,
  IInterviewMessage,
  InterviewStatus
} from '@interviewpilot/shared';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Clock,
  ArrowRight,
  StopCircle,
  ChevronLeft,
  Info,
  Check,
  Zap
} from 'lucide-react';

export const InterviewRoomPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [session, setSession] = useState<IInterviewSession | null>(null);
  const [messages, setMessages] = useState<IInterviewMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isConcluding, setIsConcluding] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };


  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  // Speech synthesis for AI messages
  const speakText = useCallback((text: string) => {
    if (!audioEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    // Strip markdown formatting for cleaner speech
    const cleanText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }, [audioEnabled]);

  // Speech-to-text recognition setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputText(prev => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      showToast('Speech recognition is not supported in this browser.', 'warning');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        showToast('Microphone active. Speak your response...', 'info');
      } catch {
        setIsListening(false);
      }
    }
  };

  // Fetch session & start live session if needed
  const initSession = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await api.get(`/interviews/${id}`);
      if (res.data.success) {
        const sess: IInterviewSession = res.data.data;
        setSession(sess);
        setMessages(sess.messages || []);

        if (sess.status === InterviewStatus.CONFIGURING || !sess.messages || sess.messages.length === 0) {
          // Trigger start live session
          const startRes = await api.post(`/interviews/${id}/start`);
          if (startRes.data.success) {
            setSession(startRes.data.data.session);
            setMessages(startRes.data.data.session.messages || [startRes.data.data.message]);
            if (startRes.data.data.message) {
              speakText(startRes.data.data.message.content);
            }
          }
        }
      } else {
        throw new Error(res.data.error?.message || 'Failed to load interview');
      }
    } catch (err: unknown) {
      const error = err as any;
      showToast(error.response?.data?.error?.message || error.message || 'Could not load interview session', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [id, showToast, speakText]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  // Elapsed Timer
  useEffect(() => {
    if (!session || session.status !== InterviewStatus.IN_PROGRESS) return;

    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [session?.status]);

  // Handle Send Candidate Response
  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text || !id || isSending) return;

    // Stop listening if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const tempCandidateMsg: IInterviewMessage = {
      id: `temp-${Date.now()}`,
      role: 'candidate',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempCandidateMsg]);
    setInputText('');
    setIsSending(true);

    try {
      const res = await api.post(`/interviews/${id}/turn`, { content: text });
      if (res.data.success) {
        const updatedSession: IInterviewSession = res.data.data.session;
        const newMsg: IInterviewMessage = res.data.data.message;
        setSession(updatedSession);
        setMessages(updatedSession.messages || [...messages, newMsg]);
        speakText(newMsg.content);

        if (res.data.data.stageAdvanced) {
          showToast(`Advanced to Stage ${updatedSession.currentStageIndex + 1}!`, 'info');
        }
      } else {
        throw new Error(res.data.error?.message || 'Failed to process turn');
      }
    } catch (err: unknown) {
      const error = err as any;
      showToast(error.response?.data?.error?.message || error.message || 'Error processing response', 'error');
    } finally {
      setIsSending(false);
    }
  };

  // Advance Stage Manually
  const handleAdvanceStage = async () => {
    if (!id || !session || isAdvancing) return;
    setIsAdvancing(true);
    try {
      const res = await api.post(`/interviews/${id}/advance-stage`);
      if (res.data.success) {
        const updatedSession: IInterviewSession = res.data.data.session;
        const newMsg: IInterviewMessage = res.data.data.message;
        setSession(updatedSession);
        setMessages(updatedSession.messages || [...messages, newMsg]);
        speakText(newMsg.content);
        showToast(`Now at Stage ${updatedSession.currentStageIndex + 1}: ${updatedSession.stages[updatedSession.currentStageIndex]?.title}`, 'info');
      }
    } catch (err: unknown) {
      const error = err as any;
      showToast(error.response?.data?.error?.message || error.message || 'Could not advance stage', 'error');
    } finally {
      setIsAdvancing(false);
    }
  };

  // Pause / Resume Session
  const handleTogglePause = async () => {
    if (!id || !session) return;
    const isPaused = session.status === InterviewStatus.PAUSED;
    const endpoint = isPaused ? `/interviews/${id}/resume` : `/interviews/${id}/pause`;

    try {
      const res = await api.post(endpoint);
      if (res.data.success) {
        setSession(res.data.data);
        showToast(isPaused ? 'Interview resumed' : 'Interview paused', 'info');
      }
    } catch (err: unknown) {
      const error = err as any;
      showToast(error.response?.data?.error?.message || error.message || 'Action failed', 'error');
    }
  };

  // Conclude Session
  const handleConclude = async () => {
    if (!id || isConcluding) return;
    if (!window.confirm('Are you sure you want to conclude this interview session? Your responses will be finalized.')) {
      return;
    }

    setIsConcluding(true);
    try {
      const res = await api.post(`/interviews/${id}/conclude`);
      if (res.data.success) {
        setSession(res.data.data);
        showToast('Interview completed! Summary compiled.', 'success');
        navigate('/interviews');
      }
    } catch (err: unknown) {
      const error = err as any;
      showToast(error.response?.data?.error?.message || error.message || 'Could not conclude interview', 'error');
    } finally {
      setIsConcluding(false);
    }
  };

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentStage = session?.stages[session?.currentStageIndex || 0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Initializing AI Interview Room...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Session Not Found</h2>
        <Link to="/interviews" className="text-brand-600 font-semibold hover:underline">
          Return to Interviews
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-7xl mx-auto animate-fade-in">
      {/* Top Header & Session Bar */}
      <div className="flex-shrink-0 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/interviews"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Back to Sessions"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                  {session.title}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{session.targetRole}</span>
                <span>•</span>
                <span className="uppercase font-bold text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {session.difficulty}
                </span>
                <span>•</span>
                <span className="uppercase font-bold text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                  {session.strictness}
                </span>
              </div>
            </div>
          </div>

          {/* Controls & Stopwatch */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio Speech Synthesis Toggle */}
            <button
              type="button"
              onClick={() => {
                setAudioEnabled(prev => !prev);
                showToast(!audioEnabled ? 'Voice narration enabled' : 'Voice narration muted', 'info');
              }}
              className={`p-2 rounded-xl border transition-colors ${
                audioEnabled
                  ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 border-brand-300 dark:border-brand-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-transparent hover:text-slate-800'
              }`}
              title={audioEnabled ? 'Voice Output ON' : 'Voice Output OFF'}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Stopwatch */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-brand-500" />
              {formatSeconds(elapsedSeconds)}
            </div>

            {/* Pause / Resume */}
            <button
              type="button"
              onClick={handleTogglePause}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title={session.status === InterviewStatus.PAUSED ? 'Resume' : 'Pause'}
            >
              {session.status === InterviewStatus.PAUSED ? (
                <Play className="w-4 h-4 fill-current text-emerald-500" />
              ) : (
                <Pause className="w-4 h-4" />
              )}
            </button>

            {/* Advance Stage */}
            {session.currentStageIndex < session.stages.length - 1 && (
              <button
                type="button"
                onClick={handleAdvanceStage}
                disabled={isAdvancing}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Next Stage
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Conclude Button */}
            <button
              type="button"
              onClick={handleConclude}
              disabled={isConcluding}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold hover:bg-rose-500/20 transition-colors disabled:opacity-50"
            >
              <StopCircle className="w-3.5 h-3.5" />
              End
            </button>
          </div>
        </div>

        {/* Stage Timeline Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {session.stages.map((stage, idx) => {
            const isCurrent = idx === session.currentStageIndex;
            const isDone = idx < session.currentStageIndex || stage.status === 'completed';

            return (
              <div
                key={stage.id}
                className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  isCurrent
                    ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/20 ring-1 ring-brand-500/50'
                    : isDone
                    ? 'border-slate-200 dark:border-slate-800 bg-emerald-500/5 text-slate-500'
                    : 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/40 text-slate-400'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-brand-500 text-white animate-pulse'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {isDone ? <Check className="w-3 h-3" /> : idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                    {stage.title}
                  </div>
                  <div className="text-[9px] text-slate-500 dark:text-slate-400">
                    {stage.durationMinutes} min
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Split Grid: Conversation Feed (Left 8-9 Cols) + Stage Intel Drawer (Right 3-4 Cols) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* Left Column: Chat Conversation Stream */}
        <div className="lg:col-span-8 flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden min-h-0">
          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map((msg, index) => {
              const isInterviewer = msg.role === 'interviewer';
              const isCandidate = msg.role === 'candidate';

              return (
                <div
                  key={msg.id || index}
                  className={`flex items-start gap-3 ${isCandidate ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm ${
                      isInterviewer
                        ? 'bg-gradient-to-tr from-brand-600 to-indigo-600 text-white'
                        : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    }`}
                  >
                    {isInterviewer ? <Sparkles className="w-4 h-4" /> : 'You'}
                  </div>

                  {/* Message Bubble */}
                  <div className={`max-w-[85%] sm:max-w-[78%] space-y-1.5 ${isCandidate ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        {isInterviewer ? 'AI Lead Interviewer' : 'Candidate Response'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        isCandidate
                          ? 'bg-brand-600 text-white rounded-tr-sm shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-tl-sm border border-slate-200/60 dark:border-slate-700/60 shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                    </div>

                    {/* Quick Follow-up Chips for Interviewer */}
                    {isInterviewer && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1 pl-1">
                        {msg.suggestedFollowUps.map(chip => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => setInputText(prev => (prev ? `${prev} ${chip}` : chip))}
                            className="text-[10px] font-medium px-2 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900 hover:bg-brand-100 transition-colors flex items-center gap-1"
                          >
                            <Zap className="w-2.5 h-2.5" />
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce delay-100" />
                    <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce delay-200" />
                  </div>
                  <span className="text-xs font-semibold">AI Interviewer evaluating response...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Candidate Input Console */}
          <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="relative">
              <textarea
                rows={3}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your technical response, code approach, or architectural solution... (Ctrl+Enter to send)"
                className="w-full pl-3.5 pr-24 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none shadow-inner"
              />

              <div className="absolute right-2.5 bottom-3 flex items-center gap-1.5">
                {/* Voice Dictation Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2 rounded-lg transition-all ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                  title={isListening ? 'Stop Listening' : 'Voice Input (Dictation)'}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Send Button */}
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isSending}
                  className="p-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title="Send Response"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
              <span>Press <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">Ctrl+Enter</kbd> to submit</span>
              <span>{inputText.length} characters</span>
            </div>
          </div>
        </div>

        {/* Right Column: Stage Intel & Guidance Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
              <Info className="w-3.5 h-3.5" />
              Active Stage Intel
            </div>

            {currentStage && (
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {currentStage.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {currentStage.description}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Evaluation Criteria for this Phase:
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside">
                <li>Clarity of functional & non-functional assumptions</li>
                <li>Depth in analyzing algorithmic edge cases & trade-offs</li>
                <li>Structured communication and architectural precision</li>
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Session Focus Topics:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {session.focusTopics.map(topic => (
                  <span
                    key={topic}
                    className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
