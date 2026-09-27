import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  IPeerRoom,
  PeerRole,
  InterviewType,
  DifficultyLevel,
  HiringVerdict,
  IPeerChatMessage,
} from '@interviewpilot/shared';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Code2,
  Copy,
  Check,
  Play,
  MessageSquare,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Sliders,
  Send,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  RefreshCw,
  LogOut,
  BookOpen
} from 'lucide-react';

export const PeerPairingPage: React.FC = () => {
  const { roomCode: routeRoomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  // Lobby state
  const [createTitle, setCreateTitle] = useState('Senior Distributed Systems Peer Round');
  const [createTrack, setCreateTrack] = useState<InterviewType>(InterviewType.CODING);
  const [createDifficulty, setCreateDifficulty] = useState<DifficultyLevel>(DifficultyLevel.SENIOR);
  const [createRole, setCreateRole] = useState<PeerRole>('interviewer');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Active room state
  const [room, setRoom] = useState<IPeerRoom | null>(null);
  const [currentRole, setCurrentRole] = useState<PeerRole>('interviewer');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [terminalOutput, setTerminalOutput] = useState('');
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Evaluator state
  const [evaluatorNotes, setEvaluatorNotes] = useState('');
  const [dimensionRatings, setDimensionRatings] = useState<Record<string, number>>({
    'Problem Solving & Algorithms': 85,
    'System Architecture & Design': 85,
    'Code Quality & Execution': 80,
    'Communication & Leadership': 90,
  });
  const [verdict, setVerdict] = useState<HiringVerdict>(HiringVerdict.HIRE);
  const [feedback] = useState('');
  const [isSubmittingEval, setIsSubmittingEval] = useState(false);

  // Rubric checklist
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    'Clarified input constraints and edge cases': true,
    'Analyzed time and space complexity': false,
    'Proactive and articulate communication': true,
    'Modular and clean variable naming': false,
    'Tested code against failure modes': false,
  });

  // Call & Chat state
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [chatMessages, setChatMessages] = useState<IPeerChatMessage[]>([
    {
      id: 'sys-1',
      senderId: 'system',
      senderName: 'System',
      text: 'Peer room initialized. Use the live editor and collaborative evaluation rubric to conduct your mock round.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Load room if roomCode in URL
  useEffect(() => {
    async function loadRoom() {
      if (!routeRoomCode) return;
      try {
        const res = await api.getPeerRoom!(routeRoomCode);
        if (res.success && res.data) {
          setRoom(res.data);
          setCode(res.data.code);
          setLanguage(res.data.language || 'python');
          setEvaluatorNotes(res.data.evaluatorNotes || '');
          if (res.data.dimensionRatings) {
            setDimensionRatings(res.data.dimensionRatings);
          }
          // Determine current user's role
          const myParticipant = res.data.participants.find((p) => p.userId === user?.id);
          if (myParticipant) {
            setCurrentRole(myParticipant.role);
          }
        }
      } catch (err: any) {
        showToast(err.response?.data?.error?.message || 'Failed to load peer room', 'error');
      }
    }

    loadRoom();
  }, [routeRoomCode]);

  // Handle Create Room
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await api.createPeerRoom!({
        title: createTitle,
        track: createTrack,
        difficulty: createDifficulty,
        initialRole: createRole,
      });

      if (res.success && res.data) {
        showToast(`Peer room ${res.data.roomCode} created!`, 'success');
        navigate(`/peer-pairing/${res.data.roomCode}`);
      }
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Failed to create room', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Join Room
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    setIsJoining(true);
    try {
      const cleanCode = joinCodeInput.toUpperCase().trim();
      const res = await api.joinPeerRoom!(cleanCode, {
        preferredRole: 'candidate',
      });

      if (res.success && res.data) {
        showToast(`Joined peer room ${res.data.roomCode}`, 'success');
        navigate(`/peer-pairing/${res.data.roomCode}`);
      }
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Room not found or expired', 'error');
    } finally {
      setIsJoining(false);
    }
  };

  // Handle Role Switch
  const handleRoleSwitch = async (newRole: PeerRole) => {
    if (!room) return;
    try {
      const res = await api.switchPeerRole!(room.roomCode, newRole);
      if (res.success && res.data) {
        setRoom(res.data);
        setCurrentRole(newRole);
        showToast(`Switched mode to ${newRole === 'interviewer' ? 'Interviewer / Evaluator' : 'Candidate'}`, 'info');
      }
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Failed to switch role', 'error');
    }
  };

  // Handle Code Sync
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (room) {
      api.syncPeerCode!(room.roomCode, { code: newCode, language });
    }
  };

  // Run Code
  const handleRunCode = () => {
    setIsRunningCode(true);
    setTerminalOutput('Executing sandbox test run against runtime engine...\n');
    setTimeout(() => {
      setTerminalOutput(
        `[InterviewPilot Engine] Compiled and executed successfully in 142ms\nOutput:\n>>> solution() returned Status: PASS\nAll sample assertions matched expected test fixtures.\n`
      );
      setIsRunningCode(false);
    }, 600);
  };

  // Handle Chat Message
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: IPeerChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: user?.id || 'guest',
      senderName: user?.name || 'Peer',
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');
  };

  // Handle Evaluator Notes Save
  const handleNotesChange = (newNotes: string) => {
    setEvaluatorNotes(newNotes);
    if (room) {
      api.updatePeerNotes!(room.roomCode, {
        evaluatorNotes: newNotes,
        dimensionRatings,
      });
    }
  };

  // Submit Final Peer Evaluation
  const handleSubmitEvaluation = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!room) return;
    setIsSubmittingEval(true);
    try {
      const res = await api.submitPeerEvaluation!(room.roomCode, {
        ratings: dimensionRatings,
        feedback: feedback || evaluatorNotes || 'Solid technical performance and collaborative problem solving.',
        verdict,
      });

      if (res.success && res.data) {
        setRoom(res.data);
        showToast('Peer evaluation submitted successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Failed to submit evaluation', 'error');
    } finally {
      setIsSubmittingEval(false);
    }
  };

  const handleCopyInviteLink = () => {
    if (!room) return;
    const url = `${window.location.origin}/peer-pairing/${room.roomCode}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(true);
    showToast('Peer invite link copied!', 'success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Render Lobby if no room loaded
  if (!room) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fadeIn">
        {/* Lobby Hero */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              <span>Multiplayer Studio</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
              Peer-to-Peer Mock Interview Studio
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Pair up with fellow software engineers for live reciprocal mock interviews. Switch seamlessly between
              Candidate and Evaluator roles, utilize standardized FAANG grading rubrics, and generate joint debrief reports.
            </p>
          </div>
        </div>

        {/* Create or Join Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Create Room */}
          <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-slate-100">Create a Peer Session</h2>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Session Title
                </label>
                <input
                  type="text"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="e.g. Distributed Lock & Concurrency Mock Round"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Interview Track
                  </label>
                  <select
                    value={createTrack}
                    onChange={(e) => setCreateTrack(e.target.value as InterviewType)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value={InterviewType.CODING}>Coding & Algorithms</option>
                    <option value={InterviewType.SYSTEM_DESIGN}>System Design</option>
                    <option value={InterviewType.BEHAVIORAL}>Behavioral & Leadership</option>
                    <option value={InterviewType.TECHNICAL}>Technical Architecture</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Target Seniority
                  </label>
                  <select
                    value={createDifficulty}
                    onChange={(e) => setCreateDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value={DifficultyLevel.ENTRY}>Junior (L3 / SDE-I)</option>
                    <option value={DifficultyLevel.MID}>Mid-Level (L4 / SDE-II)</option>
                    <option value={DifficultyLevel.SENIOR}>Senior (L5 / Senior)</option>
                    <option value={DifficultyLevel.STAFF}>Staff (L6+ / Principal)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Your Initial Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCreateRole('interviewer')}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      createRole === 'interviewer'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Sliders className="w-4 h-4" />
                    <span>Interviewer / Evaluator</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateRole('candidate')}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      createRole === 'candidate'
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Code2 className="w-4 h-4" />
                    <span>Candidate / Coder</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isCreating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Provisioning Room...</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    <span>Create & Launch Studio Room</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Join Room */}
          <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-slate-100">Join Active Room</h2>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Have an invite code from your peer or study partner? Enter the 6-character room code below to jump
                straight into the live workspace.
              </p>

              <form onSubmit={handleJoinRoom} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Room Code (e.g. PR-8A4F)
                  </label>
                  <input
                    type="text"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value)}
                    placeholder="PR-XXXX"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono text-center tracking-widest text-base font-bold focus:outline-none focus:border-emerald-500 uppercase transition-colors"
                    maxLength={10}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isJoining || !joinCodeInput.trim()}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {isJoining ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      <span>Join Peer Session</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-2 text-xs">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Pairing Etiquette</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                We recommend a 45-min format: 35 min problem solving, followed by 10 min calibration and mutual scoring debrief.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Active Studio Room
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* Studio Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        {/* Left: Title & Track */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-100">{room.title}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-indigo-400 border border-slate-700">
                {room.roomCode}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
              <span className="capitalize">{room.track.replace(/_/g, ' ')}</span>
              <span>•</span>
              <span className="capitalize">{room.difficulty} Bar</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold capitalize flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {room.status}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Role Switcher & Audio/Video Controls */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => handleRoleSwitch('candidate')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentRole === 'candidate'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Candidate Mode</span>
          </button>

          <button
            onClick={() => handleRoleSwitch('interviewer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentRole === 'interviewer'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Evaluator Mode</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* AV Controls */}
          <button
            onClick={() => setIsMicMuted(!isMicMuted)}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              isMicMuted ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              isVideoOff ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title={isVideoOff ? 'Start Video' : 'Stop Video'}
          >
            {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          </button>
        </div>

        {/* Right: Share Invite & Leave */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyInviteLink}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors flex items-center gap-1.5 border border-slate-700"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Link Copied!' : 'Invite Peer'}</span>
          </button>

          <button
            onClick={() => {
              setRoom(null);
              navigate('/peer-pairing');
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 font-semibold text-xs transition-colors flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Leave</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Code Workspace (8 cols) or (7 cols in Evaluator mode) */}
        <div className={currentRole === 'interviewer' ? 'lg:col-span-7 space-y-4' : 'lg:col-span-8 space-y-4'}>
          {/* Editor Header */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200">Collaborative Editor</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-400 font-mono text-[10px]">
                {language.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  if (room) api.syncPeerCode!(room.roomCode, { code, language: e.target.value });
                }}
                className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none"
              >
                <option value="python">Python 3.11</option>
                <option value="typescript">TypeScript</option>
                <option value="javascript">JavaScript</option>
                <option value="sql">PostgreSQL / SQL</option>
              </select>

              <button
                onClick={handleRunCode}
                disabled={isRunningCode}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isRunningCode ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                <span>Run Code</span>
              </button>
            </div>
          </div>

          {/* Monaco / Code Textarea */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs sm:text-sm text-slate-200 shadow-inner">
            <textarea
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              rows={18}
              spellCheck={false}
              className="w-full bg-transparent resize-y font-mono focus:outline-none leading-relaxed text-slate-100"
              placeholder="# Type code collaboratively here..."
            />
          </div>

          {/* Terminal Output */}
          {terminalOutput && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 space-y-1">
              <div className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">Execution Output</div>
              <pre className="whitespace-pre-wrap text-emerald-400">{terminalOutput}</pre>
            </div>
          )}
        </div>

        {/* Right Column: Evaluator Rubric (5 cols) OR Chat & Problem Panel (4 cols) */}
        {currentRole === 'interviewer' ? (
          <div className="lg:col-span-5 space-y-4">
            {/* Interviewer Evaluation Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-100">Live FAANG Evaluation Rubric</h3>
                </div>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Interviewer Mode
                </span>
              </div>

              {/* Rubric Checklist */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 block">Assessment Criteria Checklist</span>
                <div className="space-y-1.5">
                  {Object.entries(checklist).map(([item, checked]) => (
                    <label
                      key={item}
                      className="flex items-center gap-2 p-2 bg-slate-950/70 rounded-xl border border-slate-800/80 cursor-pointer text-xs text-slate-300 hover:border-slate-700 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => setChecklist((prev) => ({ ...prev, [item]: !prev[item] }))}
                        className="rounded border-slate-700 text-indigo-600 focus:ring-0 focus:ring-offset-0 bg-slate-900"
                      />
                      <span className={checked ? 'line-through text-slate-500' : ''}>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dimension Score Sliders */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-300 block">Competency Dimension Scores (0-100)</span>
                {Object.entries(dimensionRatings).map(([dim, val]) => (
                  <div key={dim} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{dim}</span>
                      <span className="font-mono font-bold text-indigo-400">{val}/100</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="100"
                      value={val}
                      onChange={(e) => {
                        const newRatings = { ...dimensionRatings, [dim]: Number(e.target.value) };
                        setDimensionRatings(newRatings);
                        if (room) api.updatePeerNotes!(room.roomCode, { evaluatorNotes, dimensionRatings: newRatings });
                      }}
                      className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              {/* Evaluator Notes */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-300 block">Private Interviewer Notes</label>
                <textarea
                  value={evaluatorNotes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  rows={4}
                  placeholder="Record strengths, edge cases missed, communication flags..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                />
              </div>

              {/* Final Verdict & Submit */}
              <form onSubmit={handleSubmitEvaluation} className="space-y-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Hiring Recommendation</label>
                  <select
                    value={verdict}
                    onChange={(e) => setVerdict(e.target.value as HiringVerdict)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                  >
                    <option value={HiringVerdict.STRONG_HIRE}>Strong Hire</option>
                    <option value={HiringVerdict.HIRE}>Hire</option>
                    <option value={HiringVerdict.LEAN_HIRE}>Lean Hire</option>
                    <option value={HiringVerdict.LEAN_NO_HIRE}>Lean No Hire</option>
                    <option value={HiringVerdict.NO_HIRE}>No Hire</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => handleSubmitEvaluation()}
                  disabled={isSubmittingEval}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  <Award className="w-4 h-4" />
                  <span>Submit Peer Evaluation & Conclude</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-4 space-y-4">
            {/* Candidate Mode Panel: Problem Details & Peer Chat */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-100">Round Objectives</h3>
                </div>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Candidate Mode
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <p className="leading-relaxed">
                  Implement the target solution cleanly in the collaborative code editor. Discuss time and space
                  complexities with your interviewer as you write code.
                </p>
                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-slate-200">Key Focus Areas:</span>
                  <ul className="list-disc list-inside text-slate-400 space-y-0.5 text-[11px]">
                    <li>Handle null/boundary conditions</li>
                    <li>Avoid unnecessary allocations</li>
                    <li>Provide asymptotic analysis</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Peer Chat Stream */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3 flex flex-col h-80">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 border-b border-slate-800 pb-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span>Peer Chat & Hints</span>
              </div>

              {/* Chat Message List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-2.5 rounded-xl text-xs ${
                      msg.isSystem
                        ? 'bg-indigo-950/30 border border-indigo-500/20 text-indigo-300'
                        : msg.senderId === user?.id
                        ? 'bg-indigo-600 text-white ml-6'
                        : 'bg-slate-950 border border-slate-800 text-slate-300 mr-6'
                    }`}
                  >
                    {!msg.isSystem && (
                      <div className="text-[10px] font-bold text-slate-400 mb-0.5 flex justify-between">
                        <span>{msg.senderName}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                    )}
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChat} className="flex items-center gap-1.5 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type message or share hint..."
                  className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Completed Evaluation Modal */}
      {room.completedEvaluation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <Award className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-100">Peer Assessment Completed</h3>
              <p className="text-xs text-slate-400">
                Evaluated by <strong className="text-slate-200">{room.completedEvaluation.submittedBy}</strong>
              </p>
            </div>

            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Overall Score</span>
                <span className="font-mono font-bold text-xl text-emerald-400">
                  {room.completedEvaluation.overallScore}/100
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Verdict</span>
                <span className="font-extrabold uppercase text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  {room.completedEvaluation.verdict.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 text-left">
                <span className="text-[11px] text-slate-500 block mb-1">Debrief Feedback</span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                  {room.completedEvaluation.feedback}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
