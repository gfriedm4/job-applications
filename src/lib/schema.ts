import { JOB_STATUSES, JobRecord, ExportPayload, SCHEMA_VERSION } from "./types";

const statusSet = new Set<string>(JOB_STATUSES);

const hasRequiredJobFields = (job: Partial<JobRecord>): boolean => {
  return Boolean(job.id && job.company && job.roleTitle && job.dateAdded && job.status && statusSet.has(job.status));
};

export const validateJob = (input: unknown): input is JobRecord => {
  if (!input || typeof input !== "object") {
    return false;
  }

  const job = input as Partial<JobRecord>;
  if (!hasRequiredJobFields(job)) {
    return false;
  }

  return Array.isArray(job.tags) && Array.isArray(job.documents) && Array.isArray(job.reminders) && Array.isArray(job.timelineEvents);
};

export const validateExportPayload = (input: unknown): input is ExportPayload => {
  if (!input || typeof input !== "object") {
    return false;
  }

  const payload = input as Partial<ExportPayload>;
  if (
    typeof payload.schemaVersion !== "number" ||
    payload.schemaVersion < 1 ||
    !Array.isArray(payload.jobs) ||
    typeof payload.exportedAt !== "string"
  ) {
    return false;
  }

  return payload.jobs.every(validateJob);
};

export const migratePayloadToCurrent = (payload: ExportPayload): ExportPayload => {
  if (payload.schemaVersion > SCHEMA_VERSION) {
    throw new Error(`Unsupported schemaVersion ${payload.schemaVersion}. Current: ${SCHEMA_VERSION}`);
  }

  return {
    ...payload,
    schemaVersion: SCHEMA_VERSION,
    jobs: payload.jobs.map((job) => ({
      id: job.id,
      company: job.company,
      roleTitle: job.roleTitle,
      dateAdded: job.dateAdded,
      status: job.status,
      location: job.location,
      salaryText: job.salaryText,
      notes: typeof job.notes === "string" && job.notes.trim() ? job.notes.trim() : undefined,
      sourceType: job.sourceType,
      tags: Array.isArray(job.tags) ? job.tags : [],
      documents: Array.isArray(job.documents) ? job.documents : [],
      reminders: Array.isArray(job.reminders) ? job.reminders : [],
      timelineEvents: Array.isArray(job.timelineEvents) ? job.timelineEvents : [],
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    }))
  };
};
