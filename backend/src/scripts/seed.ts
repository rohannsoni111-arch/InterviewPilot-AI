import mongoose from 'mongoose';
import { env } from '../config/env';
import { User } from '../models/User';
import { Interview } from '../models/Interview';
import { Resume } from '../models/Resume';
import { hashPassword } from '../utils/password';
import {
  UserRole,
  InterviewType,
  DifficultyLevel,
  StrictnessMode,
  InterviewStatus,
  HiringVerdict,
} from '@interviewpilot/shared';
import { logger } from '../utils/logger';

export async function seedDatabase() {
  try {
    const mongoUri = env.MONGODB_URI || 'mongodb://localhost:27017/interviewpilot';
    logger.info({ uri: mongoUri }, 'Connecting to database for seeding...');
    await mongoose.connect(mongoUri);

    logger.info('Clearing existing demo data...');
    await User.deleteMany({ email: { $in: ['candidate@interviewpilot.ai', 'admin@interviewpilot.ai'] } });

    const candidatePasswordHash = await hashPassword('Password123!');
    const adminPasswordHash = await hashPassword('Password123!');

    // 1. Create Demo Users
    const candidateUser = await User.create({
      name: 'Alex Mercer',
      email: 'candidate@interviewpilot.ai',
      passwordHash: candidatePasswordHash,
      role: UserRole.CANDIDATE,
      profile: {
        headline: 'Senior Full-Stack & Distributed Systems Engineer',
        bio: 'Passionate software architect with 6+ years of experience building resilient microservices, high-throughput message brokers, and responsive modern web apps.',
        experienceYears: 6,
        targetRoles: ['Staff Software Engineer', 'Lead Backend Engineer', 'Solutions Architect'],
        targetCompanies: ['Google', 'Stripe', 'Netflix', 'Anthropic'],
        skills: ['TypeScript', 'Go', 'Python', 'React', 'Distributed Systems', 'Kafka', 'PostgreSQL', 'Docker', 'Kubernetes'],
        location: 'San Francisco, CA',
        githubUrl: 'https://github.com/alexmercer-demo',
        linkedinUrl: 'https://linkedin.com/in/alexmercer-demo',
      },
    });

    await User.create({
      name: 'Platform Administrator',
      email: 'admin@interviewpilot.ai',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      profile: {
        headline: 'InterviewPilot AI Super Administrator',
        experienceYears: 10,
        targetRoles: ['Platform Admin'],
        targetCompanies: ['InterviewPilot'],
        skills: ['Admin', 'Telemetry', 'Security'],
      },
    });

    logger.info(`Seeded users: candidate (${candidateUser.email}) and admin.`);

    // 2. Create Sample Resume & Structured Taxonomy
    await Resume.deleteMany({ candidateId: candidateUser._id });
    await Resume.create({
      candidateId: candidateUser._id,
      title: 'Alex Mercer - Senior Systems Engineer Resume',
      fileName: 'Alex_Mercer_Resume_2026.pdf',
      fileSize: 142800,
      mimeType: 'application/pdf',
      parsedTaxonomy: {
        fullName: 'Alex Mercer',
        email: 'candidate@interviewpilot.ai',
        phone: '+1 (555) 019-2834',
        location: 'San Francisco, CA',
        skills: [
          { name: 'Distributed Systems', category: 'Architecture', level: 'expert' },
          { name: 'TypeScript / Node.js', category: 'Backend', level: 'expert' },
          { name: 'Python / FastAPI', category: 'Backend', level: 'advanced' },
          { name: 'PostgreSQL & Sharding', category: 'Databases', level: 'advanced' },
          { name: 'Kafka / Event-Driven Messaging', category: 'Architecture', level: 'expert' },
          { name: 'React / Next.js', category: 'Frontend', level: 'advanced' },
          { name: 'Docker & Kubernetes', category: 'DevOps', level: 'intermediate' },
        ],
        experience: [
          {
            role: 'Senior Software Engineer',
            company: 'CloudScale Technologies',
            duration: '2022 - Present (3 yrs)',
            highlights: [
              'Architected distributed event streaming engine processing 1.2M events/sec with sub-50ms p99 latency.',
              'Designed database partitioning strategy in PostgreSQL reducing query execution time by 45%.',
              'Led team of 8 engineers across 4 major multi-region microservice deployments.',
            ],
          },
          {
            role: 'Software Engineer II',
            company: 'Nexus FinTech Labs',
            duration: '2020 - 2022 (2 yrs)',
            highlights: [
              'Implemented real-time transaction reconciliation pipeline with idempotent consumer queues.',
              'Refactored core REST APIs into modular GraphQL federation layer.',
            ],
          },
        ],
        education: [
          {
            degree: 'B.S. in Computer Science',
            institution: 'University of California, Berkeley',
            year: '2016 - 2020',
          },
        ],
        targetRoleMatch: {
          role: 'Staff Distributed Systems Engineer',
          matchPercentage: 94,
          matchedKeywords: ['Distributed Systems', 'Kafka', 'PostgreSQL', 'High Throughput', 'Idempotency'],
          missingKeywords: ['Rust', 'eBPF'],
        },
      },
      rawText: 'Alex Mercer Senior Systems Engineer with 6 years experience in distributed architectures...',
    });

    logger.info('Seeded candidate resume taxonomy.');

    // 3. Create Sample Completed Interview Sessions
    await Interview.deleteMany({ candidateId: candidateUser._id });

    // Session 1: System Design (Score 91, Strong Hire)
    const session1 = await Interview.create({
      candidateId: candidateUser._id,
      title: 'Senior Distributed Systems Architect Assessment',
      type: InterviewType.SYSTEM_DESIGN,
      difficulty: DifficultyLevel.SENIOR,
      targetRole: 'Staff Distributed Systems Engineer',
      durationMinutes: 45,
      strictness: StrictnessMode.REALISTIC,
      focusTopics: ['Distributed Systems', 'Fault Tolerance', 'Kafka', 'Consensus'],
      status: InterviewStatus.COMPLETED,
      startedAt: new Date(Date.now() - 4 * 86400000),
      endedAt: new Date(Date.now() - 4 * 86400000 + 42 * 60000),
      proctoringEvents: [
        { type: 'window_blur', timestamp: new Date(Date.now() - 4 * 86400000 + 10 * 60000) },
        { type: 'window_focus', timestamp: new Date(Date.now() - 4 * 86400000 + 10 * 60000 + 4000) },
      ],
      integrityScore: 98,
      integrityFlag: 'clean',
      stages: [
        { id: '1', title: 'Problem Clarification & Functional Requirements', durationMinutes: 10, status: 'completed' },
        { id: '2', title: 'High-Level Architecture & API Definition', durationMinutes: 15, status: 'completed' },
        { id: '3', title: 'Deep Dive into Consensus & Partitioning', durationMinutes: 15, status: 'completed' },
        { id: '4', title: 'Summary & Trade-Off Defense', durationMinutes: 5, status: 'completed' },
      ],
      messages: [
        {
          id: 'msg-1',
          role: 'interviewer',
          content: 'Welcome Alex! Today we will design a globally distributed real-time notification service handling 100M active subscriptions with at-least-once delivery guarantees. How would you structure the initial requirements?',
          timestamp: new Date(Date.now() - 4 * 86400000),
        },
        {
          id: 'msg-2',
          role: 'candidate',
          content: 'Let us clarify functional and non-functional requirements. Functionally, users subscribe to topic channels and receive notifications via WebSockets, APNs/FCM, and Webhooks. Non-functionally, we target 99.99% availability, max 200ms end-to-end latency, and idempotent deduplication using message hashes.',
          timestamp: new Date(Date.now() - 4 * 86400000 + 2 * 60000),
        },
      ],
      evaluationReport: {
        overallScore: 91,
        verdict: HiringVerdict.STRONG_HIRE,
        summary: 'Exceptional architectural grasp of distributed partitioning, idempotent consumer groups, and consensus trade-offs under high write concurrency.',
        strengths: [
          'Mastery over partition keying and consumer group rebalancing.',
          'Precise calculation of network throughput and disk I/O bottlenecks.',
          'Structured communication clarifying edge cases before diving into architecture.',
        ],
        weaknesses: [
          'Could elaborate further on database failover lag and cross-region replication latency.',
        ],
        actionableRecommendations: [
          'Review raft quorum leadership election timing under split-brain network scenarios.',
        ],
        categoryBreakdown: [
          { name: 'Technical & System Design', score: 94, maxScore: 100, feedback: 'Superb architecture layout.' },
          { name: 'Problem Solving & Scalability', score: 92, maxScore: 100, feedback: 'Strong capacity planning.' },
          { name: 'Communication & Structure', score: 90, maxScore: 100, feedback: 'Clear, concise trade-off explanations.' },
          { name: 'Edge Case & Fault Tolerance', score: 88, maxScore: 100, feedback: 'Comprehensive recovery design.' },
        ],
      },
    });

    // Session 2: Coding & Data Structures (Score 86, Hire)
    const session2 = await Interview.create({
      candidateId: candidateUser._id,
      title: 'Advanced DSA & Concurrency Drill',
      type: InterviewType.CODING,
      difficulty: DifficultyLevel.SENIOR,
      targetRole: 'Senior Backend Engineer',
      durationMinutes: 45,
      strictness: StrictnessMode.HARD,
      focusTopics: ['Concurrency', 'Lock-Free Queues', 'Dynamic Programming'],
      status: InterviewStatus.COMPLETED,
      startedAt: new Date(Date.now() - 2 * 86400000),
      endedAt: new Date(Date.now() - 2 * 86400000 + 38 * 60000),
      integrityScore: 95,
      integrityFlag: 'clean',
      stages: [
        { id: '1', title: 'Problem Discovery & Edge Case Identification', durationMinutes: 10, status: 'completed' },
        { id: '2', title: 'Algorithm Design & Complexity Analysis', durationMinutes: 15, status: 'completed' },
        { id: '3', title: 'Live Implementation & Unit Testing', durationMinutes: 15, status: 'completed' },
        { id: '4', title: 'Optimization & Memory Profile', durationMinutes: 5, status: 'completed' },
      ],
      messages: [
        {
          id: 'msg-3',
          role: 'interviewer',
          content: 'Implement a thread-safe rate limiter with a sliding window log algorithm in Python with O(1) amortized lookup and strict memory bounds.',
          timestamp: new Date(Date.now() - 2 * 86400000),
        },
        {
          id: 'msg-4',
          role: 'candidate',
          content: 'I will use a Redis sorted set with pipeline transactions and double-ended queues for atomic timestamp evictions.',
          timestamp: new Date(Date.now() - 2 * 86400000 + 4 * 60000),
        },
      ],
      evaluationReport: {
        overallScore: 86,
        verdict: HiringVerdict.HIRE,
        summary: 'Solid implementation of sliding window rate limiting with proper lock management and boundary validation.',
        strengths: [
          'Clean, idiomatic code with robust test coverage.',
          'Precise time complexity analysis O(log N) on sorted window bounds.',
        ],
        weaknesses: [
          'Initial memory calculation overlooked metadata overhead in sorted structures.',
        ],
        actionableRecommendations: [
          'Practice sliding window counter approximations (e.g. token bucket / leaky bucket) to conserve RAM under massive burst scale.',
        ],
        categoryBreakdown: [
          { name: 'Algorithmic Correctness', score: 88, maxScore: 100, feedback: 'All test cases passed cleanly.' },
          { name: 'Code Quality & Cleanliness', score: 90, maxScore: 100, feedback: 'Modular and readable.' },
          { name: 'Efficiency & Complexity', score: 84, maxScore: 100, feedback: 'Optimal time complexity achieved.' },
        ],
      },
    });

    logger.info(`Seeded 2 completed interviews: ${session1.title} and ${session2.title}.`);
    logger.info('Database seeding completed successfully.');
  } catch (err: any) {
    logger.error({ error: err.message }, 'Database seeding encountered an error');
    throw err;
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
