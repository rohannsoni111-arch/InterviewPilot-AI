import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  InterviewType,
  DifficultyLevel,
  StrictnessMode,
  CreateInterviewDto,
  IInterviewSession
} from '@interviewpilot/shared';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import {
  Code,
  Layers,
  FileCheck,
  Cpu,
  Database,
  Users,
  Shuffle,
  Clock,
  Sparkles,
  Plus,
  X,
  AlertCircle,
  Play
} from 'lucide-react';


const TOPIC_PRESETS: Record<InterviewType, string[]> = {
  [InterviewType.CODING]: [
    'Dynamic Programming',
    'Graph Algorithms (BFS/DFS)',
    'Binary Search Trees',
    'Heap & Priority Queue',
    'Two Pointers & Sliding Window',
    'Trie & Prefix Trees',
    'Backtracking',
    'Bit Manipulation'
  ],
  [InterviewType.SYSTEM_DESIGN]: [
    'Distributed Caching (Redis/Memcached)',
    'Event Sourcing & Kafka Pipelines',
    'Sharding & Partitioning Strategies',
    'Microservices & API Gateway',
    'Consensus (Raft/Paxos)',
    'Rate Limiting & Token Bucket',
    'High Availability & Disaster Recovery',
    'Database Indexing (B-Tree/LSM)'
  ],
  [InterviewType.TECHNICAL]: [
    'Concurrency & Memory Models',
    'REST & gRPC Protocols',
    'Database Transactions & Isolation Levels',
    'Garbage Collection & Memory Leaks',
    'Async I/O & Event Loops',
    'Security (OAuth2, JWT, CSRF)',
    'Docker & Containerization',
    'CI/CD & Observability'
  ],
  [InterviewType.BEHAVIORAL]: [
    'Engineering Disagreements & Compromise',
    'Managing Tight Deadlines & Scope Creep',
    'Leadership & Mentorship',
    'Recovering From Production Outages',
    'Cross-functional Stakeholder Management',
    'Navigating Ambiguity'
  ],
  [InterviewType.RESUME_DEFENSE]: [
    'Key Architecture Decisions',
    'Trade-offs & Scalability Bottlenecks',
    'Measurable Business Impact',
    'Tech Stack Selection Rationale',
    'Technical Debt Management',
    'Production Outage Post-mortems'
  ],
  [InterviewType.SQL]: [
    'Complex JOINs & CTEs',
    'Window Functions & Ranking',
    'Query Optimization & Execution Plans',
    'Schema Normalization vs Denormalization',
    'Indexes (Composite, Clustered, Partial)',
    'ACID Properties & Concurrency Anomalies'
  ],
  [InterviewType.MIXED]: [
    'Core Algorithms & Data Structures',
    'System Architecture Fundamentals',
    'STAR Behavioral Questions',
    'Code Quality & Engineering Best Practices'
  ]
};

const TYPE_CONFIG = [
  {
    type: InterviewType.CODING,
    title: 'Data Structures & Algorithms',
    icon: Code,
    desc: 'Live problem solving, algorithmic complexity, optimization, and edge-case testing.'
  },
  {
    type: InterviewType.SYSTEM_DESIGN,
    title: 'System Design & Architecture',
    icon: Layers,
    desc: 'Scalable distributed systems, microservices, database tradeoffs, caching, and resiliency.'
  },
  {
    type: InterviewType.TECHNICAL,
    title: 'Technical Deep-Dive',
    icon: Cpu,
    desc: 'In-depth conceptual grilling on framework internals, concurrency, OS, and networking.'
  },
  {
    type: InterviewType.SQL,
    title: 'SQL & Data Engineering',
    icon: Database,
    desc: 'Relational query design, performance profiling, window functions, and schema modeling.'
  },
  {
    type: InterviewType.BEHAVIORAL,
    title: 'Behavioral & Leadership (STAR)',
    icon: Users,
    desc: 'Conflict resolution, ownership, engineering ethics, leadership, and cross-team execution.'
  },
  {
    type: InterviewType.RESUME_DEFENSE,
    title: 'Resume Defense',
    icon: FileCheck,
    desc: 'Rigorous line-by-line examination of claimed achievements, metrics, and architecture.'
  },
  {
    type: InterviewType.MIXED,
    title: 'Full-Loop Mixed Assessment',
    icon: Shuffle,
    desc: 'Multi-faceted interview covering algorithms, system reasoning, and behavioral alignment.'
  }
];

