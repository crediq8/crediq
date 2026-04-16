const DEFAULT_API_BASE = "http://localhost:8000";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || DEFAULT_API_BASE;

export type VoiceOrchestrationResult = {
  status: string;
  language: "en" | "hi";
  intent: string;
  command: string;
  data: {
    amount_in_rupees?: number | null;
    years?: number | null;
    rate?: number | null;
  };
  spoken_response: string;
  ui_response: string;
};

export const apiJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`API ${path} failed (${response.status}): ${message}`);
  }

  return response.json() as Promise<T>;
};

export const transcribeAudio = async (audioBlob: Blob, fileName = "voice.webm") => {
  const form = new FormData();
  form.append("audio", audioBlob, fileName);

  const response = await fetch(`${API_BASE_URL}/voice/stt`, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`STT failed (${response.status}): ${message}`);
  }

  return response.json() as Promise<{ status: string; transcript: string }>;
};

export const orchestrateVoice = async (
  transcript: string,
  uiLanguage: "en" | "hi",
): Promise<VoiceOrchestrationResult> => {
  return apiJson<VoiceOrchestrationResult>("/voice/orchestrate", {
    method: "POST",
    body: JSON.stringify({ transcript, ui_language: uiLanguage }),
  });
};

export const getTtsAudio = async (text: string, language: "en" | "hi") => {
  const response = await fetch(`${API_BASE_URL}/voice/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`TTS failed (${response.status}): ${message}`);
  }

  return response.blob();
};
