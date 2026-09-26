import { z } from 'zod';
import { InterviewType, DifficultyLevel, StrictnessMode, InterviewStatus } from '@interviewpilot/shared';

export const createInterviewSchema = z.object({
  title: z.string().trim().max(120, 'Title cannot exceed 120 characters').optional(),
  type: z.nativeEnum(InterviewType, {
    errorMap: () => ({ message: 'Invalid interview type' })
  }),
  difficulty: z.nativeEnum(DifficultyLevel, {
    errorMap: () => ({ message: 'Invalid difficulty level' })
  }),
  targetRole: z
    .string({ required_error: 'Target role is required' })
    .trim()
    .min(2, 'Target role must be at least 2 characters')
    .max(100, 'Target role cannot exceed 100 characters'),
  durationMinutes: z
    .number({ required_error: 'Duration is required' })
    .int('Duration must be an integer')
    .min(15, 'Minimum interview duration is 15 minutes')
    .max(60, 'Maximum interview duration is 60 minutes'),
  focusTopics: z
    .array(z.string().trim().min(1, 'Topic cannot be empty'))
    .min(1, 'At least one focus topic is required')
    .max(10, 'Cannot specify more than 10 focus topics'),
  strictness: z.nativeEnum(StrictnessMode, {
    errorMap: () => ({ message: 'Invalid strictness mode' })
  }),
  jobDescription: z.string().trim().max(10000, 'Job description cannot exceed 10,000 characters').optional(),
  resumeId: z.string().trim().optional(),
  customInstructions: z.string().trim().max(2000, 'Custom instructions cannot exceed 2,000 characters').optional()
});

export const updateInterviewStatusSchema = z.object({
  status: z.nativeEnum(InterviewStatus, {
    errorMap: () => ({ message: 'Invalid interview status' })
  })
});

export const listInterviewsQuerySchema = z.object({
  status: z.nativeEnum(InterviewStatus).optional(),
  type: z.nativeEnum(InterviewType).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10)
});

export type CreateInterviewInput = z.infer<typeof createInterviewSchema>;
export type UpdateInterviewStatusInput = z.infer<typeof updateInterviewStatusSchema>;
export type ListInterviewsQueryInput = z.infer<typeof listInterviewsQuerySchema>;