const STRICTNESS_CONFIG = [
  {
    mode: StrictnessMode.FRIENDLY,
    label: 'Friendly Coach',
    desc: 'Supportive guidance with hints when you stumble. Great for building baseline confidence.',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
  },
  {
    mode: StrictnessMode.REALISTIC,
    label: 'Realistic Standard',
    desc: 'Balanced industry-standard interviewer. Probes your logic without being adversarial.',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
  },
  {
    mode: StrictnessMode.HARD,
    label: 'Hard Challenge',
    desc: 'Demanding bar. Asks tough edge cases, questions unoptimized approaches, and inspects details.',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
  },
  {
    mode: StrictnessMode.RUTHLESS_FAANG,
    label: 'Ruthless FAANG',
    desc: 'Zero tolerance for hand-waving or ambiguity. Rapid-fire counter-questions and extreme depth.',
    badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
  }
];

export const InterviewSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const initialTopic = searchParams.get('topic');
  const initialType = (searchParams.get('type') as InterviewType) || InterviewType.CODING;

  const [selectedType, setSelectedType] = useState<InterviewType>(initialType);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.SENIOR);
  const [targetRole, setTargetRole] = useState('Senior Backend Engineer');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [strictness, setStrictness] = useState<StrictnessMode>(StrictnessMode.REALISTIC);
  const [customTitle, setCustomTitle] = useState('');
  const [focusTopics, setFocusTopics] = useState<string[]>(
    initialTopic ? [initialTopic] : TOPIC_PRESETS[initialType].slice(0, 3)
  );
  const [customTopicInput, setCustomTopicInput] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);


  // Handle Type Change & topic preset refresh
  const handleTypeChange = (type: InterviewType) => {
    setSelectedType(type);
    setFocusTopics(TOPIC_PRESETS[type].slice(0, 3));
  };

  const handleAddCustomTopic = () => {
    const trimmed = customTopicInput.trim();
    if (!trimmed) return;
    if (focusTopics.includes(trimmed)) {
      showToast('This topic is already added', 'info');
      setCustomTopicInput('');
      return;
    }
    if (focusTopics.length >= 10) {
      showToast('You can add at most 10 focus topics', 'warning');
      return;
    }
    setFocusTopics(prev => [...prev, trimmed]);
    setCustomTopicInput('');
  };

  const handleTogglePresetTopic = (topic: string) => {
    if (focusTopics.includes(topic)) {
      if (focusTopics.length === 1) {
        showToast('You need at least 1 focus topic', 'warning');
        return;
      }
      setFocusTopics(prev => prev.filter(t => t !== topic));
    } else {
      if (focusTopics.length >= 10) {
        showToast('You can add at most 10 focus topics', 'warning');
        return;
      }
      setFocusTopics(prev => [...prev, topic]);
    }
  };

  const handleRemoveTopic = (topic: string) => {
    if (focusTopics.length === 1) {
      showToast('You need at least 1 focus topic', 'warning');
      return;
    }
    setFocusTopics(prev => prev.filter(t => t !== topic));
  };


  // Real-time stage plan computation
  const stagePlan = useMemo(() => {
    const total = durationMinutes;
    const intro = 5;
    const wrap = 5;
    const core = Math.max(5, total - intro - wrap);
    const splitA = Math.floor(core / 2);
    const splitB = core - splitA;

    return [
      { step: 1, title: 'Session Warm-up & Context Scoping', duration: `${intro} min`, desc: 'Align on requirements, background, and constraints.' },
      { step: 2, title: 'Primary Problem Solving & Architecture', duration: `${splitA} min`, desc: 'Deep dive into algorithmic logic or system foundations.' },
      { step: 3, title: 'Implementation, Trade-offs & Follow-ups', duration: `${splitB} min`, desc: 'Live execution, edge case testing, and stress testing.' },
      { step: 4, title: 'Candidate Reflection & Debrief', duration: `${wrap} min`, desc: 'Evaluation synthesis and closing performance summary.' },
    ];
  }, [durationMinutes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!targetRole.trim()) {
      setValidationError('Target role cannot be empty.');
      return;
    }

    if (focusTopics.length === 0) {
      setValidationError('Please select or add at least one focus topic.');
      return;
    }

    setIsSubmitting(true);

    const payload: CreateInterviewDto = {
      title: customTitle.trim() || undefined,
      type: selectedType,
      difficulty,
      targetRole: targetRole.trim(),
      durationMinutes,
      focusTopics,
      strictness,
      jobDescription: jobDescription.trim() || undefined,
      customInstructions: customInstructions.trim() || undefined
    };

    try {
      const response = await api.post('/interviews', payload);
      const session: IInterviewSession = response.data.data;
      showToast(`Session "${session.title}" initialized. Entering Live Room!`, 'success');

      // Navigate to live interview room
      navigate(`/interviews/${session.id}/room`);
    } catch (err: unknown) {

      const error = err as any;
      const message = error.response?.data?.error?.message || error.message || 'Could not configure interview session';
      setValidationError(message);
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }


  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          Simulation Engine
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
          Configure AI Interview Session
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Design a hyper-realistic, adaptive technical interview tailored to your exact target role, seniority level, and focus topics.
        </p>
      </div>

      {validationError && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-3 text-sm text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Configuration Issue</div>
            <div>{validationError}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Controls (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Track Selection */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center justify-center">1</span>
                  Select Interview Track
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Choose the primary domain to calibrate the AI interviewer's evaluation criteria.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {TYPE_CONFIG.map(cfg => {
                const Icon = cfg.icon;
                const isSelected = selectedType === cfg.type;
                return (
                  <button
                    key={cfg.type}
                    type="button"
                    onClick={() => handleTypeChange(cfg.type)}
                    className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 ring-1 ring-brand-500/50 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-brand-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-100 dark:bg-brand-950 px-2 py-0.5 rounded-full border border-brand-200 dark:border-brand-800">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{cfg.title}</div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{cfg.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role & Seniority Level */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center justify-center">2</span>
              Target Role & Seniority Bar
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Target Job Title / Role
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Distributed Systems Engineer"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[11px] text-slate-400 self-center mr-1">Suggestions:</span>
                  {[
                    'Senior Backend Engineer',
                    'Staff Fullstack Engineer',
                    'Frontend Architect',
                    'Site Reliability Engineer',
                    'ML Platform Engineer'
                  ].map(suggested => (
                    <button
                      key={suggested}
                      type="button"
                      onClick={() => setTargetRole(suggested)}
                      className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      {suggested}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Seniority Level
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { level: DifficultyLevel.ENTRY, label: 'Entry' },
                    { level: DifficultyLevel.MID, label: 'Mid' },
                    { level: DifficultyLevel.SENIOR, label: 'Senior' },
                    { level: DifficultyLevel.STAFF, label: 'Staff' },
                    { level: DifficultyLevel.PRINCIPAL, label: 'Principal' }
                  ].map(item => {
                    const isSelected = difficulty === item.level;
                    return (
                      <button
                        key={item.level}
                        type="button"
                        onClick={() => setDifficulty(item.level)}
                        className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all text-center ${
                          isSelected
                            ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Duration & Strictness */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center justify-center">3</span>
              Duration & Interviewer Persona Strictness
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Target Duration
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { mins: 15, tag: 'Sprint Drill', sub: 'Quick fundamentals' },
                    { mins: 30, tag: 'Standard', sub: 'Balanced deep dive' },
                    { mins: 45, tag: 'In-Depth', sub: 'Architectural depth' },
                    { mins: 60, tag: 'Full Loop', sub: 'Rigorous simulation' }
                  ].map(item => {
                    const isSelected = durationMinutes === item.mins;
                    return (
                      <button
                        key={item.mins}
                        type="button"
                        onClick={() => setDurationMinutes(item.mins)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 ring-1 ring-brand-500/50'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-slate-100">
                          <Clock className="w-3.5 h-3.5 text-brand-500" />
                          {item.mins} Minutes
                        </div>
                        <div className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 mt-0.5">{item.tag}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{item.sub}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Strictness Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {STRICTNESS_CONFIG.map(cfg => {
                    const isSelected = strictness === cfg.mode;
                    return (
                      <button
                        key={cfg.mode}
                        type="button"
                        onClick={() => setStrictness(cfg.mode)}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 ring-1 ring-brand-500/50'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{cfg.label}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badgeColor}`}>
                            {cfg.mode}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{cfg.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Focus Topics */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center justify-center">4</span>
              Focus Topics & Specific Evaluation Scope
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select key topic tags to direct the AI's inquiry and score dimension modeling.
            </p>

            {/* Active Selected Topics */}
            <div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Active Topics ({focusTopics.length}/10):
              </div>
              <div className="flex flex-wrap gap-2">
                {focusTopics.map(topic => (
                  <span
                    key={topic}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20"
                  >
                    {topic}
                    <button
                      type="button"
                      onClick={() => handleRemoveTopic(topic)}
                      className="text-brand-500 hover:text-brand-700 dark:hover:text-brand-200 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Suggested Preset Topics for Type */}
            <div className="pt-2">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Suggested Topics for {selectedType.replace('_', ' ').toUpperCase()}:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TOPIC_PRESETS[selectedType].map(topic => {
                  const isChecked = focusTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => handleTogglePresetTopic(topic)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                        isChecked
                          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent font-medium'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add Custom Topic Input */}
            <div className="pt-2 flex gap-2">
              <input
                type="text"
                value={customTopicInput}
                onChange={e => setCustomTopicInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTopic();
                  }
                }}
                placeholder="Add custom topic (e.g. Raft Consensus, gRPC, React Server Components)..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={handleAddCustomTopic}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>

          {/* Optional JD & Instructions */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center justify-center">5</span>
              Custom Job Description & Target Context (Optional)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Paste an actual job posting or specify custom instructions to tailor the questions to a specific hiring company.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Job Description Text
                </label>
                <textarea
                  rows={4}
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  placeholder="Paste the company's job description or requirements here..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Custom AI Interviewer Directives
                </label>
                <input
                  type="text"
                  value={customInstructions}
                  onChange={e => setCustomInstructions(e.target.value)}
                  placeholder="e.g. Grill me hard on Go channel deadlocks and memory allocation."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Custom Session Title (Optional)
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  placeholder="Leave empty for auto-generated title"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Plan & Launch Card (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-20 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-lg space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Adaptive Session Blueprint
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                {customTitle.trim() || `${difficulty.toUpperCase()} ${targetRole}`}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {selectedType.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900">
                  {durationMinutes} MIN
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                  {strictness.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Real-time Stages Timeline */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Stage Breakdown (Auto-Calculated)
              </div>
              <div className="space-y-2.5">
                {stagePlan.map(st => (
                  <div key={st.step} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {st.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{st.title}</span>
                        <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 flex-shrink-0">{st.duration}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{st.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Launch Action */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Initialize AI Session
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                By initializing, the adaptive session engine will generate calibrated prompts and dynamic scoring matrices.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
