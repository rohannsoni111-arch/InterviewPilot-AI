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
  IPeerRoom,
  ICreatePeerRoomRequest,
  ISubmitPeerEvaluationRequest,
  PeerRole,
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
  createPeerRoom?: (params: ICreatePeerRoomRequest) => Promise<ApiResponse<IPeerRoom>>;
  getPeerRoom?: (roomCode: string) => Promise<ApiResponse<IPeerRoom>>;
  joinPeerRoom?: (roomCode: string, params?: { preferredRole?: PeerRole; userId?: string; userName?: string }) => Promise<ApiResponse<IPeerRoom>>;
  switchPeerRole?: (roomCode: string, role: PeerRole) => Promise<ApiResponse<IPeerRoom>>;
  syncPeerCode?: (roomCode: string, params: { code: string; language?: string }) => Promise<ApiResponse<IPeerRoom>>;
  updatePeerNotes?: (roomCode: string, params: { evaluatorNotes?: string; dimensionRatings?: Record<string, number> }) => Promise<ApiResponse<IPeerRoom>>;
  submitPeerEvaluation?: (roomCode: string, params: Omit<ISubmitPeerEvaluationRequest, 'roomCode'>) => Promise<ApiResponse<IPeerRoom>>;
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

api.createPeerRoom = async (params: ICreatePeerRoomRequest): Promise<ApiResponse<IPeerRoom>> => {
  const res = await api.post('/peer-rooms', params);
  return res.data;
};

api.getPeerRoom = async (roomCode: string): Promise<ApiResponse<IPeerRoom>> => {
  const res = await api.get(`/peer-rooms/${roomCode}`);
  return res.data;
};

api.joinPeerRoom = async (roomCode: string, params?: { preferredRole?: PeerRole; userId?: string; userName?: string }): Promise<ApiResponse<IPeerRoom>> => {
  const res = await api.post(`/peer-rooms/${roomCode}/join`, params || {});
  return res.data;
};

api.switchPeerRole = async (roomCode: string, role: PeerRole): Promise<ApiResponse<IPeerRoom>> => {
  const res = await api.post(`/peer-rooms/${roomCode}/role`, { role });
  return res.data;
};

api.syncPeerCode = async (roomCode: string, params: { code: string; language?: string }): Promise<ApiResponse<IPeerRoom>> => {
  const res = await api.post(`/peer-rooms/${roomCode}/sync-code`, params);
  return res.data;
};

api.updatePeerNotes = async (roomCode: string, params: { evaluatorNotes?: string; dimensionRatings?: Record<string, number> }): Promise<ApiResponse<IPeerRoom>> => {
  const res = await api.post(`/peer-rooms/${roomCode}/notes`, params);
  return res.data;
};

api.submitPeerEvaluation = async (roomCode: string, params: Omit<ISubmitPeerEvaluationRequest, 'roomCode'>): Promise<ApiResponse<IPeerRoom>> => {
  const res = await api.post(`/peer-rooms/${roomCode}/evaluate`, params);
  return res.data;
};
