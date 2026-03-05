import { describe, expect, it } from "vitest";
import { migratePayloadToCurrent, validateExportPayload } from "../../src/lib/schema";
import { ExportPayload, SCHEMA_VERSION } from "../../src/lib/types";

const validPayload: ExportPayload = {
  schemaVersion: SCHEMA_VERSION,
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

  it("accepts legacy payloads that still include documents", () => {
    const legacyPayload = {
      ...validPayload,
      jobs: [{ ...validPayload.jobs[0], documents: [] }]
    };
    expect(validateExportPayload(legacyPayload)).toBe(true);
  });

  it("rejects invalid payload", () => {
    expect(validateExportPayload({ foo: "bar" })).toBe(false);
  });

  it("migrates payload to current schema", () => {
    const migrated = migratePayloadToCurrent(validPayload);
    expect(migrated.schemaVersion).toBe(SCHEMA_VERSION);
    expect(migrated.jobs[0].tags).toEqual([]);
  });

  it("drops legacy documents during migration", () => {
    const legacyPayload = {
      ...validPayload,
      jobs: [{ ...validPayload.jobs[0], documents: [{ id: "1", label: "Resume", pathOrUrl: "https://example.com" }] }]
    } as unknown as ExportPayload;

    const migrated = migratePayloadToCurrent(legacyPayload);
    expect("documents" in (migrated.jobs[0] as unknown as Record<string, unknown>)).toBe(false);
  });

  it("drops legacy reminders during migration", () => {
    const legacyPayload = {
      ...validPayload,
      schemaVersion: 1,
      jobs: [
        {
          ...validPayload.jobs[0],
          reminders: [{ id: "r1", dueDate: "2026-03-01", text: "Follow up", completed: false, createdAt: "2026-03-01T00:00:00.000Z" }]
        }
      ]
    } as unknown as ExportPayload;

    const migrated = migratePayloadToCurrent(legacyPayload);
    expect("reminders" in (migrated.jobs[0] as unknown as Record<string, unknown>)).toBe(false);
  });
});
