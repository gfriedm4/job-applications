import { EMPTY_STATE } from "./constants";
import { AppState, ExportPayload, JobRecord, SCHEMA_VERSION } from "./types";
import { nowIso } from "./utils";
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

const dedupeJobsById = (jobs: JobRecord[]): { jobs: JobRecord[]; warnings: string[] } => {
  const seenIncomingIds = new Set<string>();
  const deduped: JobRecord[] = [];
  const warnings: string[] = [];

  for (const incoming of jobs) {
    if (seenIncomingIds.has(incoming.id)) {
      warnings.push(`Duplicate incoming ID ignored: ${incoming.id}`);
      continue;
    }
    seenIncomingIds.add(incoming.id);
    deduped.push(incoming);
  }

  return { jobs: deduped, warnings };
};

export const readReplaceAllImport = (text: string): { payload: ExportPayload; nextState: AppState; warnings: string[] } => {
  const payload = parseImportText(text);
  const deduped = dedupeJobsById(payload.jobs);

  return {
    payload,
    warnings: deduped.warnings,
    nextState: {
      schemaVersion: SCHEMA_VERSION,
      jobs: deduped.jobs,
      uiPreferences: payload.uiPreferences
    }
  };
};

export const makeEmptyState = (): AppState => EMPTY_STATE;
