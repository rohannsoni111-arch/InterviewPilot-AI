import { User } from '../models/User';
import { hashPassword, comparePassword } from '../utils/password';
import { UpdateProfileDto, ChangePasswordDto, IUser } from '@interviewpilot/shared';
import { AppError } from '../utils/errors';

export class UserService {
  public static async getProfile(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    return user.toSafeObject();
  }

  public static async updateProfile(userId: string, data: UpdateProfileDto): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (data.name) user.name = data.name.trim();

    user.profile = {
      headline: data.headline !== undefined ? data.headline : user.profile?.headline || '',
      bio: data.bio !== undefined ? data.bio : user.profile?.bio || '',
      experienceYears: data.experienceYears !== undefined ? data.experienceYears : user.profile?.experienceYears || 0,
      targetRoles: data.targetRoles !== undefined ? data.targetRoles : user.profile?.targetRoles || [],
      targetCompanies: data.targetCompanies !== undefined ? data.targetCompanies : user.profile?.targetCompanies || [],
      skills: data.skills !== undefined ? data.skills : user.profile?.skills || [],
      location: data.location !== undefined ? data.location : user.profile?.location || '',
      githubUrl: data.githubUrl !== undefined ? data.githubUrl : user.profile?.githubUrl || '',
      linkedinUrl: data.linkedinUrl !== undefined ? data.linkedinUrl : user.profile?.linkedinUrl || ''
    };

    await user.save();
    return user.toSafeObject();
  }

  public static async changePassword(userId: string, data: ChangePasswordDto): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const isMatch = await comparePassword(data.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Current password does not match', 400, 'INVALID_CURRENT_PASSWORD');
    }

    user.passwordHash = await hashPassword(data.newPassword);
    user.refreshTokens = [];
    await user.save();
  }

  public static async listUsers(page: number = 1, limit: number = 20): Promise<{ users: IUser[]; total: number }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments()
    ]);

    return {
      users: users.map(u => u.toSafeObject()),
      total
    };
  }
}
