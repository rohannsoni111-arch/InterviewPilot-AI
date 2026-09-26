import axios, { AxiosInstance } from 'axios';
import {
  IVoiceProfile,
  ITTSRequest,
  ITTSResponse,
  ISTTRequest,
  ISTTResponse,
  ApiResponse,
  IQuestionBankItem,
  IQuestionFilter,
  IInterviewSession,
  IVerifiedReportBadge,
  IPublicVerifiedReport,
} from '@interviewpilot/shared';

interface ExtendedAxiosInstance extends AxiosInstance {
  getVoiceProfiles?: () => Promise<ApiResponse<IVoiceProfile[]>>;
  synthesizeSpeech?: (params: ITTSRequest) => Promise<ApiResponse<ITTSResponse>>;
  transcribeSpeech?: (params: ISTTRequest) => Promise<ApiResponse<ISTTResponse>>;
  getQuestions?: (filter?: IQuestionFilter) => Promise<ApiResponse<IQuestionBankItem[]>>;
  getQuestionById?: (id: string) => Promise<ApiResponse<IQuestionBankItem>>;
  launchQuestionInterview?: (id: string) => Promise<ApiResponse<IInterviewSession>>;
  getVerificationBadge?: (interviewId: string) => Promise<ApiResponse<IVerifiedReportBadge>>;
  getPublicVerifiedReport?: (badgeId: string) => Promise<ApiResponse<IPublicVerifiedReport>>;
}

export const api: ExtendedAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach helper methods
api.getVoiceProfiles = async (): Promise<ApiResponse<IVoiceProfile[]>> => {
  const res = await api.get('/speech/voices');
  return res.data;
};

api.synthesizeSpeech = async (params: ITTSRequest): Promise<ApiResponse<ITTSResponse>> => {
  const res = await api.post('/speech/tts', params);
  return res.data;
};

api.transcribeSpeech = async (params: ISTTRequest): Promise<ApiResponse<ISTTResponse>> => {
  const res = await api.post('/speech/stt', params);
  return res.data;
};

api.getQuestions = async (filter?: IQuestionFilter): Promise<ApiResponse<IQuestionBankItem[]>> => {
  const res = await api.get('/questions', { params: filter });
  return res.data;
};

api.getQuestionById = async (id: string): Promise<ApiResponse<IQuestionBankItem>> => {
  const res = await api.get(`/questions/${id}`);
  return res.data;
};

api.launchQuestionInterview = async (id: string): Promise<ApiResponse<IInterviewSession>> => {
  const res = await api.post(`/questions/${id}/launch`);
  return res.data;
};

api.getVerificationBadge = async (interviewId: string): Promise<ApiResponse<IVerifiedReportBadge>> => {
  const res = await api.post(`/interviews/${interviewId}/verify-badge`);
  return res.data;
};

api.getPublicVerifiedReport = async (badgeId: string): Promise<ApiResponse<IPublicVerifiedReport>> => {
  const res = await api.get(`/verify/${badgeId}`);
  return res.data;
};
