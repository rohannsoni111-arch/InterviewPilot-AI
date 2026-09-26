import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Briefcase, 
  MapPin, 
  Globe, 
  Plus, 
  X, 
  Save, 
  ShieldCheck, 
  Code2, 
  Building2 
} from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);
  const [location, setLocation] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [newRole, setNewRole] = useState('');

  const [targetCompanies, setTargetCompanies] = useState<string[]>([]);
  const [newCompany, setNewCompany] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setHeadline(user.profile?.headline || '');
      setBio(user.profile?.bio || '');
      setExperienceYears(user.profile?.experienceYears || 0);
      setLocation(user.profile?.location || '');
      setGithubUrl(user.profile?.githubUrl || '');
      setLinkedinUrl(user.profile?.linkedinUrl || '');
      setSkills(user.profile?.skills || []);
      setTargetRoles(user.profile?.targetRoles || []);
      setTargetCompanies(user.profile?.targetCompanies || []);
    }
  }, [user]);

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleAddRole = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = newRole.trim();
    if (trimmed && !targetRoles.includes(trimmed)) {
      setTargetRoles([...targetRoles, trimmed]);
      setNewRole('');
    }
  };

  const handleRemoveRole = (roleToRemove: string) => {
    setTargetRoles(targetRoles.filter(r => r !== roleToRemove));
  };

  const handleAddCompany = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = newCompany.trim();
    if (trimmed && !targetCompanies.includes(trimmed)) {
      setTargetCompanies([...targetCompanies, trimmed]);
      setNewCompany('');
    }
  };

  const handleRemoveCompany = (companyToRemove: string) => {
    setTargetCompanies(targetCompanies.filter(c => c !== companyToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name,
        headline,
        bio,
        experienceYears,
        location,
        githubUrl,
        linkedinUrl,
        skills,
        targetRoles,
        targetCompanies
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <User className="w-5 h-5 text-brand-500" />
            Candidate Profile
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure your professional background to tailor interview questions and difficulty.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full uppercase font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {user.role}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Info */}
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            General Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Professional Headline
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Years of Experience
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={experienceYears}
                onChange={(e) => setExperienceYears(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Professional Summary / Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief summary of your architectural focus, core domain expertise, and engineering interests..."
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Location</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="San Francisco, CA"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-slate-400" /> GitHub URL</span>
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-slate-400" /> LinkedIn URL</span>
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Technical Skills & Target Roles */}
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 space-y-6">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-brand-500" />
            Skills & Target Alignment
          </h2>

          {/* Skills */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Technical Skills (e.g. Distributed Systems, PostgreSQL, Python)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={handleAddSkill}
                placeholder="Type a skill and press Enter or Add"
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-medium inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
              {skills.map(skill => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-900"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-brand-900 dark:hover:text-brand-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {skills.length === 0 && (
                <span className="text-xs text-slate-400 italic">No skills added yet.</span>
              )}
            </div>
          </div>

          {/* Target Roles */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              Target Roles (e.g. Senior Software Engineer, Staff Architect)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                onKeyDown={handleAddRole}
                placeholder="Type a role and press Enter"
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={handleAddRole}
                className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-medium inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
              {targetRoles.map(roleItem => (
                <span
                  key={roleItem}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  {roleItem}
                  <button
                    type="button"
                    onClick={() => handleRemoveRole(roleItem)}
                    className="hover:text-slate-950 dark:hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {targetRoles.length === 0 && (
                <span className="text-xs text-slate-400 italic">No target roles configured.</span>
              )}
            </div>
          </div>

          {/* Target Companies */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              Target Companies (e.g. Google, Stripe, Meta, OpenAI)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                onKeyDown={handleAddCompany}
                placeholder="Type a company and press Enter"
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={handleAddCompany}
                className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-medium inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
              {targetCompanies.map(comp => (
                <span
                  key={comp}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  {comp}
                  <button
                    type="button"
                    onClick={() => handleRemoveCompany(comp)}
                    className="hover:text-slate-950 dark:hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {targetCompanies.length === 0 && (
                <span className="text-xs text-slate-400 italic">No target companies specified.</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
