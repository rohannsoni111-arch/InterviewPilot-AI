import mongoose from 'mongoose';
import {
  IQuestionBankItem,
  IQuestionFilter,
  InterviewType,
  DifficultyLevel,
  StrictnessMode,
  InterviewStatus,
  IInterviewSession,
} from '@interviewpilot/shared';
import { Interview } from '../models/Interview';
import { AppError } from '../utils/errors';

export const CURATED_QUESTIONS: IQuestionBankItem[] = [
  {
    id: 'goog-001',
    title: 'Distributed Lock-Free Ring Buffer',
    company: 'Google',
    track: InterviewType.CODING,
    difficulty: DifficultyLevel.SENIOR,
    category: 'Concurrency & Low-Level Systems',
    acceptanceRate: 38,
    frequencyScore: 94,
    estimatedMinutes: 45,
    description:
      'Design and implement a thread-safe, bounded lock-free Ring Buffer (Circular Queue) in Python/TypeScript supporting single-producer multi-consumer operations with atomic sequence indexing without global mutex starvation.',
    examples: [
      {
        input: 'capacity = 4, enqueue(1), enqueue(2), dequeue()',
        output: '1',
        explanation: '1 was inserted first and returned by FIFO ordering while capacity remains bounded.',
      },
    ],
    constraints: [
      '1 <= capacity <= 10^5',
      'enqueue and dequeue operations must execute in O(1) amortized time.',
      'Memory consumption must be strictly O(capacity).',
    ],
    starterCode: {
      python: `class LockFreeRingBuffer:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n        self.buffer = [None] * capacity\n        self.head = 0\n        self.tail = 0\n\n    def enqueue(self, val: int) -> bool:\n        # TODO: Implement atomic lock-free enqueue\n        pass\n\n    def dequeue(self) -> int:\n        # TODO: Implement atomic lock-free dequeue\n        pass\n`,
      typescript: `export class LockFreeRingBuffer {\n  private buffer: (number | null)[];\n  private capacity: number;\n  private head: number = 0;\n  private tail: number = 0;\n\n  constructor(capacity: number) {\n    this.capacity = capacity;\n    this.buffer = new Array(capacity).fill(null);\n  }\n\n  enqueue(val: number): boolean {\n    // TODO: Implement enqueue\n    return false;\n  }\n\n  dequeue(): number | null {\n    // TODO: Implement dequeue\n    return null;\n  }\n}\n`,
    },
    hints: [
      'Use atomic sequence increments modulo capacity.',
      'Ensure head and tail indices account for wraparound when head == tail.',
    ],
    testCases: [
      { input: 'capacity=3, ops=[push(1), push(2), pop()]', expectedOutput: '1' },
      { input: 'capacity=2, ops=[push(5), push(6), push(7)]', expectedOutput: 'false' },
    ],
    tags: ['Concurrency', 'Data Structures', 'Lock-Free', 'Google'],
  },
  {
    id: 'meta-002',
    title: 'Design Global Live Stream Video Comment Feed',
    company: 'Meta',
    track: InterviewType.SYSTEM_DESIGN,
    difficulty: DifficultyLevel.STAFF,
    category: 'Distributed Systems & Fan-Out',
    acceptanceRate: 29,
    frequencyScore: 96,
    estimatedMinutes: 45,
    description:
      'Architect a distributed real-time comment and reaction streaming pipeline for Instagram/Facebook Live broadcasts with 5M concurrent viewers on a single celebrity broadcast (e.g. 50,000 comments/sec burst rate) while ensuring fair sampling, rate-limiting, and sub-100ms viewport render latency.',
    examples: [
      {
        input: '5M concurrent viewers, 50k comments/sec',
        output: 'Dynamic fan-out cluster with edge WebSockets and sliding reservoir sampling',
      },
    ],
    constraints: [
      'P99 delivery latency < 150ms globally across US, EU, APAC.',
      'Viewport display bounded to 20 comments/second per client.',
      'Zero single point of failure in broker mesh.',
    ],
    starterCode: {
      python: '# System Design Architecture Specification\n# Detail edge routing, message bus, rate limiters, and client polling/WebSocket layers.\n',
    },
    hints: [
      'Avoid global broadcasts to all 5M connections simultaneously—use client-side rate decimation and edge CDN fanout.',
      'Decouple comment ingestion from delivery clusters via partitioned Kafka topics.',
    ],
    testCases: [],
    tags: ['System Design', 'WebSockets', 'Kafka', 'Fan-out', 'Meta'],
  },
  {
    id: 'stripe-003',
    title: 'Idempotent Payment Webhook Dispatcher',
    company: 'Stripe',
    track: InterviewType.CODING,
    difficulty: DifficultyLevel.SENIOR,
    category: 'Distributed Systems & Reliability',
    acceptanceRate: 42,
    frequencyScore: 91,
    estimatedMinutes: 45,
    description:
      'Implement an idempotent asynchronous webhook event delivery queue with exponential backoff jitter, circuit breaker state tracking, and duplicate event deduplication using sliding hash keys.',
    examples: [
      {
        input: 'event_id = "evt_991823", attempts = 3, server_status = 503',
        output: 'retry scheduled with exponential backoff + jitter',
      },
    ],
    constraints: [
      'Deduplication lookup must be O(1).',
      'Backoff formula: min(max_delay, initial_delay * 2^attempt + jitter).',
    ],
    starterCode: {
      python: `def dispatch_webhook(event_id: str, payload: dict, max_retries: int = 5) -> dict:\n    # TODO: Implement idempotent delivery\n    pass\n`,
      typescript: `export function dispatchWebhook(eventId: string, payload: any, maxRetries = 5): any {\n  // TODO: Implement idempotent delivery\n}\n`,
    },
    hints: [
      'Store event idempotency keys with atomic TTL in distributed cache.',
      'Compute jitter using cryptographically secure pseudorandom numbers to prevent thundering herds.',
    ],
    testCases: [
      { input: 'evt_1, payload={amount: 5000}', expectedOutput: '{status: "delivered", attempts: 1}' },
    ],
    tags: ['FinTech', 'Idempotency', 'Webhooks', 'Reliability', 'Stripe'],
  },
  {
    id: 'amzn-004',
    title: 'Transactional Fulfillment Center Inventory Allocation',
    company: 'Amazon',
    track: InterviewType.SQL,
    difficulty: DifficultyLevel.SENIOR,
    category: 'SQL & Relational Transactions',
    acceptanceRate: 46,
    frequencyScore: 88,
    estimatedMinutes: 30,
    description:
      'Write an ACID-compliant analytical and transactional SQL query to allocate reserved stock across multi-tier regional fulfillment centers minimizing logistics travel distance while preventing over-allocation under concurrent checkout bursts.',
    examples: [
      {
        input: 'order_id = 9012, sku = "SKU-990", qty = 4',
        output: 'Allocated 4 units from Warehouse #12 (closest radius, in_stock >= 4)',
      },
    ],
    constraints: [
      'Query execution must resolve in < 25ms over 10M inventory rows.',
      'Must utilize window functions and ROW_NUMBER() partitioning.',
    ],
    starterCode: {
      sql: `-- Transactional Inventory Allocation Query\nSELECT \n  warehouse_id,\n  sku,\n  available_qty,\n  distance_km,\n  ROW_NUMBER() OVER (PARTITION BY sku ORDER BY distance_km ASC) as rank\nFROM warehouse_inventory\nWHERE sku = :target_sku AND available_qty >= :required_qty;\n`,
    },
    hints: [
      'Partition by sku and order by distance ascending.',
      'Use CTEs to filter candidate fulfillment centers before applying row locks.',
    ],
    testCases: [],
    tags: ['SQL', 'Transactions', 'Inventory', 'Amazon'],
  },
  {
    id: 'nflx-005',
    title: 'Adaptive Video Bitrate Chunk Scheduler',
    company: 'Netflix',
    track: InterviewType.CODING,
    difficulty: DifficultyLevel.SENIOR,
    category: 'Algorithms & Dynamic Programming',
    acceptanceRate: 35,
    frequencyScore: 92,
    estimatedMinutes: 45,
    description:
      'Design an adaptive bitrate streaming buffer algorithm that maximizes video quality while guaranteeing zero playback stall events given fluctuating network bandwidth profiles.',
    examples: [
      {
        input: 'bandwidths = [2500, 3100, 1800, 4500], buffer_health = 12s',
        output: 'chunk bitrates = [1080p, 1080p, 720p, 4k]',
      },
    ],
    constraints: [
      'Rebuffer probability must remain < 0.001%.',
      'Smooth quality transitions without rapid jarring switching.',
    ],
    starterCode: {
      python: `def schedule_chunks(bandwidth_samples: list[int], buffer_seconds: float) -> list[str]:\n    # TODO: Calculate optimal chunk bitrate sequence\n    pass\n`,
    },
    hints: [
      'Model buffer trajectory with a Markov decision process or dynamic programming window.',
    ],
    testCases: [],
    tags: ['Video Streaming', 'Algorithms', 'Optimization', 'Netflix'],
  },
  {
    id: 'anth-006',
    title: 'Real-Time LLM Token Stream Demultiplexer',
    company: 'Anthropic',
    track: InterviewType.CODING,
    difficulty: DifficultyLevel.STAFF,
    category: 'Streaming & Parser State Machines',
    acceptanceRate: 31,
    frequencyScore: 95,
    estimatedMinutes: 45,
    description:
      'Construct a streaming token parser that detects and isolates multi-modal tool use XML blocks (`<tool_call>...</tool_call>`) in an incoming chunked Server-Sent Events (SSE) token stream without buffering the entire document in memory.',
    examples: [
      {
        input: 'tokens = ["I will", " fetch data: ", "<tool_", "call>{\\"id\\":", " 1}</tool_", "call>", " Done!"]',
        output: 'tool_call event emitted on chunk boundary with zero unparsed leakage',
      },
    ],
    constraints: [
      'Chunk processing must be strictly O(chunk_size) with O(tag_length) state memory.',
      'Handles partial split tag boundaries across arbitrary packet splits.',
    ],
    starterCode: {
      python: `class TokenStreamDemuxer:\n    def __init__(self):\n        self.buffer = ""\n        self.in_tool = False\n\n    def feed_token(self, token: str) -> list[dict]:\n        # TODO: Process streaming token chunk\n        return []\n`,
    },
    hints: [
      'Maintain an active DFA state machine tracking partial prefix matches of the opening and closing delimiters.',
    ],
    testCases: [],
    tags: ['AI Engineering', 'Streaming', 'Parsers', 'Anthropic'],
  },
];

