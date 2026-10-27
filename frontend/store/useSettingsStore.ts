import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  geminiApiKey: string;
  openaiApiKey: string;
  ttsVoice: string;
  ttsSpeed: number;
  ttsPitch: number;
  autoPlayTTS: boolean;
  webcamDefaultOn: boolean;
  hapticOrSoundEnabled: boolean;
  setGeminiApiKey: (key: string) => void;
  setOpenaiApiKey: (key: string) => void;
  setTtsSpeed: (speed: number) => void;
  setTtsPitch: (pitch: number) => void;
  setAutoPlayTTS: (enabled: boolean) => void;
  setWebcamDefaultOn: (enabled: boolean) => void;
  clearKeys: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      geminiApiKey: '',
      openaiApiKey: '',
      ttsVoice: 'en-US',
      ttsSpeed: 1.0,
      ttsPitch: 1.0,
      autoPlayTTS: true,
      webcamDefaultOn: true,
      hapticOrSoundEnabled: true,

      setGeminiApiKey: (key) => set({ geminiApiKey: key }),
      setOpenaiApiKey: (key) => set({ openaiApiKey: key }),
      setTtsSpeed: (speed) => set({ ttsSpeed: speed }),
      setTtsPitch: (pitch) => set({ ttsPitch: pitch }),
      setAutoPlayTTS: (enabled) => set({ autoPlayTTS: enabled }),
      setWebcamDefaultOn: (enabled) => set({ webcamDefaultOn: enabled }),
      clearKeys: () => set({ geminiApiKey: '', openaiApiKey: '' }),
    }),
    {
      name: 'preppulse-settings-storage',
    }
  )
);
