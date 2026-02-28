import { AppState, JobRecord } from "./types";

const compareText = (a: string, b: string): number => a.localeCompare(b, undefined, { sensitivity: "base" });

export const selectFilteredJobs = (state: AppState): JobRecord[] => {
  const { statusFilter, searchText, sortBy, sortDirection } = state.uiPreferences;
  const query = searchText.trim().toLowerCase();

  const filtered = state.jobs.filter((job) => {
    if (statusFilter !== "All" && job.status !== statusFilter) {
      return false;
    }

    if (!query) {
      return true;
    }

    return [job.company, job.roleTitle, job.notes ?? "", job.tags.join(" ")].join(" ").toLowerCase().includes(query);
  });

  filtered.sort((a, b) => {
    const dir = sortDirection === "asc" ? 1 : -1;

    if (sortBy === "company") {
      return compareText(a.company, b.company) * dir;
    }

    if (sortBy === "status") {
      return compareText(a.status, b.status) * dir;
    }

    return compareText(a[sortBy], b[sortBy]) * dir;
  });

  return filtered;
};

export const selectJobById = (state: AppState, id: string | undefined): JobRecord | undefined => {
  if (!id) {
    return undefined;
  }

  return state.jobs.find((job) => job.id === id);
};
