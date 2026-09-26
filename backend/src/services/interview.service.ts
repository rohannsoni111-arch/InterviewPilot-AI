import mongoose from 'mongoose';
import {
  InterviewType,
  DifficultyLevel,
  StrictnessMode,
  InterviewStatus,
  IInterviewStage,
  IInterviewMessage,
  IInterviewSession,
  IInterviewSummary
} from '@interviewpilot/shared';
import { Interview, IInterviewDocument } from '../models/Interview';
import { CreateInterviewInput, ListInterviewsQueryInput } from '../validators/interview.validator';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { env } from '../config/env';


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
   * Starts a live interview session and generates opening question turn.
   */
  public async startLiveSession(
    userId: string,
    interviewId: string,
    isAdmin = false
  ): Promise<{ session: IInterviewSession; message: IInterviewMessage }> {
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

    if (interview.status === InterviewStatus.CONFIGURING) {
      interview.status = InterviewStatus.IN_PROGRESS;
      if (interview.stages && interview.stages.length > 0) {
        interview.stages[0].status = 'active';
      }
    }

    if (!interview.messages || interview.messages.length === 0) {
      // Generate opening AI interviewer turn
      let openingMsg = '';
      let suggestedFollowUps: string[] = [];

      try {
        const aiUrl = `${env.AI_SERVICE_URL}/api/v1/interview/start`;
        const res = await fetch(aiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session: interview.toSessionObject() })
        });
        if (res.ok) {
          const data = (await res.json()) as { message: string; suggested_follow_ups?: string[] };
          openingMsg = data.message;
          suggestedFollowUps = data.suggested_follow_ups || [];
        }
      } catch (err) {
        logger.warn('[InterviewService] AI Service offline, using resilient local generator');
      }

      if (!openingMsg) {
        const stage1 = interview.stages[0]?.title || 'Introduction';
        openingMsg = `Hello and welcome! We are starting Stage 1: ${stage1} for your ${interview.difficulty.toUpperCase()} ${interview.targetRole} assessment.\n\nCould you introduce your approach and summarize your key design considerations for ${interview.focusTopics.slice(0, 2).join(' and ') || 'this session'}?`;
        suggestedFollowUps = ['Clarify requirements', 'Outline architecture', 'Discuss edge cases'];
      }

      const initialMessage: IInterviewMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        role: 'interviewer',
        content: openingMsg,
        stageId: interview.stages[0]?.id || 'stage-1',
        stageIndex: 0,
        timestamp: new Date().toISOString(),
        suggestedFollowUps
      };

      interview.messages = [initialMessage];
    }

    await interview.save();
    return {
      session: interview.toSessionObject(),
      message: interview.messages[0]
    };
  }

  /**
   * Processes a candidate turn response and generates adaptive AI interviewer follow-up.
   */
  public async processTurn(
    userId: string,
    interviewId: string,
    candidateContent: string,
    isAdmin = false,
    codeSnippet?: any
  ): Promise<{ session: IInterviewSession; message: IInterviewMessage; stageAdvanced?: boolean }> {
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

    if (interview.status === InterviewStatus.COMPLETED) {
      throw new AppError('This interview session has already been concluded', 400);
    }

    if (interview.status !== InterviewStatus.IN_PROGRESS) {
      interview.status = InterviewStatus.IN_PROGRESS;
    }

    const currentStageIdx = interview.currentStageIndex || 0;
    const currentStage = interview.stages[currentStageIdx] || interview.stages[0];

    // Append Candidate Message
    const candidateMsg: IInterviewMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      role: 'candidate',
      content: candidateContent,
      stageId: currentStage?.id,
      stageIndex: currentStageIdx,
      timestamp: new Date().toISOString(),
      codeSnippet: codeSnippet || undefined
    };

    if (!interview.messages) interview.messages = [];
    interview.messages.push(candidateMsg);

    // Call AI Service for turn response
    let aiResponseText = '';
    let stageTransitionRecommended = false;
    let suggestedFollowUps: string[] = [];

    try {
      const aiUrl = `${env.AI_SERVICE_URL}/api/v1/interview/turn`;
      const res = await fetch(aiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: interview.toSessionObject(),
          history: interview.messages,
          candidate_response: candidateContent
        })
      });

      if (res.ok) {
        const data = (await res.json()) as {
          message: string;
          stage_transition_recommended?: boolean;
          suggested_follow_ups?: string[];
        };
        aiResponseText = data.message;
        stageTransitionRecommended = !!data.stage_transition_recommended;
        suggestedFollowUps = data.suggested_follow_ups || [];
      }
    } catch (err) {
      logger.warn('[InterviewService] AI Service turn offline, using fallback turn generation');
    }

    if (!aiResponseText) {
      aiResponseText = `Thank you for the explanation. Looking deeper at your response: How would you optimize this under high concurrency and ensure zero data loss during node failures?`;
      suggestedFollowUps = ['Explain failover mechanism', 'Discuss trade-offs', 'Provide benchmark metrics'];
    }

    let stageAdvanced = false;
    if (stageTransitionRecommended && currentStageIdx < interview.stages.length - 1) {
      interview.stages[currentStageIdx].status = 'completed';
      interview.currentStageIndex = currentStageIdx + 1;
      interview.stages[currentStageIdx + 1].status = 'active';
      stageAdvanced = true;
    }

    const aiMsg: IInterviewMessage = {
      id: `msg-${Date.now() + 1}-${Math.random().toString(36).substring(2, 7)}`,
      role: 'interviewer',
      content: aiResponseText,
      stageId: interview.stages[interview.currentStageIndex]?.id || currentStage?.id,
      stageIndex: interview.currentStageIndex,
      timestamp: new Date().toISOString(),
      suggestedFollowUps
    };

    interview.messages.push(aiMsg);
    await interview.save();

    return {
      session: interview.toSessionObject(),
      message: aiMsg,
      stageAdvanced
    };
  }

  /**
   * Advances the interview session to the next stage.
   */
  public async advanceStage(
    userId: string,
    interviewId: string,
    isAdmin = false
  ): Promise<{ session: IInterviewSession; message: IInterviewMessage }> {
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

    const currentIdx = interview.currentStageIndex || 0;
    if (currentIdx >= interview.stages.length - 1) {
      throw new AppError('Interview is already at the final stage', 400);
    }

    interview.stages[currentIdx].status = 'completed';
    interview.currentStageIndex = currentIdx + 1;
    interview.stages[currentIdx + 1].status = 'active';

    const nextStage = interview.stages[currentIdx + 1];

    let transitionMsg = '';
    try {
      const aiUrl = `${env.AI_SERVICE_URL}/api/v1/interview/advance-stage`;
      const res = await fetch(aiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: interview.toSessionObject(),
          new_stage_idx: interview.currentStageIndex
        })
      });
      if (res.ok) {
        const data = (await res.json()) as { message: string };
        transitionMsg = data.message;
      }
    } catch (err) {
      logger.warn('[InterviewService] AI advance-stage endpoint offline, using fallback');
    }

    if (!transitionMsg) {
      transitionMsg = `We are now advancing to **Stage ${interview.currentStageIndex + 1}: ${nextStage.title}** (${nextStage.durationMinutes} min).\n\n${nextStage.description}\n\nPlease proceed with your solution addressing this stage's scope.`;
    }

    const systemTurn: IInterviewMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      role: 'interviewer',
      content: transitionMsg,
      stageId: nextStage.id,
      stageIndex: interview.currentStageIndex,
      timestamp: new Date().toISOString(),
      suggestedFollowUps: ['Present high level architecture', 'Discuss edge cases', 'Verify complexity']
    };

    if (!interview.messages) interview.messages = [];
    interview.messages.push(systemTurn);

    await interview.save();
    return {
      session: interview.toSessionObject(),
      message: systemTurn
    };
  }

  /**
   * Pauses an active interview session.
   */
  public async pauseSession(userId: string, interviewId: string, isAdmin = false): Promise<IInterviewSession> {
    return this.updateInterviewStatus(userId, interviewId, InterviewStatus.PAUSED, isAdmin);
  }

  /**
   * Resumes a paused interview session.
   */
  public async resumeSession(userId: string, interviewId: string, isAdmin = false): Promise<IInterviewSession> {
    return this.updateInterviewStatus(userId, interviewId, InterviewStatus.IN_PROGRESS, isAdmin);
  }

  /**
   * Concludes an interview session, calculates duration, and marks completed.
   */
  public async concludeSession(userId: string, interviewId: string, isAdmin = false): Promise<IInterviewSession> {
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

    interview.status = InterviewStatus.COMPLETED;
    interview.completedAt = new Date();
    if (interview.stages) {
      interview.stages.forEach(st => (st.status = 'completed'));
    }

    const durationSeconds = Math.max(60, Math.floor((Date.now() - new Date(interview.createdAt).getTime()) / 1000));
    interview.durationSeconds = durationSeconds;

    const concludingMsg: IInterviewMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      role: 'interviewer',
      content: `Thank you for completing this **${interview.title}** session!\n\nAll interview stages have concluded. Your detailed evaluation scorecard, skill breakdown, and personalized recommendations are now available.`,
      stageIndex: interview.currentStageIndex,
      timestamp: new Date().toISOString()
    };

    if (!interview.messages) interview.messages = [];
    interview.messages.push(concludingMsg);

    await interview.save();
    return interview.toSessionObject();
  }

  /**
   * Updates an interview session status.
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

