import { JOB_STATUSES, JobStatus } from "./types";
import { todayDate } from "./utils";

export const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";

export interface ExtractedJobDraft {
  company: string;
  roleTitle: string;
  dateAdded: string;
  status: JobStatus;
  location?: string;
  salaryText?: string;
  notes?: string;
  tags: string[];
  sourceType?: string;
}

interface OpenAiChoice {
  message?: {
    content?: string | null;
  };
}

interface OpenAiChatCompletionResponse {
  choices?: OpenAiChoice[];
  error?: {
    message?: string;
  };
}

const STATUS_ALIASES: Record<string, JobStatus> = {
  wishlist: "Wishlist",
  interested: "Wishlist",
  applied: "Applied",
  submitted: "Applied",
  interview: "Interview",
  interviewing: "Interview",
  offer: "Offer",
  offered: "Offer",
  rejected: "Rejected",
  declined: "Rejected",
  archived: "Archived",
  archive: "Archived"
};

const asNonEmptyString = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const toTags = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const deduped = new Set<string>();
  for (const item of value) {
    if (typeof item !== "string") {
      continue;
    }

    const cleaned = item.trim();
    if (!cleaned) {
      continue;
    }

    deduped.add(cleaned);
    if (deduped.size >= 12) {
      break;
    }
  }

  return Array.from(deduped);
};

const toStatus = (value: unknown): JobStatus => {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!normalized) {
    return "Wishlist";
  }

  const alias = STATUS_ALIASES[normalized];
  if (alias) {
    return alias;
  }

  const directMatch = JOB_STATUSES.find((status) => status.toLowerCase() === normalized);
  return directMatch ?? "Wishlist";
};

const parseResponseObject = (content: string): Record<string, unknown> => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Model response was not valid JSON.");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Model response did not contain a JSON object.");
  }

  return parsed as Record<string, unknown>;
};

const pickField = (data: Record<string, unknown>, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = asNonEmptyString(data[key]);
    if (value) {
      return value;
    }
  }

  return undefined;
};

export const extractJobDraftFromDescription = async (args: {
  apiKey: string;
  jobDescription: string;
  model?: string;
}): Promise<ExtractedJobDraft> => {
  const apiKey = args.apiKey.trim();
  if (!apiKey) {
    throw new Error("OpenAI API key is required.");
  }

  const jobDescription = args.jobDescription.trim();
  if (jobDescription.length < 40) {
    throw new Error("Paste a longer job description so the model has enough context.");
  }

  const model = args.model?.trim() || DEFAULT_OPENAI_MODEL;
  let response: Response;

  try {
    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Extract structured fields from a job posting. Return only JSON with keys: company, roleTitle, location, salaryText, notes, tags, sourceType, status. Keep values concise. tags must be an array of short strings. status must be one of Wishlist, Applied, Interview, Offer, Rejected, Archived. Use empty strings or empty arrays when unknown."
          },
          {
            role: "user",
            content: jobDescription
          }
        ]
      })
    });
  } catch {
    throw new Error("Could not reach OpenAI. Check your internet connection and try again.");
  }

  let payload: OpenAiChatCompletionResponse;
  try {
    payload = (await response.json()) as OpenAiChatCompletionResponse;
  } catch {
    throw new Error("OpenAI returned an unreadable response.");
  }

  if (!response.ok) {
    const message = payload.error?.message ?? `Request failed with status ${response.status}.`;
    throw new Error(message);
  }

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI response did not include draft content.");
  }

  const data = parseResponseObject(content);

  return {
    company: pickField(data, ["company", "employer", "organization"]) ?? "",
    roleTitle: pickField(data, ["roleTitle", "role", "title", "position"]) ?? "",
    dateAdded: todayDate(),
    status: toStatus(data.status),
    location: pickField(data, ["location"]),
    salaryText: pickField(data, ["salaryText", "salary", "compensation"]),
    notes: pickField(data, ["notes", "summary"]),
    tags: toTags(data.tags),
    sourceType: pickField(data, ["sourceType", "source"])
  };
};
