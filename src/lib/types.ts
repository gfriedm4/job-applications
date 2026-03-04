export const SCHEMA_VERSION = 1;

export const JOB_STATUSES = [
  "Wishlist",
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
  "Archived"
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export type TimelineEventType = "created" | "statusChanged" | "noteAdded" | "updated";

export interface Reminder {
  id: string;
  dueDate: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  at: string;
  message: string;
}

export interface JobRecord {
  id: string;
  company: string;
  roleTitle: string;
  dateAdded: string;
  status: JobStatus;
  location?: string;
  salaryText?: string;
  notes?: string;
  tags: string[];
  sourceType?: string;
  reminders: Reminder[];
  timelineEvents: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface UIPreferences {
  statusFilter: JobStatus | "All";
  searchText: string;
  sortBy: "updatedAt" | "company" | "dateAdded" | "status";
  sortDirection: "asc" | "desc";
}

export interface AppState {
  schemaVersion: number;
  jobs: JobRecord[];
  uiPreferences: UIPreferences;
}

export interface ExportPayload {
  schemaVersion: number;
  exportedAt: string;
  appMeta: {
    appName: string;
    appVersion: string;
  };
  jobs: JobRecord[];
  uiPreferences: UIPreferences;
}
