import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { EMPTY_STATE, STORAGE_KEY } from "../lib/constants";
import { AppState, ConflictItem, JobRecord, JobStatus, Reminder, TimelineEvent, UIPreferences } from "../lib/types";
import { applyConflictResolutions, readImportPreview, serializeExport } from "../lib/importExport";
import { createSeedJobs } from "../lib/seedData";
import { createId, debounce, nowIso } from "../lib/utils";
import { migratePayloadToCurrent, validateJob } from "../lib/schema";

export interface JobDraft {
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

type AppAction =
  | { type: "createJob"; payload: JobDraft }
  | { type: "updateJob"; payload: { id: string; changes: Partial<JobRecord> } }
  | { type: "bulkStatus"; payload: { ids: string[]; status: JobStatus } }
  | { type: "archiveJobs"; payload: { ids: string[] } }
  | { type: "addReminder"; payload: { id: string; reminder: Omit<Reminder, "id" | "createdAt"> } }
  | { type: "toggleReminder"; payload: { jobId: string; reminderId: string; completed: boolean } }
  | { type: "addTimelineNote"; payload: { id: string; message: string } }
  | { type: "loadSeedData" }
  | { type: "setUi"; payload: Partial<UIPreferences> }
  | { type: "replaceState"; payload: AppState };

interface ImportPreviewState {
  conflicts: ConflictItem[];
  warnings: string[];
  inserts: number;
}

interface StoreContextValue {
  state: AppState;
  storageWarning: string | null;
  dispatch: React.Dispatch<AppAction>;
  exportJson: () => string;
  readImportFile: (file: File) => Promise<ImportPreviewState>;
  applyImport: (resolutions: Record<string, NonNullable<ConflictItem["resolution"]>>) => void;
  hasPendingImport: boolean;
  clearPendingImport: () => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

const loadState = (): { state: AppState; warning: string | null } => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { state: EMPTY_STATE, warning: null };
  }

  try {
    const parsed = JSON.parse(raw) as AppState;
    const migrated = migratePayloadToCurrent({
      schemaVersion: parsed.schemaVersion,
      exportedAt: nowIso(),
      appMeta: { appName: "local", appVersion: "local" },
      jobs: parsed.jobs,
      uiPreferences: parsed.uiPreferences
    });

    const validJobs = migrated.jobs.filter(validateJob);
    return {
      state: {
        schemaVersion: migrated.schemaVersion,
        jobs: validJobs,
        uiPreferences: migrated.uiPreferences
      },
      warning: validJobs.length !== migrated.jobs.length ? "Some invalid records were skipped during load." : null
    };
  } catch {
    return {
      state: EMPTY_STATE,
      warning: "Stored data was corrupted and has been reset to an empty state."
    };
  }
};

const makeTimelineEvent = (type: TimelineEvent["type"], message: string): TimelineEvent => ({
  id: createId(),
  type,
  at: nowIso(),
  message
});

const reducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "createJob": {
      const now = nowIso();
      const job: JobRecord = {
        id: createId(),
        ...action.payload,
        tags: action.payload.tags,
        documents: [],
        reminders: [],
        timelineEvents: [makeTimelineEvent("created", `Job created with status ${action.payload.status}`)],
        createdAt: now,
        updatedAt: now
      };

      return { ...state, jobs: [job, ...state.jobs] };
    }

    case "updateJob": {
      return {
        ...state,
        jobs: state.jobs.map((job) => {
          if (job.id !== action.payload.id) {
            return job;
          }

          const nextStatus = action.payload.changes.status;
          const timelineEvents = [...job.timelineEvents];
          if (nextStatus && nextStatus !== job.status) {
            timelineEvents.unshift(makeTimelineEvent("statusChanged", `${job.status} -> ${nextStatus}`));
          }

          return {
            ...job,
            ...action.payload.changes,
            timelineEvents,
            updatedAt: nowIso()
          };
        })
      };
    }

    case "bulkStatus": {
      const ids = new Set(action.payload.ids);
      return {
        ...state,
        jobs: state.jobs.map((job) => {
          if (!ids.has(job.id)) {
            return job;
          }

          const timelineEvents = [...job.timelineEvents];
          if (job.status !== action.payload.status) {
            timelineEvents.unshift(
              makeTimelineEvent("statusChanged", `Bulk update: ${job.status} -> ${action.payload.status}`)
            );
          }

          return {
            ...job,
            status: action.payload.status,
            timelineEvents,
            updatedAt: nowIso()
          };
        })
      };
    }

    case "archiveJobs": {
      const ids = new Set(action.payload.ids);
      return {
        ...state,
        jobs: state.jobs.map((job) => {
          if (!ids.has(job.id) || job.status === "Archived") {
            return job;
          }

          return {
            ...job,
            status: "Archived",
            timelineEvents: [makeTimelineEvent("statusChanged", `${job.status} -> Archived`), ...job.timelineEvents],
            updatedAt: nowIso()
          };
        })
      };
    }

    case "addReminder": {
      return {
        ...state,
        jobs: state.jobs.map((job) => {
          if (job.id !== action.payload.id) {
            return job;
          }

          const reminder: Reminder = {
            id: createId(),
            createdAt: nowIso(),
            ...action.payload.reminder
          };

          return {
            ...job,
            reminders: [reminder, ...job.reminders],
            timelineEvents: [makeTimelineEvent("updated", `Reminder added: ${reminder.text}`), ...job.timelineEvents],
            updatedAt: nowIso()
          };
        })
      };
    }

    case "toggleReminder": {
      return {
        ...state,
        jobs: state.jobs.map((job) => {
          if (job.id !== action.payload.jobId) {
            return job;
          }

          return {
            ...job,
            reminders: job.reminders.map((reminder) =>
              reminder.id === action.payload.reminderId ? { ...reminder, completed: action.payload.completed } : reminder
            ),
            updatedAt: nowIso()
          };
        })
      };
    }

    case "addTimelineNote": {
      return {
        ...state,
        jobs: state.jobs.map((job) => {
          if (job.id !== action.payload.id) {
            return job;
          }

          return {
            ...job,
            timelineEvents: [makeTimelineEvent("noteAdded", action.payload.message), ...job.timelineEvents],
            updatedAt: nowIso()
          };
        })
      };
    }

    case "loadSeedData": {
      if (state.jobs.length > 0) {
        return state;
      }

      return {
        ...state,
        jobs: createSeedJobs()
      };
    }

    case "setUi": {
      return {
        ...state,
        uiPreferences: {
          ...state.uiPreferences,
          ...action.payload
        }
      };
    }

    case "replaceState": {
      return action.payload;
    }

    default:
      return state;
  }
};

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const loaded = useMemo(loadState, []);
  const [state, dispatch] = useReducer(reducer, loaded.state);
  const [storageWarning] = useState<string | null>(loaded.warning);
  const [pendingImport, setPendingImport] = useState<{
    conflicts: ConflictItem[];
    warnings: string[];
    inserts: number;
    apply: (resolutions: Record<string, NonNullable<ConflictItem["resolution"]>>) => void;
  } | null>(null);

  useEffect(() => {
    const save = debounce((nextState: AppState) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      } catch (error) {
        console.error("Failed to save state", error);
      }
    }, 200);

    save(state);
  }, [state]);

  const exportJson = (): string => serializeExport(state);

  const readImportFile = async (file: File): Promise<ImportPreviewState> => {
    const text = await file.text();
    const { preview } = readImportPreview(state, text);

    setPendingImport({
      conflicts: preview.conflicts,
      warnings: preview.warnings,
      inserts: preview.toInsert.length,
      apply: (resolutions) => {
        const nextState = applyConflictResolutions(state, preview, resolutions);
        dispatch({ type: "replaceState", payload: nextState });
      }
    });

    return {
      conflicts: preview.conflicts,
      warnings: preview.warnings,
      inserts: preview.toInsert.length
    };
  };

  const applyImport = (resolutions: Record<string, NonNullable<ConflictItem["resolution"]>>) => {
    if (!pendingImport) {
      return;
    }

    pendingImport.apply(resolutions);
    setPendingImport(null);
  };

  const clearPendingImport = () => setPendingImport(null);

  return (
    <StoreContext.Provider
      value={{
        state,
        dispatch,
        storageWarning,
        exportJson,
        readImportFile,
        applyImport,
        hasPendingImport: Boolean(pendingImport),
        clearPendingImport
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextValue => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within StoreProvider");
  }

  return context;
};
