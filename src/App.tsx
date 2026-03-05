import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { HashRouter, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { JobFormModal } from "./components/JobFormModal";
import { AiSettings, loadAiSettings, saveAiSettings } from "./lib/aiSettings";
import { EMPTY_STATE } from "./lib/constants";
import { buildExportFilename } from "./lib/importExport";
import { JOB_STATUSES, JobStatus } from "./lib/types";
import { selectFilteredJobs, selectJobById } from "./lib/selectors";
import { JobDraft, StoreProvider, useStore } from "./state/store";

interface AddJobMenuProps {
  onEnterManually: () => void;
  onPasteJobDescription: () => void;
}

const applyTheme = (darkMode: boolean) => {
  document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
};

const Dashboard = lazy(() => import("./components/Dashboard").then((module) => ({ default: module.Dashboard })));
const EmptyDashboardWalkthrough = lazy(() =>
  import("./components/EmptyDashboardWalkthrough").then((module) => ({ default: module.EmptyDashboardWalkthrough }))
);
const JobsTable = lazy(() => import("./components/JobsTable").then((module) => ({ default: module.JobsTable })));
const JobDetail = lazy(() => import("./components/JobDetail").then((module) => ({ default: module.JobDetail })));
const PasteJobDescriptionModal = lazy(() =>
  import("./components/PasteJobDescriptionModal").then((module) => ({ default: module.PasteJobDescriptionModal }))
);
const SettingsModal = lazy(() => import("./components/SettingsModal").then((module) => ({ default: module.SettingsModal })));

const AddJobMenu = ({ onEnterManually, onPasteJobDescription }: AddJobMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onDocumentPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocumentPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onDocumentPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [isOpen]);

  const pick = (handler: () => void) => {
    handler();
    setIsOpen(false);
  };

  return (
    <div className="add-job-menu" ref={rootRef}>
      <button
        className="primary"
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
      >
        Add Job
      </button>
      {isOpen && (
        <div className="add-job-menu-panel" role="menu" aria-label="add job options">
          <button className="menu-item" type="button" role="menuitem" onClick={() => pick(onPasteJobDescription)}>
            Paste Job Description
          </button>
          <button className="menu-item" type="button" role="menuitem" onClick={() => pick(onEnterManually)}>
            Enter Manually
          </button>
        </div>
      )}
    </div>
  );
};

const HomeView = () => {
  const { state, dispatch, exportJson, readImportFile, applyImport, storageWarning, clearPendingImport } = useStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [initialDraft, setInitialDraft] = useState<JobDraft | undefined>(undefined);
  const [isPasteOpen, setIsPasteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AiSettings>(() => loadAiSettings());

  const jobs = useMemo(() => selectFilteredJobs(state), [state]);
  const isEmpty = state.jobs.length === 0;
  const hasOpenAiKey = Boolean(settings.openAiApiKey.trim());

  useEffect(() => {
    applyTheme(settings.darkMode);
  }, [settings.darkMode]);

  const onCreate = (draft: JobDraft) => {
    dispatch({ type: "createJob", payload: draft });
    setIsCreateOpen(false);
    setInitialDraft(undefined);
  };

  const openManualCreate = () => {
    setInitialDraft(undefined);
    setIsCreateOpen(true);
  };

  const onSettingsSave = (nextSettings: AiSettings) => {
    saveAiSettings(nextSettings);
    setSettings(nextSettings);
    setIsSettingsOpen(false);
  };

  const exportJobs = () => {
    const json = exportJson();
    const anchor = document.createElement("a");
    const blob = new Blob([json], { type: "application/json" });
    const canUseBlobUrl = typeof URL.createObjectURL === "function";
    const url = canUseBlobUrl ? URL.createObjectURL(blob) : `data:application/json;charset=utf-8,${encodeURIComponent(json)}`;

    anchor.href = url;
    anchor.download = buildExportFilename();
    anchor.click();
    if (canUseBlobUrl && typeof URL.revokeObjectURL === "function") {
      URL.revokeObjectURL(url);
    }
  };

  const onClearDashboardData = () => {
    dispatch({ type: "replaceState", payload: EMPTY_STATE });
    clearPendingImport();
    setIsSettingsOpen(false);
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
          <button className="secondary" onClick={() => setIsSettingsOpen(true)}>
            Settings
          </button>
          {state.jobs.length > 0 && (
            <button className="secondary" onClick={exportJobs}>
              Export JSON
            </button>
          )}
          {hasOpenAiKey ? (
            <AddJobMenu onEnterManually={openManualCreate} onPasteJobDescription={() => setIsPasteOpen(true)} />
          ) : (
            <button className="primary" onClick={openManualCreate}>
              Add Job
            </button>
          )}
        </div>
      </header>

      {storageWarning && <p className="warning">{storageWarning}</p>}

      {isEmpty ? (
        <Suspense fallback={null}>
          <EmptyDashboardWalkthrough
            hasOpenAiKey={hasOpenAiKey}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onAddJob={openManualCreate}
            onPasteJobDescription={() => setIsPasteOpen(true)}
          />
        </Suspense>
      ) : (
        <>
          <Suspense fallback={null}>
            <Dashboard jobs={state.jobs.filter((job) => job.status !== "Archived")} />
          </Suspense>

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

          <Suspense fallback={null}>
            <JobsTable jobs={jobs} />
          </Suspense>
        </>
      )}

      {isPasteOpen && (
        <Suspense fallback={null}>
          <PasteJobDescriptionModal
            isOpen={isPasteOpen}
            apiKey={settings.openAiApiKey}
            model={settings.openAiModel}
            onClose={() => setIsPasteOpen(false)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onEnterManually={() => {
              setIsPasteOpen(false);
              openManualCreate();
            }}
            onDraftReady={(draft) => {
              setInitialDraft(draft);
              setIsPasteOpen(false);
              setIsCreateOpen(true);
            }}
          />
        </Suspense>
      )}

      {isSettingsOpen && (
        <Suspense fallback={null}>
          <SettingsModal
            isOpen={isSettingsOpen}
            initial={settings}
            onClose={() => setIsSettingsOpen(false)}
            onSave={onSettingsSave}
            canExport={state.jobs.length > 0}
            onExport={exportJson}
            onReadImport={readImportFile}
            onApplyImport={applyImport}
            onClearDashboardData={onClearDashboardData}
          />
        </Suspense>
      )}

      {isCreateOpen && (
        <JobFormModal
          title="Add Job"
          isOpen={isCreateOpen}
          initial={initialDraft}
          onClose={() => {
            setIsCreateOpen(false);
            setInitialDraft(undefined);
          }}
          onSave={onCreate}
        />
      )}
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
      <Suspense fallback={null}>
        <JobDetail
          job={job}
          onPatch={(changes) => dispatch({ type: "updateJob", payload: { id: job.id, changes } })}
          onAddTimelineNote={(message) => dispatch({ type: "addTimelineNote", payload: { id: job.id, message } })}
        />
      </Suspense>
      <button className="floating-back" onClick={() => navigate("/")}>
        Back
      </button>
    </main>
  );
};

export default function App() {
  useEffect(() => {
    applyTheme(loadAiSettings().darkMode);
  }, []);

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
