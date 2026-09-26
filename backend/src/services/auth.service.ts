import { User } from '../models/User';
import { hashPassword, comparePassword } from '../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  ACCESS_TOKEN_EXPIRY_SECONDS,
  TokenPayload
} from '../utils/jwt';
import { RegisterDto, LoginDto, AuthResponse, UserRole } from '@interviewpilot/shared';
import { AppError } from '../utils/errors';

export class AuthService {
  public static async register(data: RegisterDto): Promise<AuthResponse> {
    const existing = await User.findOne({ email: data.email.toLowerCase().trim() });
    if (existing) {
      throw new AppError('An account with this email address already exists', 409, 'EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await hashPassword(data.password);
    const user = new User({
      email: data.email.toLowerCase().trim(),
      passwordHash,
      name: data.name.trim(),
      role: data.role || UserRole.CANDIDATE,
      profile: {
        headline: '',
        bio: '',
        experienceYears: 0,
        targetRoles: [],
        targetCompanies: [],
        skills: [],
        location: '',
        githubUrl: '',
        linkedinUrl: ''
      }
    });

    const payload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role as UserRole
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    user.refreshTokens.push(refreshToken);
    await user.save();

    return {
      user: user.toSafeObject(),
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS
      }
    };
  }

  public static async login(data: LoginDto): Promise<AuthResponse> {
    const user = await User.findOne({ email: data.email.toLowerCase().trim() });
    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact support.', 403, 'ACCOUNT_DEACTIVATED');
    }

    const isMatch = await comparePassword(data.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const payload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role as UserRole
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    if (user.refreshTokens.length >= 10) {
      user.refreshTokens.shift();
    }
    user.refreshTokens.push(refreshToken);
    await user.save();

    return {
      user: user.toSafeObject(),
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS
      }
    };
  }

  public static async refreshToken(token: string): Promise<AuthResponse> {
    const payload = verifyRefreshToken(token);
    if (!payload) {
      throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    const user = await User.findById(payload.userId);
    if (!user || !user.isActive) {
      throw new AppError('User not found or account deactivated', 401, 'USER_NOT_FOUND');
    }

    const tokenIndex = user.refreshTokens.indexOf(token);
    if (tokenIndex === -1) {
      user.refreshTokens = [];
      await user.save();
      throw new AppError('Refresh token revoked or reused', 401, 'REVOKED_REFRESH_TOKEN');
    }

    const newPayload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role as UserRole
    };

    const newAccessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    user.refreshTokens[tokenIndex] = newRefreshToken;
    await user.save();

    return {
      user: user.toSafeObject(),
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS
      }
    };
  }

  public static async logout(userId: string, token: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: token }
    });
  }

  public static async logoutAll(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $set: { refreshTokens: [] }
    });
  }
}
