import { useMemo, useState } from "react";
import { HashRouter, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { Dashboard } from "./components/Dashboard";
import { ImportExportPanel } from "./components/ImportExportPanel";
import { JobDetail } from "./components/JobDetail";
import { JobFormModal } from "./components/JobFormModal";
import { JobsTable } from "./components/JobsTable";
import { JOB_STATUSES, JobStatus } from "./lib/types";
import { selectFilteredJobs, selectJobById } from "./lib/selectors";
import { JobDraft, StoreProvider, useStore } from "./state/store";

const HomeView = () => {
  const { state, dispatch, exportJson, readImportFile, applyImport, storageWarning } = useStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const jobs = useMemo(() => selectFilteredJobs(state), [state]);

  const toggleSelected = (id: string, selected: boolean) => {
    setSelectedIds((current) => {
      if (selected) {
        return Array.from(new Set([...current, id]));
      }
      return current.filter((value) => value !== id);
    });
  };

  const onCreate = (draft: JobDraft) => {
    dispatch({ type: "createJob", payload: draft });
    setIsCreateOpen(false);
  };

  const onSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? jobs.map((job) => job.id) : []);
  };

  const onBulkStatus = (status: JobStatus) => {
    if (selectedIds.length === 0) {
      return;
    }

    dispatch({ type: "bulkStatus", payload: { ids: selectedIds, status } });
    setSelectedIds([]);
  };

  const onLoadSeedData = () => {
    dispatch({ type: "loadSeedData" });
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="app-title">
          <p className="eyebrow">Local-Only Workflow</p>
          <h1>Job Application Tracker</h1>
          <p className="subtitle">Track applications, interviews, follow-ups, and outcomes in one private local workspace.</p>
        </div>
        <div className="header-actions">
          {state.jobs.length === 0 && (
            <button className="secondary" onClick={onLoadSeedData}>
              Load Sample Data
            </button>
          )}
          <button className="primary" onClick={() => setIsCreateOpen(true)}>
            Add Job
          </button>
        </div>
      </header>

      {storageWarning && <p className="warning">{storageWarning}</p>}

      <Dashboard jobs={state.jobs.filter((job) => job.status !== "Archived")} />

      <section className="filters-bar">
        <label>
          Search
          <input
            value={state.uiPreferences.searchText}
            onChange={(event) => dispatch({ type: "setUi", payload: { searchText: event.target.value } })}
            placeholder="Company, role, note, tag"
          />
        </label>

        <label>
          Status
          <select
            value={state.uiPreferences.statusFilter}
            onChange={(event) =>
              dispatch({
                type: "setUi",
                payload: { statusFilter: event.target.value as JobStatus | "All" }
              })
            }
          >
            <option value="All">All</option>
            {JOB_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label>
          Sort By
          <select
            value={state.uiPreferences.sortBy}
            onChange={(event) =>
              dispatch({
                type: "setUi",
                payload: { sortBy: event.target.value as typeof state.uiPreferences.sortBy }
              })
            }
          >
            <option value="updatedAt">Updated</option>
            <option value="company">Company</option>
            <option value="dateAdded">Date Added</option>
            <option value="status">Status</option>
          </select>
        </label>

        <label>
          Direction
          <select
            value={state.uiPreferences.sortDirection}
            onChange={(event) =>
              dispatch({
                type: "setUi",
                payload: { sortDirection: event.target.value as "asc" | "desc" }
              })
            }
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </label>
      </section>

      <JobsTable
        jobs={jobs}
        selectedIds={selectedIds}
        onToggleSelected={toggleSelected}
        onSelectAll={onSelectAll}
        onBulkStatus={onBulkStatus}
      />

      <ImportExportPanel onExport={exportJson} onReadImport={readImportFile} onApplyImport={applyImport} />

      <JobFormModal title="Add Job" isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSave={onCreate} />
    </main>
  );
};

const DetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useStore();

  const job = selectJobById(state, id);
  if (!job) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="app-shell detail-shell">
      <JobDetail
        job={job}
        onPatch={(changes) => dispatch({ type: "updateJob", payload: { id: job.id, changes } })}
        onAddReminder={(dueDate, text) => dispatch({ type: "addReminder", payload: { id: job.id, reminder: { dueDate, text, completed: false } } })}
        onToggleReminder={(reminderId, completed) =>
          dispatch({ type: "toggleReminder", payload: { jobId: job.id, reminderId, completed } })
        }
        onAddTimelineNote={(message) => dispatch({ type: "addTimelineNote", payload: { id: job.id, message } })}
      />
      <button className="floating-back" onClick={() => navigate("/")}>
        Back
      </button>
    </main>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/job/:id" element={<DetailView />} />
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
}
