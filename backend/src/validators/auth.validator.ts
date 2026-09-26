import { z } from 'zod';
import { UserRole } from '@interviewpilot/shared';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(passwordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  role: z.nativeEnum(UserRole).optional().default(UserRole.CANDIDATE)
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required')
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  headline: z.string().max(150).optional(),
  bio: z.string().max(1000).optional(),
  experienceYears: z.number().min(0).max(50).optional(),
  targetRoles: z.array(z.string().trim().min(1)).optional(),
  targetCompanies: z.array(z.string().trim().min(1)).optional(),
  skills: z.array(z.string().trim().min(1)).optional(),
  location: z.string().max(100).optional(),
  githubUrl: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal(''))
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(passwordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
});
