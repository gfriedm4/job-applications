import { describe, expect, it } from "vitest";
import { calculateFunnelMetrics } from "../../src/lib/analytics";
import { JobRecord } from "../../src/lib/types";

const sampleJobs: JobRecord[] = [
  {
    id: "1",
    company: "A",
    roleTitle: "R1",
    dateAdded: "2026-01-01",
    status: "Applied",
    tags: [],
    reminders: [{ id: "r1", dueDate: "2099-01-01", text: "future", completed: false, createdAt: "2026-01-01T00:00:00.000Z" }],
    timelineEvents: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "2",
    company: "B",
    roleTitle: "R2",
    dateAdded: "2026-01-01",
    status: "Interview",
    tags: [],
    reminders: [{ id: "r2", dueDate: "2000-01-01", text: "old", completed: false, createdAt: "2026-01-01T00:00:00.000Z" }],
    timelineEvents: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "3",
    company: "C",
    roleTitle: "R3",
    dateAdded: "2026-01-01",
    status: "Offer",
    tags: [],
    reminders: [],
    timelineEvents: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  }
];

describe("analytics", () => {
  it("computes funnel metrics", () => {
    const metrics = calculateFunnelMetrics(sampleJobs);
    expect(metrics.countsByStatus.Applied).toBe(1);
    expect(metrics.countsByStatus.Interview).toBe(1);
    expect(metrics.countsByStatus.Offer).toBe(1);
  });
});
