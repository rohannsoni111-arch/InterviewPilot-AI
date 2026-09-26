import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  IInterviewSession,
  IInterviewMessage,
  InterviewStatus,
  SupportedLanguage,
  IAudioSettings
} from '@interviewpilot/shared';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { CodeEditor } from '../components/CodeEditor/CodeEditor';
import { AudioVisualizer } from '../components/AudioVisualizer/AudioVisualizer';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Pause,
  Play,
  Clock,
  ArrowRight,
  StopCircle,
  ChevronLeft,
  Info,
  Check,
  Zap,
  Code2,
  MessageSquare,
  Columns
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
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [viewMode, setViewMode] = useState<'chat' | 'split' | 'code'>('split');

  const [audioSettings, setAudioSettings] = useState<IAudioSettings>({
    ttsEnabled: true,
    speechRate: 1.0,
    speechPitch: 1.0,
    sttLanguage: 'en-US',
    autoReadResponse: true
  });

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
  const speakText = useCallback(
    (text: string) => {
      if (!audioSettings.ttsEnabled || !('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_#`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = audioSettings.speechRate;
      utterance.pitch = audioSettings.speechPitch;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [audioSettings]
  );

  // Speech-to-text recognition setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = audioSettings.sttLanguage;

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
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
  }, [audioSettings.sttLanguage]);

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
          const startRes = await api.post(`/interviews/${id}/start`);
          if (startRes.data.success) {
            setSession(startRes.data.data.session);
            setMessages(startRes.data.data.session.messages || [startRes.data.data.message]);
            if (startRes.data.data.message && audioSettings.autoReadResponse) {
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
  }, [id, showToast, speakText, audioSettings.autoReadResponse]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  // Elapsed Timer
  useEffect(() => {
    if (!session || session.status !== InterviewStatus.IN_PROGRESS) return;

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [session?.status]);

  // Handle Send Candidate Response
  const handleSendMessage = async (customText?: string, codeSnippet?: { code: string; language: SupportedLanguage }) => {
    const text = (customText !== undefined ? customText : inputText).trim();
    if ((!text && !codeSnippet) || !id || isSending) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const tempCandidateMsg: IInterviewMessage = {
      id: `temp-${Date.now()}`,
      role: 'candidate',
      content: text || 'Submitted code implementation for review.',
      timestamp: new Date().toISOString(),
      codeSnippet: codeSnippet ? { code: codeSnippet.code, language: codeSnippet.language } : undefined
    };

    setMessages((prev) => [...prev, tempCandidateMsg]);
    if (!customText) setInputText('');
    setIsSending(true);

    try {
      const res = await api.post(`/interviews/${id}/turn`, {
        content: text || 'Submitted code implementation for review.',
        codeSnippet: codeSnippet ? { code: codeSnippet.code, language: codeSnippet.language } : undefined
      });
      if (res.data.success) {
        const updatedSession: IInterviewSession = res.data.data.session;
        const newMsg: IInterviewMessage = res.data.data.message;
        setSession(updatedSession);
        setMessages(updatedSession.messages || [...messages, newMsg]);
        if (audioSettings.autoReadResponse) {
          speakText(newMsg.content);
        }

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
        if (audioSettings.autoReadResponse) {
          speakText(newMsg.content);
        }
        showToast(
          `Now at Stage ${updatedSession.currentStageIndex + 1}: ${
            updatedSession.stages[updatedSession.currentStageIndex]?.title
          }`,
          'info'
        );
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
    if (!id || !session || isConcluding) return;
    const confirmEnd = window.confirm('Are you sure you want to conclude this interview session?');
    if (!confirmEnd) return;

    setIsConcluding(true);
    try {
      const res = await api.post(`/interviews/${id}/conclude`);
      if (res.data.success) {
        showToast('Interview concluded! Generating evaluation report...', 'success');
        navigate(`/interviews/${id}/report`);
      }
    } catch (err: unknown) {
      const error = err as any;
      showToast(error.response?.data?.error?.message || error.message || 'Could not conclude interview', 'error');
    } finally {
      setIsConcluding(false);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-medium text-sm animate-pulse">
          Connecting to AI Interview Room & Loading Workspace...
        </p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="text-red-500 text-lg font-bold">Interview session not found</div>
        <Link
          to="/interviews"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Interviews
        </Link>
      </div>
    );
  }

  const currentStage = session.stages[session.currentStageIndex];
  const isLastStage = session.currentStageIndex >= session.stages.length - 1;

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col gap-3 max-w-[1700px] mx-auto">
      {/* Live Room Top Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:px-5 shadow-lg flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/interviews"
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Exit to Interviews"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                  {session.title}
                </h1>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Live Room
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="capitalize font-medium text-indigo-400">{session.type.replace('_', ' ')}</span>
                <span>•</span>
                <span className="capitalize text-slate-300">Persona: {session.strictness.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Session Controls & View Switcher */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
              <button
                onClick={() => setViewMode('chat')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors ${
                  viewMode === 'chat' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Conversation Only View"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Chat</span>
              </button>

              <button
                onClick={() => setViewMode('split')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors ${
                  viewMode === 'split' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Split Screen Studio (Chat + Code)"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Split Studio</span>
              </button>

              <button
                onClick={() => setViewMode('code')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors ${
                  viewMode === 'code' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Code Workspace Only"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Code</span>
              </button>
            </div>

            {/* Elapsed Timer Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 font-bold">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>{formatTimer(elapsedSeconds)}</span>
              <span className="text-slate-500 font-normal">/ {session.durationMinutes}:00</span>
            </div>

            {/* Pause / Resume Button */}
            <button
              onClick={handleTogglePause}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title={session.status === InterviewStatus.PAUSED ? 'Resume Session' : 'Pause Session'}
            >
              {session.status === InterviewStatus.PAUSED ? (
                <Play className="w-4 h-4 text-emerald-400" />
              ) : (
                <Pause className="w-4 h-4" />
              )}
            </button>

            {/* Advance Stage Button */}
            {!isLastStage && (
              <button
                onClick={handleAdvanceStage}
                disabled={isAdvancing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors disabled:opacity-50"
              >
                <span>Next Stage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Conclude Session Button */}
            <button
              onClick={handleConclude}
              disabled={isConcluding}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold hover:bg-rose-500/20 transition-colors disabled:opacity-50"
            >
              <StopCircle className="w-3.5 h-3.5" />
              End
            </button>
          </div>
        </div>

        {/* Stage Timeline Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
          {session.stages.map((stage, idx) => {
            const isCurrent = idx === session.currentStageIndex;
            const isDone = idx < session.currentStageIndex || stage.status === 'completed';

            return (
              <div
                key={stage.id}
                className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  isCurrent
                    ? 'border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500/50'
                    : isDone
                    ? 'border-slate-800 bg-emerald-500/5 text-slate-500'
                    : 'border-slate-800/60 bg-slate-950/40 text-slate-400'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-indigo-500 text-white animate-pulse'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isDone ? <Check className="w-3 h-3" /> : idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-slate-200 truncate">{stage.title}</div>
                  <div className="text-[9px] text-slate-400">{stage.durationMinutes} min</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Grid (Supports Chat, Split Studio, and Code-focused views) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        {/* Left / Center: Conversation Stream (Rendered in Chat or Split mode) */}
        {(viewMode === 'chat' || viewMode === 'split') && (
          <div
            className={`${
              viewMode === 'chat' ? 'lg:col-span-8' : 'lg:col-span-6'
            } flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden min-h-0`}
          >
            {/* Audio Waveform Bar */}
            <div className="p-2 bg-slate-950 border-b border-slate-800">
              <AudioVisualizer
                isListening={isListening}
                isSpeaking={isSpeaking}
                audioSettings={audioSettings}
                onSettingsChange={setAudioSettings}
              />
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg, index) => {
                const isInterviewer = msg.role === 'interviewer';
                const isCandidate = msg.role === 'candidate';

                return (
                  <div
                    key={msg.id || index}
                    className={`flex items-start gap-3 ${isCandidate ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm ${
                        isInterviewer
                          ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      {isInterviewer ? <Sparkles className="w-4 h-4" /> : 'You'}
                    </div>

                    <div className={`max-w-[85%] space-y-1.5 ${isCandidate ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-[11px] font-bold text-slate-300">
                          {isInterviewer ? 'AI Lead Interviewer' : 'Candidate Response'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div
                        className={`p-4 rounded-2xl text-sm leading-relaxed ${
                          isCandidate
                            ? 'bg-indigo-600 text-white rounded-tr-sm shadow-sm'
                            : 'bg-slate-800/90 text-slate-100 rounded-tl-sm border border-slate-700/60 shadow-sm'
                        }`}
                      >
                        <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                        {/* Attached Code Snippet */}
                        {msg.codeSnippet && (
                          <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-200">
                            <div className="flex items-center justify-between text-[11px] text-indigo-400 font-semibold mb-2 pb-1 border-b border-slate-800">
                              <span className="flex items-center gap-1.5">
                                <Code2 className="w-3.5 h-3.5" /> Attached {msg.codeSnippet.language.toUpperCase()} Solution
                              </span>
                            </div>
                            <pre className="overflow-x-auto whitespace-pre">{msg.codeSnippet.code}</pre>
                          </div>
                        )}
                      </div>

                      {/* Quick Follow-up Chips for Interviewer */}
                      {isInterviewer && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1 pl-1">
                          {msg.suggestedFollowUps.map((chip) => (
                            <button
                              key={chip}
                              type="button"
                              onClick={() => setInputText((prev) => (prev ? `${prev} ${chip}` : chip))}
                              className="text-[10px] font-medium px-2 py-1 rounded-lg bg-indigo-950/50 text-indigo-300 border border-indigo-900 hover:bg-indigo-900/50 transition-colors flex items-center gap-1"
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
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-800 text-slate-300 text-sm flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-100" />
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-200" />
                    </div>
                    <span className="text-xs font-semibold">AI Interviewer evaluating response...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Candidate Input Console */}
            <div className="p-3 bg-slate-950/90 border-t border-slate-800 space-y-2">
              <div className="relative">
                <textarea
                  rows={2}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your technical response, code approach, or architectural solution... (Ctrl+Enter to send)"
                  className="w-full pl-3.5 pr-24 py-2 rounded-xl border border-slate-700 bg-slate-900 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none shadow-inner"
                />

                <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`p-2 rounded-lg transition-all ${
                      isListening
                        ? 'bg-rose-500 text-white animate-pulse shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                    title={isListening ? 'Stop Listening' : 'Voice Input (Dictation)'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() || isSending}
                    className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    title="Send Response"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>
                  Press <kbd className="px-1 py-0.5 rounded bg-slate-800 font-mono text-[10px]">Ctrl+Enter</kbd> to submit
                </span>
                <span>{inputText.length} characters</span>
              </div>
            </div>
          </div>
        )}

        {/* Right / Center: Interactive Code Workspace (Rendered in Split or Code mode) */}
        {(viewMode === 'split' || viewMode === 'code') && (
          <div
            className={`${
              viewMode === 'code' ? 'lg:col-span-12' : viewMode === 'split' ? 'lg:col-span-6' : 'lg:col-span-4'
            } flex flex-col h-full min-h-0`}
          >
            <CodeEditor
              initialLanguage={
                session.type === 'sql'
                  ? SupportedLanguage.SQL
                  : SupportedLanguage.PYTHON
              }
              onAttachToResponse={(code, lang) => {
                setInputText(
                  (prev) =>
                    `${prev ? prev + '\n\n' : ''}Here is my ${lang.toUpperCase()} solution:\n\`\`\`${lang}\n${code}\n\`\`\``
                );
                showToast('Code attached to chat box', 'info');
              }}
              onSubmitForTurn={(code, lang) => {
                handleSendMessage(`Submitted ${lang.toUpperCase()} solution for review:`, { code, language: lang });
              }}
            />
          </div>
        )}

        {/* Intel & Guidance Drawer (Rendered in Chat mode on wide screens) */}
        {viewMode === 'chat' && (
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                <Info className="w-3.5 h-3.5" />
                Active Stage Intel
              </div>

              {currentStage && (
                <div>
                  <h3 className="text-base font-bold text-slate-100">{currentStage.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{currentStage.description}</p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-300">Phase Evaluation Rubric:</div>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                  <li>Clarity of functional & non-functional constraints</li>
                  <li>Algorithmic edge cases, Big-O time and space trade-offs</li>
                  <li>Structured communication and technical precision</li>
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-300">Session Focus Topics:</div>
                <div className="flex flex-wrap gap-1.5">
                  {session.focusTopics.map((topic) => (
                    <span
                      key={topic}
                      className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
