import { DEFAULT_OPENAI_MODEL } from "./ai";

export const AI_SETTINGS_STORAGE_KEY = "jobTracker.v1.aiSettings";

export interface AiSettings {
  openAiApiKey: string;
  openAiModel: string;
  darkMode: boolean;
}

export const DEFAULT_AI_SETTINGS: AiSettings = {
  openAiApiKey: "",
  openAiModel: DEFAULT_OPENAI_MODEL,
  darkMode: false
};

const readValue = (value: unknown, fallback: string): string => {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed || fallback;
};

const readBoolean = (value: unknown, fallback: boolean): boolean => {
  if (typeof value !== "boolean") {
    return fallback;
  }

  return value;
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
      openAiModel: readValue(parsed.openAiModel, DEFAULT_OPENAI_MODEL),
      darkMode: readBoolean(parsed.darkMode, DEFAULT_AI_SETTINGS.darkMode)
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
      openAiModel: settings.openAiModel,
      darkMode: settings.darkMode
    })
  );
};
