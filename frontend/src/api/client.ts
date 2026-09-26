import axios, { AxiosInstance } from 'axios';
import {
  IVoiceProfile,
  ITTSRequest,
  ITTSResponse,
  ISTTRequest,
  ISTTResponse,
  ApiResponse,
} from '@interviewpilot/shared';

interface ExtendedAxiosInstance extends AxiosInstance {
  getVoiceProfiles?: () => Promise<ApiResponse<IVoiceProfile[]>>;
  synthesizeSpeech?: (params: ITTSRequest) => Promise<ApiResponse<ITTSResponse>>;
  transcribeSpeech?: (params: ISTTRequest) => Promise<ApiResponse<ISTTResponse>>;
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
