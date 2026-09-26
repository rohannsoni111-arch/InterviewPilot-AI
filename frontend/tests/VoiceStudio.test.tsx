import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AudioVisualizer } from '../src/components/AudioVisualizer/AudioVisualizer';
import { VoiceStudioModal } from '../src/components/VoiceStudioModal';
import { IAudioSettings, IVoiceStudioSettings } from '@interviewpilot/shared';

describe('Voice Studio & Audio Visualizer Components', () => {
  const mockAudioSettings: IAudioSettings = {
    ttsEnabled: true,
    speechRate: 1.0,
    speechPitch: 1.0,
    sttLanguage: 'en-US',
    autoReadResponse: true,
  };

  const mockVoiceSettings: IVoiceStudioSettings = {
    enabled: true,
    voiceId: 'alex-architect',
    autoPlayTTS: true,
    speechRate: 1.1,
    interimTranscription: true,
  };

  it('renders AudioVisualizer with active examiner persona and animated waveforms', () => {
    const handleSettingsChange = vi.fn();
    const handleOpenStudio = vi.fn();
    const handleReplay = vi.fn();

    render(
      <AudioVisualizer
        isListening={false}
        isSpeaking={false}
        audioSettings={mockAudioSettings}
        onSettingsChange={handleSettingsChange}
        voiceStudioSettings={mockVoiceSettings}
        onOpenVoiceStudio={handleOpenStudio}
        onReplayLastExaminerVoice={handleReplay}
      />
    );

    // Verify Examiner persona badge
    expect(screen.getByText(/Alex Rivera \(Staff Architect\)/i)).toBeInTheDocument();

    // Verify Voice Studio button
    const studioBtn = screen.getByTitle('Open Voice Studio Settings');
    expect(studioBtn).toBeInTheDocument();
    fireEvent.click(studioBtn);
    expect(handleOpenStudio).toHaveBeenCalledTimes(1);

    // Verify Replay button
    const replayBtn = screen.getByTitle('Replay Examiner Voice');
    expect(replayBtn).toBeInTheDocument();
    fireEvent.click(replayBtn);
    expect(handleReplay).toHaveBeenCalledTimes(1);
  });

  it('renders active listening and speaking states dynamically in AudioVisualizer', () => {
    const handleSettingsChange = vi.fn();

    const { rerender } = render(
      <AudioVisualizer
        isListening={true}
        isSpeaking={false}
        audioSettings={mockAudioSettings}
        onSettingsChange={handleSettingsChange}
      />
    );

    expect(screen.getByText('Mic Active')).toBeInTheDocument();

    rerender(
      <AudioVisualizer
        isListening={false}
        isSpeaking={true}
        audioSettings={mockAudioSettings}
        onSettingsChange={handleSettingsChange}
      />
    );

    expect(screen.getByText('AI Speaking')).toBeInTheDocument();
  });

  it('renders VoiceStudioModal with all 4 examiner personas and applies configurations', async () => {
    const handleClose = vi.fn();
    const handleSave = vi.fn();

    render(
      <VoiceStudioModal
        isOpen={true}
        onClose={handleClose}
        settings={mockVoiceSettings}
        onSaveSettings={handleSave}
      />
    );

    // Check modal headers and personas
    expect(screen.getByText('AI Examiner Voice Studio')).toBeInTheDocument();
    expect(screen.getByText('Sarah Blake')).toBeInTheDocument();
    expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
    expect(screen.getByText('Elena Rostova')).toBeInTheDocument();
    expect(screen.getByText('Marcus Vance')).toBeInTheDocument();

    // Select Elena Rostova
    const elenaCard = screen.getByText('Elena Rostova').closest('div');
    if (elenaCard) {
      fireEvent.click(elenaCard);
    }

    // Toggle interim transcription checkbox
    const interimCheckbox = screen.getByLabelText(/Real-Time Interim Transcription/i);
    expect(interimCheckbox).toBeInTheDocument();

    // Apply voice settings
    const saveBtn = screen.getByText('Apply Voice Settings');
    fireEvent.click(saveBtn);

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        voiceId: 'elena-supportive',
      })
    );
    expect(handleClose).toHaveBeenCalled();
  });
});
