import { EMPTY_STATE } from "./constants";
import {
  AppState,
  ConflictItem,
  ExportPayload,
  ImportPreviewResult,
  JobRecord,
  SCHEMA_VERSION
} from "./types";
import { createId, nowIso } from "./utils";
import { migratePayloadToCurrent, validateExportPayload } from "./schema";

const APP_META = {
  appName: "Job Application Tracker",
  appVersion: "1.0.0"
};

export const buildExportPayload = (state: AppState): ExportPayload => ({
  schemaVersion: SCHEMA_VERSION,
  exportedAt: nowIso(),
  appMeta: APP_META,
  jobs: state.jobs,
  uiPreferences: state.uiPreferences
});

export const serializeExport = (state: AppState): string => {
  return JSON.stringify(buildExportPayload(state), null, 2);
};

export const buildExportFilename = (iso = nowIso()): string => {
  const datePart = iso.slice(0, 10);
  return `job-tracker-export-${datePart}.json`;
};

export const parseImportText = (text: string): ExportPayload => {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("Import file is not valid JSON.");
  }

  if (!validateExportPayload(raw)) {
    throw new Error("Import JSON does not match expected export schema.");
  }

  return migratePayloadToCurrent(raw);
};

export const detectImportConflicts = (
  currentJobs: JobRecord[],
  incomingJobs: JobRecord[]
): ImportPreviewResult => {
  const byId = new Map(currentJobs.map((job) => [job.id, job]));
  const seenIncomingIds = new Set<string>();
  const conflicts: ConflictItem[] = [];
  const toInsert: JobRecord[] = [];
  const warnings: string[] = [];

  for (const incoming of incomingJobs) {
    if (seenIncomingIds.has(incoming.id)) {
      warnings.push(`Duplicate incoming ID ignored: ${incoming.id}`);
      continue;
    }
    seenIncomingIds.add(incoming.id);

    const existing = byId.get(incoming.id);
    if (!existing) {
      toInsert.push(incoming);
      continue;
    }

    conflicts.push({ existing, incoming, resolution: undefined });
  }

  return { toInsert, conflicts, warnings };
};

export const applyConflictResolutions = (
  currentState: AppState,
  preview: ImportPreviewResult,
  resolutions: Record<string, NonNullable<ConflictItem["resolution"]>>
): AppState => {
  const jobsById = new Map(currentState.jobs.map((job) => [job.id, job]));

  for (const incoming of preview.toInsert) {
    jobsById.set(incoming.id, incoming);
  }

  for (const conflict of preview.conflicts) {
    const incoming = conflict.incoming;
    const resolution = resolutions[incoming.id] ?? "keepExisting";

    if (resolution === "keepExisting") {
      continue;
    }

    if (resolution === "keepIncoming") {
      jobsById.set(incoming.id, incoming);
      continue;
    }

    if (resolution === "keepBoth") {
      jobsById.set(incoming.id, incoming);
      const duplicated: JobRecord = {
        ...incoming,
        id: createId(),
        createdAt: nowIso(),
        updatedAt: nowIso()
      };
      jobsById.set(duplicated.id, duplicated);
    }
  }

  return {
    ...currentState,
    schemaVersion: SCHEMA_VERSION,
    jobs: Array.from(jobsById.values())
  };
};

export const readImportPreview = (
  currentState: AppState,
  text: string
): { payload: ExportPayload; preview: ImportPreviewResult } => {
  const payload = parseImportText(text);
  const preview = detectImportConflicts(currentState.jobs, payload.jobs);
  return { payload, preview };
};

export const makeEmptyState = (): AppState => EMPTY_STATE;
