import { describe, expect, it } from "vitest";
import { buildExportPayload, readReplaceAllImport } from "../../src/lib/importExport";
import { AppState, SCHEMA_VERSION } from "../../src/lib/types";

const makeState = (): AppState => ({
  schemaVersion: SCHEMA_VERSION,
  uiPreferences: {
    statusFilter: "All",
    searchText: "",
    sortBy: "updatedAt",
    sortDirection: "desc"
  },
  jobs: [
    {
      id: "1",
      company: "Acme",
      roleTitle: "Frontend",
      dateAdded: "2026-02-10",
      status: "Applied",
      tags: [],
      timelineEvents: [],
      createdAt: "2026-02-10T00:00:00.000Z",
      updatedAt: "2026-02-10T00:00:00.000Z"
    }
  ]
});

describe("import/export merge", () => {
  it("replaces state from import payload", () => {
    const exported = buildExportPayload({
      ...makeState(),
      jobs: [{ ...makeState().jobs[0], id: "2", company: "Beta" }]
    });

    const read = readReplaceAllImport(JSON.stringify(exported));
    expect(read.nextState.jobs).toHaveLength(1);
    expect(read.nextState.jobs[0].company).toBe("Beta");
  });

  it("drops duplicate IDs from imported payload with warning", () => {
    const duplicate = makeState().jobs[0];
    const exported = buildExportPayload({
      ...makeState(),
      jobs: [duplicate, { ...duplicate, company: "Ignored Duplicate" }]
    });

    const read = readReplaceAllImport(JSON.stringify(exported));
    expect(read.nextState.jobs).toHaveLength(1);
    expect(read.warnings).toHaveLength(1);
  });

  it("accepts legacy documents field but removes it from next state", () => {
    const exported = {
      ...buildExportPayload(makeState()),
      jobs: [{ ...makeState().jobs[0], documents: [{ id: "doc-1", label: "Resume", pathOrUrl: "https://example.com" }] }]
    };

    const read = readReplaceAllImport(JSON.stringify(exported));
    expect(read.nextState.jobs).toHaveLength(1);
    expect("documents" in (read.nextState.jobs[0] as unknown as Record<string, unknown>)).toBe(false);
  });
});
