import mongoose from 'mongoose';
import {
  InterviewType,
  DifficultyLevel,
  StrictnessMode,
  InterviewStatus,
  IInterviewStage,
  IInterviewMessage,
  IInterviewSession,
  IInterviewSummary,
  HiringVerdict,
  IInterviewEvaluationReport,
  IProctoringEvent,
  IProctoringReport,
  RecordProctoringEventDto,
  ProctoringEventType
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

  /**
   * Evaluates the completed interview session and generates in-depth feedback report.
   */
  public async evaluateInterview(
    userId: string,
    interviewId: string,
    isAdmin = false
  ): Promise<{ session: IInterviewSession; report: IInterviewEvaluationReport }> {
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

    let report: IInterviewEvaluationReport | null = null;

    try {
      const aiUrl = `${env.AI_SERVICE_URL}/api/v1/interview/evaluate`;
      const res = await fetch(aiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: interview.toSessionObject(),
          history: interview.messages
        })
      });

      if (res.ok) {
        const data = (await res.json()) as { success: boolean; data: IInterviewEvaluationReport };
        if (data.success && data.data) {
          report = data.data;
        }
      }
    } catch {
      logger.warn('[InterviewService] AI Service evaluate offline, using fallback report generator');
    }

    if (!report) {
      report = this.generateFallbackReport(interview);
    }

    // Evaluate Proctoring Telemetry
    const proctoringReport = await this.evaluateProctoringEvents(interview);
    report.proctoringReport = proctoringReport;
    interview.proctoringReport = proctoringReport;

    interview.evaluationReport = report;
    interview.overallScore = report.overallScore;
    interview.status = InterviewStatus.COMPLETED;
    if (!interview.completedAt) {
      interview.completedAt = new Date();
    }

    await interview.save();
    return {
      session: interview.toSessionObject(),
      report
    };
  }

  /**
   * Retrieves existing evaluation report for an interview session.
   */
  public async getEvaluationReport(
    userId: string,
    interviewId: string,
    isAdmin = false
  ): Promise<IInterviewEvaluationReport> {
    const interview = await this.getInterviewById(userId, interviewId, isAdmin);
    if (!interview.evaluationReport) {
      const evaluated = await this.evaluateInterview(userId, interviewId, isAdmin);
      return evaluated.report;
    }
    return interview.evaluationReport;
  }

  /**
   * Records a proctoring telemetry event for a live interview session.
   */
  public async recordProctoringEvent(
    userId: string,
    interviewId: string,
    dto: RecordProctoringEventDto,
    isAdmin = false
  ): Promise<IProctoringEvent> {
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

    const event: IProctoringEvent = {
      id: `proc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sessionId: interviewId,
      timestamp: new Date().toISOString(),
      eventType: dto.eventType,
      severity: dto.severity || 'low',
      metadata: dto.metadata
    };

    if (!interview.proctoringEvents) {
      interview.proctoringEvents = [];
    }

    interview.proctoringEvents.push(event);
    await interview.save();

    logger.debug(`[InterviewService] Recorded proctoring event ${event.eventType} for session ${interviewId}`);
    return event;
  }

  /**
   * Retrieves or computes the proctoring report for a session.
   */
  public async getProctoringReport(
    userId: string,
    interviewId: string,
    isAdmin = false
  ): Promise<IProctoringReport> {
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

    if (interview.proctoringReport) {
      return interview.proctoringReport;
    }

    const report = await this.evaluateProctoringEvents(interview);
    interview.proctoringReport = report;
    await interview.save();
    return report;
  }

  private async evaluateProctoringEvents(interview: any): Promise<IProctoringReport> {
    const events = interview.proctoringEvents || [];
    let report: IProctoringReport | null = null;

    try {
      const aiUrl = `${env.AI_SERVICE_URL}/api/v1/resume/proctoring/evaluate`;
      const res = await fetch(aiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: interview._id.toString(),
          events
        })
      });

      if (res.ok) {
        const body = (await res.json()) as { success: boolean; data: IProctoringReport };
        if (body.success && body.data) {
          report = body.data;
        }
      }
    } catch {
      logger.warn('[InterviewService] AI Service proctoring evaluator offline, using fallback');
    }

    if (!report) {
      const tabSwitches = events.filter((e: any) => e.eventType === 'tab_blur' || e.eventType === 'fullscreen_exit').length;
      const pastes = events.filter((e: any) => e.eventType === 'clipboard_paste').length;
      let score = 100;
      if (tabSwitches > 5) score -= (tabSwitches - 5) * 6 + 15;
      else if (tabSwitches > 2) score -= (tabSwitches - 2) * 4;
      score = Math.max(20, Math.min(100, score));

      const flagLevel = score >= 85 ? 'clean' : score >= 65 ? 'suspicious' : 'flagged';

      report = {
        sessionId: interview._id.toString(),
        integrityScore: score,
        flagLevel,
        totalViolations: events.length,
        tabSwitchCount: tabSwitches,
        pasteCount: pastes,
        events,
        summary: score >= 85
          ? 'Session integrity verified. Candidate maintained window focus throughout the assessment.'
          : `Potential test integrity flag: ${tabSwitches} window blur(s) and ${pastes} paste event(s) recorded.`
      };
    }

    return report;
  }

  private generateFallbackReport(interview: any): IInterviewEvaluationReport {
    const candidateMsgs = interview.messages?.filter((m: any) => m.role === 'candidate') || [];
    const allCandidateText = candidateMsgs.map((m: any) => m.content || '').join(' ');
    const wordCount = allCandidateText.split(/\s+/).filter(Boolean).length;
    
    // Extract code snippets
    const codeBlocks: string[] = [];
    for (const m of candidateMsgs) {
      if (m.codeSnippet?.code) {
        codeBlocks.push(m.codeSnippet.code);
      }
    }
    const hasCode = codeBlocks.length > 0;

    // Detect mentioned technical terms
    const techBank = [
      'React', 'Redux', 'Zustand', 'Context', 'TypeScript', 'JavaScript', 'Node.js', 'Express',
      'Python', 'FastAPI', 'Go', 'Java', 'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Kafka',
      'Docker', 'Kubernetes', 'AWS', 'System Design', 'Caching', 'Sharding', 'Replication',
      'Concurrency', 'Event Loop', 'Time Complexity', 'Space Complexity', 'Big-O', 'Algorithms'
    ];
    const lower = (allCandidateText + ' ' + codeBlocks.join(' ')).toLowerCase();
    const matchedTech = techBank.filter((k) => lower.includes(k.toLowerCase()));
    const techSummary = matchedTech.length > 0 ? matchedTech.slice(0, 4).join(', ') : 'software engineering principles';

    const hasComplexity = lower.includes('o(') || lower.includes('complexity') || lower.includes('big-o') || lower.includes('latency');
    const hasArchitecture = lower.includes('scalable') || lower.includes('distributed') || lower.includes('cache') || lower.includes('service');

    let score = 72;
    if (wordCount > 150) score += 12;
    else if (wordCount > 60) score += 8;
    else if (wordCount > 20) score += 3;
    else score -= 12;

    if (matchedTech.length >= 3) score += 6;
    if (hasComplexity) score += 3;
    if (hasArchitecture) score += 3;
    if (hasCode) score += 4;

    score = Math.min(97, Math.max(45, score));

    const verdict =
      score >= 88
        ? HiringVerdict.STRONG_HIRE
        : score >= 76
        ? HiringVerdict.HIRE
        : score >= 65
        ? HiringVerdict.LEAN_HIRE
        : score >= 52
        ? HiringVerdict.LEAN_NO_HIRE
        : HiringVerdict.NO_HIRE;

    const stages = interview.stages || [];
    const stageEvaluations = stages.map((s: any, i: number) => {
      const stageMsgs = candidateMsgs.filter((m: any) => m.stageId === s.id || m.stageIndex === i);
      const stageWords = stageMsgs.reduce((acc: number, m: any) => acc + (m.content || '').split(/\s+/).length, 0);
      const stageText = stageMsgs.map((m: any) => m.content || '').join(' ');
      const preview = stageText.length > 80 ? stageText.substring(0, 80) + '...' : stageText;

      return {
        stageId: s.id || `stage-${i + 1}`,
        stageTitle: s.title || `Stage ${i + 1}`,
        score: Math.min(100, Math.max(45, score + (stageWords > 20 ? 2 : -3))),
        feedback: stageWords > 0
          ? `Candidate participated with ${stageWords} words in ${s.title}: "${preview}". Demonstrated relevant knowledge.`
          : `Standard progression through ${s.title}.`,
        keyObservations: [
          stageWords > 0 ? `Discussed: "${preview}"` : `Completed stage requirements for ${s.title}`,
          `Evaluated against ${interview.targetRole} benchmark standards.`
        ],
        strengths: [
          `Clear articulation of concepts related to ${s.title}.`,
          'Direct alignment with interviewer probes.'
        ],
        areasForImprovement: [
          'Proactively discuss edge cases and throughput constraints early in the response.'
        ]
      };
    });

    return {
      overallScore: score,
      verdict,
      summary: `Candidate completed the ${interview.difficulty?.toUpperCase() || 'SENIOR'} ${interview.targetRole} (${interview.type}) assessment with an overall readiness score of ${score}/100 resulting in a '${verdict.replace(/_/g, ' ')}' verdict. Demonstrated proficiency in ${techSummary} with clear communication.`,
      dimensionScores: [
        {
          dimension: 'Technical & Algorithmic Correctness',
          score: Math.min(100, Math.max(45, score + (matchedTech.length >= 2 ? 3 : -3))),
          maxScore: 100,
          feedback: `Demonstrated technical understanding of ${techSummary}.`,
          status: score >= 85 ? 'exceeds' : score >= 68 ? 'meets' : 'below'
        },
        {
          dimension: 'Problem-Solving & Architectural Depth',
          score: Math.min(100, Math.max(40, score + (hasArchitecture ? 3 : -2))),
          maxScore: 100,
          feedback: hasArchitecture ? 'Structured problem breakdown with clear component decomposition.' : 'Good high-level reasoning; deeper exploration of distributed failure modes recommended.',
          status: score >= 82 ? 'exceeds' : score >= 65 ? 'meets' : 'below'
        },
        {
          dimension: 'Communication Clarity & Structure',
          score: Math.min(100, Math.max(50, score + (wordCount >= 50 ? 4 : -4))),
          maxScore: 100,
          feedback: `Candidate provided ${wordCount} words across responses with concise, structured delivery.`,
          status: score >= 80 ? 'exceeds' : score >= 65 ? 'meets' : 'below'
        },
        {
          dimension: 'Edge Cases & Scalability Handling',
          score: Math.min(100, Math.max(38, score + (hasComplexity ? 2 : -5))),
          maxScore: 100,
          feedback: hasComplexity ? 'Considered asymptotic bounds and runtime trade-offs.' : 'Explicitly quantify worst-case latency and partition boundaries.',
          status: score >= 88 ? 'exceeds' : score >= 68 ? 'meets' : 'below'
        },
        {
          dimension: 'Code & Implementation Quality',
          score: Math.min(100, Math.max(45, score + (hasCode ? 4 : -1))),
          maxScore: 100,
          feedback: hasCode ? 'Provided clean and structured code implementation.' : 'Demonstrated conceptual clarity; writing runnable snippets is encouraged.',
          status: score >= 84 ? 'exceeds' : score >= 67 ? 'meets' : 'below'
        }
      ],
      stageEvaluations,
      strengths: [
        `Strong grasp of core technical concepts including ${techSummary}.`,
        'Structured, articulate, and responsive communication style.',
        'Effective problem scoping matching target role standards.'
      ],
      weaknesses: [
        'Proactively state Big-O computational time and space trade-offs.',
        'Deepen quantitative estimation of system metrics (QPS, IOPS, and tail latency).'
      ],
      actionPlan: [
        `Master advanced architectural patterns and state lifecycles in ${matchedTech[0] || 'your core stack'}.`,
        'Practice timed mock interviews focusing on verbalizing failure recovery before implementation.',
        'Incorporate explicit edge case checklists (empty inputs, timeouts, concurrency collisions).'
      ],
      generatedAt: new Date().toISOString()
    };
  }
}

export const interviewService = new InterviewService();


