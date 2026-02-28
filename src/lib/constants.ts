import { AppState, SCHEMA_VERSION } from "./types";

export const STORAGE_KEY = "jobTracker.v1.state";

export const DEFAULT_UI_PREFERENCES: AppState["uiPreferences"] = {
  statusFilter: "All",
  searchText: "",
  sortBy: "updatedAt",
  sortDirection: "desc"
};

export const EMPTY_STATE: AppState = {
  schemaVersion: SCHEMA_VERSION,
  jobs: [],
  uiPreferences: DEFAULT_UI_PREFERENCES
};
