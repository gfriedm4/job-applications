import { describe, expect, it } from "vitest";
import { migratePayloadToCurrent, validateExportPayload } from "../../src/lib/schema";
import { ExportPayload, SCHEMA_VERSION } from "../../src/lib/types";

const validPayload: ExportPayload = {
  schemaVersion: 1,
  exportedAt: "2026-02-27T00:00:00.000Z",
  appMeta: { appName: "x", appVersion: "y" },
  jobs: [
    {
      id: "a",
      company: "Acme",
      roleTitle: "Engineer",
      dateAdded: "2026-02-20",
      status: "Applied",
      tags: [],
      documents: [],
      reminders: [],
      timelineEvents: [],
      createdAt: "2026-02-20T00:00:00.000Z",
      updatedAt: "2026-02-20T00:00:00.000Z"
    }
  ],
  uiPreferences: {
    statusFilter: "All",
    searchText: "",
    sortBy: "updatedAt",
    sortDirection: "desc"
  }
};

describe("schema", () => {
  it("accepts valid export payload", () => {
    expect(validateExportPayload(validPayload)).toBe(true);
  });

  it("rejects invalid payload", () => {
    expect(validateExportPayload({ foo: "bar" })).toBe(false);
  });

  it("migrates payload to current schema", () => {
    const migrated = migratePayloadToCurrent(validPayload);
    expect(migrated.schemaVersion).toBe(SCHEMA_VERSION);
    expect(migrated.jobs[0].tags).toEqual([]);
  });
});