export class QuestionBankService {
  /**
   * Returns filtered list of question bank items
   */
  static async getQuestions(filter: IQuestionFilter = {}): Promise<IQuestionBankItem[]> {
    let result = [...CURATED_QUESTIONS];

    if (filter.company && filter.company !== 'All') {
      result = result.filter(
        (q) => q.company.toLowerCase() === filter.company?.toLowerCase()
      );
    }

    if (filter.track && filter.track !== ('all' as any)) {
      result = result.filter((q) => q.track === filter.track);
    }

    if (filter.difficulty && filter.difficulty !== ('all' as any)) {
      result = result.filter((q) => q.difficulty === filter.difficulty);
    }

    if (filter.search && filter.search.trim()) {
      const qLower = filter.search.toLowerCase().trim();
      result = result.filter(
        (q) =>
          q.title.toLowerCase().includes(qLower) ||
          q.description.toLowerCase().includes(qLower) ||
          q.category.toLowerCase().includes(qLower) ||
          q.tags.some((t) => t.toLowerCase().includes(qLower))
      );
    }

    return result;
  }

  /**
   * Returns a single question by ID
   */
  static async getQuestionById(id: string): Promise<IQuestionBankItem> {
    const question = CURATED_QUESTIONS.find((q) => q.id === id);
    if (!question) {
      throw new AppError('Question not found', 404, 'NOT_FOUND');
    }
    return question;
  }

