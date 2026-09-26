import { useEffect, useRef, useState, useCallback } from 'react';
import { api } from '../api/client';
import { ProctoringEventType } from '@interviewpilot/shared';

interface UseProctoringOptions {
  sessionId?: string;
  enabled?: boolean;
  onWarning?: (message: string) => void;
}

export function useProctoring({ sessionId, enabled = true, onWarning }: UseProctoringOptions) {
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [pasteCount, setPasteCount] = useState(0);
  const [isWindowFocused, setIsWindowFocused] = useState(true);

  const blurTimestampRef = useRef<number | null>(null);

  const sendEvent = useCallback(
    async (eventType: ProctoringEventType, severity: 'low' | 'medium' | 'high', metadata?: Record<string, any>) => {
      if (!sessionId || !enabled) return;
      try {
        await api.post(`/interviews/${sessionId}/proctoring/events`, {
          eventType,
          severity,
          metadata
        });
      } catch {
        // Silently fail network drop for telemetry
      }
    },
    [sessionId, enabled]
  );

  useEffect(() => {
    if (!enabled || !sessionId) return;

    const handleBlur = () => {
      setIsWindowFocused(false);
      blurTimestampRef.current = Date.now();
      setTabSwitchCount((prev) => {
        const next = prev + 1;
        if (next > 2 && onWarning) {
          onWarning(`Window focus lost (${next} times). Active interview sessions monitor window switches.`);
        }
        return next;
      });

      sendEvent(ProctoringEventType.TAB_BLUR, 'medium', {
        eventTime: new Date().toISOString()
      });
    };

    const handleFocus = () => {
      setIsWindowFocused(true);
      const durationMs = blurTimestampRef.current ? Date.now() - blurTimestampRef.current : 0;
      blurTimestampRef.current = null;

      sendEvent(ProctoringEventType.TAB_FOCUS, 'low', {
        blurDurationMs: durationMs
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleBlur();
      } else {
        handleFocus();
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      const pastedText = e.clipboardData?.getData('text') || '';
      const charCount = pastedText.length;

      setPasteCount((prev) => prev + 1);

      const severity = charCount > 200 ? 'high' : charCount > 50 ? 'medium' : 'low';
      if (charCount > 300 && onWarning) {
        onWarning('Large code paste detected. Remember to explain your reasoning in the interview.');
      }

      sendEvent(ProctoringEventType.CLIPBOARD_PASTE, severity, {
        charCount,
        hasNewlines: pastedText.includes('\n')
      });
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('paste', handlePaste);
    };
  }, [sessionId, enabled, sendEvent, onWarning]);

  return {
    tabSwitchCount,
    pasteCount,
    isWindowFocused
  };
}
