import { DEFAULT_OPENAI_MODEL } from "./ai";

export const AI_SETTINGS_STORAGE_KEY = "jobTracker.v1.aiSettings";

export interface AiSettings {
  openAiApiKey: string;
  openAiModel: string;
}

export const DEFAULT_AI_SETTINGS: AiSettings = {
  openAiApiKey: "",
  openAiModel: DEFAULT_OPENAI_MODEL
};

const readValue = (value: unknown, fallback: string): string => {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed || fallback;
};

export const loadAiSettings = (): AiSettings => {
  const raw = localStorage.getItem(AI_SETTINGS_STORAGE_KEY);
  if (!raw) {
    return DEFAULT_AI_SETTINGS;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AiSettings>;
    return {
      openAiApiKey: typeof parsed.openAiApiKey === "string" ? parsed.openAiApiKey : "",
      openAiModel: readValue(parsed.openAiModel, DEFAULT_OPENAI_MODEL)
    };
  } catch {
    return DEFAULT_AI_SETTINGS;
  }
};

export const saveAiSettings = (settings: AiSettings): void => {
  localStorage.setItem(
    AI_SETTINGS_STORAGE_KEY,
    JSON.stringify({
      openAiApiKey: settings.openAiApiKey,
      openAiModel: settings.openAiModel
    })
  );
};