  /**
   * 1-Click Launch: Creates a live InterviewSession pre-configured with this question
   */
  static async launchInterviewWithQuestion(
    questionId: string,
    candidateId: string
  ): Promise<IInterviewSession> {
    const question = await this.getQuestionById(questionId);

    const stages = [
      {
        id: '1',
        title: 'Problem Exploration & Constraint Clarification',
        durationMinutes: 10,
        order: 1,
        status: 'active' as const,
        description: `Explore ${question.title} and clarify edge cases.`,
      },
      {
        id: '2',
        title: 'Architecture & Algorithmic Strategy',
        durationMinutes: 15,
        order: 2,
        status: 'pending' as const,
        description: `Formulate solution for ${question.company} standard criteria.`,
      },
      {
        id: '3',
        title: 'Implementation & Live Test Execution',
        durationMinutes: 15,
        order: 3,
        status: 'pending' as const,
        description: `Implement solution with verified test case passing.`,
      },
      {
        id: '4',
        title: 'Complexity Analysis & Trade-Off Defense',
        durationMinutes: 5,
        order: 4,
        status: 'pending' as const,
        description: `Evaluate Big-O trade-offs and memory profile.`,
      },
    ];

    const initialMessage = {
      id: `msg-${Date.now()}`,
      role: 'interviewer' as const,
      content: `Hello! Welcome to your ${question.company} technical interview simulation. Today we will focus on **${question.title}** (${question.category}).\n\n**Problem Statement:**\n${question.description}\n\nTo begin, please review the requirements, state any assumptions, and outline how you plan to approach the solution.`,
      timestamp: new Date(),
      suggestedFollowUps: [
        'What are the core edge cases and constraints?',
        'What is your target time and space complexity?',
        'Can we walk through a sample input trace?',
      ],
    };

    const sessionDoc = await Interview.create({
      userId: new mongoose.Types.ObjectId(candidateId),
      title: `${question.company} - ${question.title}`,
      type: question.track,
      difficulty: question.difficulty,
      targetRole: `${question.company} Software Engineer`,
      durationMinutes: question.estimatedMinutes || 45,
      strictness: StrictnessMode.REALISTIC,
      focusTopics: question.tags,
      status: InterviewStatus.IN_PROGRESS,
      currentStageIndex: 0,
      stages,
      messages: [initialMessage],
      startedAt: new Date(),
    });

    const obj = sessionDoc.toObject();
    return {
      ...obj,
      id: obj._id.toString(),
      userId: obj.userId.toString(),
    } as unknown as IInterviewSession;
  }
}
