import { describe, expect, it } from "vitest";
import { applyConflictResolutions, detectImportConflicts } from "../../src/lib/importExport";
import { AppState } from "../../src/lib/types";

const makeState = (): AppState => ({
  schemaVersion: 1,
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
      sourceUrl: "https://acme.com",
      dateAdded: "2026-02-10",
      status: "Applied",
      tags: [],
      documents: [],
      reminders: [],
      timelineEvents: [],
      createdAt: "2026-02-10T00:00:00.000Z",
      updatedAt: "2026-02-10T00:00:00.000Z"
    }
  ]
});

describe("import/export merge", () => {
  it("splits inserts and conflicts by id", () => {
    const preview = detectImportConflicts(makeState().jobs, [
      { ...makeState().jobs[0], company: "Acme 2" },
      {
        ...makeState().jobs[0],
        id: "2",
        company: "Beta"
      }
    ]);

    expect(preview.conflicts).toHaveLength(1);
    expect(preview.toInsert).toHaveLength(1);
  });

  it("applies keepIncoming resolution", () => {
    const state = makeState();
    const incoming = [{ ...state.jobs[0], company: "Updated Co" }];
    const preview = detectImportConflicts(state.jobs, incoming);

    const next = applyConflictResolutions(state, preview, { "1": "keepIncoming" });
    expect(next.jobs[0].company).toBe("Updated Co");
  });
});
