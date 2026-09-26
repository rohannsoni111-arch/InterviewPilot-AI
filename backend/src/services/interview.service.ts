import mongoose from 'mongoose';
import {
  InterviewType,
  DifficultyLevel,
  StrictnessMode,
  InterviewStatus,
  IInterviewStage,
  IInterviewSession,
  IInterviewSummary
} from '@interviewpilot/shared';
import { Interview, IInterviewDocument } from '../models/Interview';
import { CreateInterviewInput, ListInterviewsQueryInput } from '../validators/interview.validator';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export class InterviewService {
  /**
   * Generates structured adaptive interview stages according to type and target duration.
   */
  public generateStages(type: InterviewType, durationMinutes: number): IInterviewStage[] {
    const total = Math.max(15, Math.min(60, durationMinutes));
    const introTime = 5;
    const wrapTime = 5;
    const coreTime = Math.max(5, total - introTime - wrapTime);
    const splitA = Math.floor(coreTime / 2);
    const splitB = coreTime - splitA;

    switch (type) {
      case InterviewType.CODING:
        return [
          {
            id: 'stage-1',
            title: 'Problem Clarification & Requirements',
            description: 'Understand the problem prompt, identify constraints, and discuss edge cases.',
            durationMinutes: introTime,
            order: 1,
            status: 'pending'
          },
          {
            id: 'stage-2',
            title: 'Algorithm Design & Complexity',
            description: 'Evaluate optimal data structures and time/space complexity approaches.',
            durationMinutes: splitA,
            order: 2,
            status: 'pending'
          },
          {
            id: 'stage-3',
            title: 'Implementation & Live Coding',
            description: 'Write clean, modular code satisfying all functional constraints.',
            durationMinutes: splitB,
            order: 3,
            status: 'pending'
          },
          {
            id: 'stage-4',
            title: 'Verification & Code Review',
            description: 'Dry run test cases, discuss trade-offs, and suggest follow-up optimizations.',
            durationMinutes: wrapTime,
            order: 4,
            status: 'pending'
          }
        ];

      case InterviewType.SYSTEM_DESIGN:
        return [
          {
            id: 'stage-1',
            title: 'Requirements & Scope Scoping',
            description: 'Define functional requirements, non-functional latency/throughput targets, and data capacity.',
            durationMinutes: introTime,
            order: 1,
            status: 'pending'
          },
          {
            id: 'stage-2',
            title: 'High-Level Architecture & API Design',
            description: 'Sketch core services, database schema, data flow, and external contracts.',
            durationMinutes: splitA,
            order: 2,
            status: 'pending'
          },
          {
            id: 'stage-3',
            title: 'Deep Dive & Scalability Bottlenecks',
            description: 'Analyze caching, partitioning, load balancing, and consensus strategies.',
            durationMinutes: splitB,
            order: 3,
            status: 'pending'
          },
          {
            id: 'stage-4',
            title: 'Failure Modes & Resiliency',
            description: 'Discuss disaster recovery, backpressure, rate limiting, and trade-offs.',
            durationMinutes: wrapTime,
            order: 4,
            status: 'pending'
          }
        ];

      case InterviewType.BEHAVIORAL:
        return [
          {
            id: 'stage-1',
            title: 'Introduction & Career Overview',
            description: 'Brief introduction, background summary, and mutual alignment.',
            durationMinutes: introTime,
            order: 1,
            status: 'pending'
          },
          {
            id: 'stage-2',
            title: 'STAR Method: Technical Challenges & Conflict',
            description: 'Deep dive into past engineering dilemmas and collaborative conflict resolution.',
            durationMinutes: splitA,
            order: 2,
            status: 'pending'
          },
          {
            id: 'stage-3',
            title: 'Leadership & Impact',
            description: 'Explore ownership, mentoring, dealing with ambiguity, and delivery track record.',
            durationMinutes: splitB,
            order: 3,
            status: 'pending'
          },
          {
            id: 'stage-4',
            title: 'Candidate Q&A & Wrap-Up',
            description: 'Candidate questions regarding culture, team practices, and closing remarks.',
            durationMinutes: wrapTime,
            order: 4,
            status: 'pending'
          }
        ];

      case InterviewType.RESUME_DEFENSE:
        return [
          {
            id: 'stage-1',
            title: 'Resume & Highlight Verification',
            description: 'Walk through key accomplishments and claimed technologies on the resume.',
            durationMinutes: introTime,
            order: 1,
            status: 'pending'
          },
          {
            id: 'stage-2',
            title: 'Architectural Defense & Key Contributions',
            description: 'Critique architectural decisions and your specific individual contributions.',
            durationMinutes: splitA,
            order: 2,
            status: 'pending'
          },
          {
            id: 'stage-3',
            title: 'Metrics, Production Outages & Lessons',
            description: 'Examine production incidents, real-world metrics, and post-mortem learnings.',
            durationMinutes: splitB,
            order: 3,
            status: 'pending'
          },
          {
            id: 'stage-4',
            title: 'Target Role Alignment',
            description: 'Map previous experiences directly to target role expectations.',
            durationMinutes: wrapTime,
            order: 4,
            status: 'pending'
          }
        ];

      case InterviewType.SQL:
        return [
          {
            id: 'stage-1',
            title: 'Schema Analysis & Business Requirements',
            description: 'Review table schemas, relationships, constraints, and business domain objectives.',
            durationMinutes: introTime,
            order: 1,
            status: 'pending'
          },
          {
            id: 'stage-2',
            title: 'Query Formulation & Aggregations',
            description: 'Write complex JOINs, CTEs, Window functions, and aggregations.',
            durationMinutes: splitA,
            order: 2,
            status: 'pending'
          },
          {
            id: 'stage-3',
            title: 'Query Optimization & Indexing',
            description: 'Analyze execution plans, evaluate indexes, and optimize query latency.',
            durationMinutes: splitB,
            order: 3,
            status: 'pending'
          },
          {
            id: 'stage-4',
            title: 'Data Modeling & Constraints',
            description: 'Discuss normalization, partition strategies, and concurrency anomalies.',
            durationMinutes: wrapTime,
            order: 4,
            status: 'pending'
          }
        ];

      case InterviewType.TECHNICAL:
      case InterviewType.MIXED:
      default:
        return [
          {
            id: 'stage-1',
            title: 'Technical Introduction & Fundamentals',
            description: 'Warm up and assess core engineering foundations and system concepts.',
            durationMinutes: introTime,
            order: 1,
            status: 'pending'
          },
          {
            id: 'stage-2',
            title: 'Core Domain & Problem Solving',
            description: 'Targeted technical problem solving within the chosen focus topics.',
            durationMinutes: splitA,
            order: 2,
            status: 'pending'
          },
          {
            id: 'stage-3',
            title: 'Practical Application & Architecture',
            description: 'Real-world scenario analysis, trade-off evaluations, and debugging.',
            durationMinutes: splitB,
            order: 3,
            status: 'pending'
          },
          {
            id: 'stage-4',
            title: 'Debrief & Assessment Synthesis',
            description: 'Wrap-up, candidate questions, and session conclusion.',
            durationMinutes: wrapTime,
            order: 4,
            status: 'pending'
          }
        ];
    }
  }

  /**
   * Creates and initializes a new interview session.
   */
  public async createInterview(userId: string, input: CreateInterviewInput): Promise<IInterviewSession> {
    const formattedType = input.type.replace('_', ' ').toUpperCase();
    const formattedDifficulty = input.difficulty.toUpperCase();
    const defaultTitle = `${formattedDifficulty} ${input.targetRole} (${formattedType})`;
    const title = input.title?.trim() ? input.title.trim() : defaultTitle;

    const stages = this.generateStages(input.type, input.durationMinutes);

    const interview = new Interview({
      userId: new mongoose.Types.ObjectId(userId),
      title,
      type: input.type,
      difficulty: input.difficulty,
      targetRole: input.targetRole,
      durationMinutes: input.durationMinutes,
      durationSeconds: 0,
      strictness: input.strictness,
      status: InterviewStatus.CONFIGURING,
      topics: input.focusTopics,
      focusTopics: input.focusTopics,
      jobDescription: input.jobDescription,
      resumeId: input.resumeId,
      customInstructions: input.customInstructions,
      stages,
      currentStageIndex: 0
    });

    await interview.save();
    logger.info(`[InterviewService] Created interview ${interview._id} for user ${userId}`);

    return interview.toSessionObject();
  }

  /**
   * Retrieves an interview session by ID with authorization verification.
   */
  public async getInterviewById(userId: string, interviewId: string, isAdmin = false): Promise<IInterviewSession> {
    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      throw new AppError('Invalid interview ID', 400);
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      throw new AppError('Interview session not found', 404);
    }

    if (!isAdmin && interview.userId.toString() !== userId) {
      throw new AppError('Unauthorized access to this interview session', 403);
    }

    return interview.toSessionObject();
  }

  /**
   * Lists interview sessions for a user with pagination and optional filtering.
   */
  public async listUserInterviews(
    userId: string,
    query: ListInterviewsQueryInput,
    isAdmin = false
  ): Promise<{
    interviews: IInterviewSummary[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const filter: Record<string, unknown> = {};

    if (!isAdmin) {
      filter.userId = new mongoose.Types.ObjectId(userId);
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.type) {
      filter.type = query.type;
    }

    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(50, query.limit || 10));
    const skip = (page - 1) * limit;

    const [interviews, total] = await Promise.all([
      Interview.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Interview.countDocuments(filter)
    ]);

    return {
      interviews: interviews.map((i) => i.toSummaryObject()),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1
    };
  }

  /**
   * Updates an interview session status (e.g. IN_PROGRESS, PAUSED, ABANDONED, COMPLETED).
   */
  public async updateInterviewStatus(
    userId: string,
    interviewId: string,
    status: InterviewStatus,
    isAdmin = false
  ): Promise<IInterviewSession> {
    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      throw new AppError('Invalid interview ID', 400);
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      throw new AppError('Interview session not found', 404);
    }

    if (!isAdmin && interview.userId.toString() !== userId) {
      throw new AppError('Unauthorized access to this interview session', 403);
    }

    interview.status = status;
    if (status === InterviewStatus.COMPLETED && !interview.completedAt) {
      interview.completedAt = new Date();
    }

    await interview.save();
    logger.info(`[InterviewService] Interview ${interviewId} status updated to ${status}`);

    return interview.toSessionObject();
  }

  /**
   * Deletes an interview session.
   */
  public async deleteInterview(userId: string, interviewId: string, isAdmin = false): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      throw new AppError('Invalid interview ID', 400);
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      throw new AppError('Interview session not found', 404);
    }

    if (!isAdmin && interview.userId.toString() !== userId) {
      throw new AppError('Unauthorized to delete this interview', 403);
    }

    await Interview.findByIdAndDelete(interviewId);
    logger.info(`[InterviewService] Deleted interview ${interviewId}`);
  }
}

export const interviewService = new InterviewService();
