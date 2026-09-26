import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import { UserRole } from '@interviewpilot/shared';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  jti?: string;
}

export const ACCESS_TOKEN_EXPIRY = '15m';
export const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60;
export const REFRESH_TOKEN_EXPIRY = '7d';

export function generateAccessToken(payload: Omit<TokenPayload, 'jti'>): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY
  });
}

export function generateRefreshToken(payload: Omit<TokenPayload, 'jti'>): string {
  const tokenPayload: TokenPayload = {
    ...payload,
    jti: crypto.randomUUID()
  };
  return jwt.sign(tokenPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY
  });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
