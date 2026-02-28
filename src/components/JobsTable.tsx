import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { JOB_STATUSES, JobRecord, JobStatus } from "../lib/types";

interface Props {
  jobs: JobRecord[];
  selectedIds: string[];
  onToggleSelected: (id: string, selected: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onBulkStatus: (status: JobStatus) => void;
}

type HintPlacement = "top" | "bottom";

interface HintPosition {
  left: number;
  top: number;
  placement: HintPlacement;
}

interface DisabledHintProps {
  text?: string;
  children: ReactNode;
}

const DisabledHint = ({ text, children }: DisabledHintProps) => {
  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<HintPosition>({ left: 0, top: 0, placement: "top" });

  const hasHint = Boolean(text);

  const updatePosition = () => {
    if (!anchorRef.current) {
      return;
    }

    const rect = anchorRef.current.getBoundingClientRect();
    const placement: HintPlacement = rect.top < 64 ? "bottom" : "top";
    const nextLeft = Math.min(Math.max(rect.left + rect.width / 2, 24), window.innerWidth - 24);
    const nextTop = placement === "top" ? rect.top - 8 : rect.bottom + 8;
    setPosition({ left: nextLeft, top: nextTop, placement });
  };

  const show = () => {
    if (!hasHint) {
      return;
    }
    updatePosition();
    setVisible(true);
  };

  const hide = () => setVisible(false);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const onViewportUpdate = () => updatePosition();
    window.addEventListener("scroll", onViewportUpdate, true);
    window.addEventListener("resize", onViewportUpdate);
    return () => {
      window.removeEventListener("scroll", onViewportUpdate, true);
      window.removeEventListener("resize", onViewportUpdate);
    };
  }, [visible]);

  return (
    <>
      <span ref={anchorRef} className="hint-wrap" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
        {children}
      </span>
      {visible &&
        text &&
        createPortal(
          <div
            className={`hint-portal hint-portal-${position.placement}`}
            style={{
              left: `${position.left}px`,
              top: `${position.top}px`
            }}
            role="tooltip"
          >
            {text}
          </div>,
          document.body
        )}
    </>
  );
};

export const JobsTable = ({ jobs, selectedIds, onToggleSelected, onSelectAll, onBulkStatus }: Props) => {
  const selectedSet = new Set(selectedIds);
  const [pendingBulkStatus, setPendingBulkStatus] = useState<JobStatus | "">("");
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const selectedCount = selectedIds.length;
  const selectDisabledReason = selectedCount === 0 ? "Select at least one job to enable bulk actions." : "";
  const applyDisabledReason =
    selectedCount === 0 ? "Select at least one job to apply a status." : !pendingBulkStatus ? "Choose a status first." : "";

  const applyBulkStatus = () => {
    if (!pendingBulkStatus || selectedCount === 0) {
      return;
    }

    if (pendingBulkStatus === "Archived") {
      setShowArchiveConfirm(true);
      return;
    }

    onBulkStatus(pendingBulkStatus);
    setPendingBulkStatus("");
  };

  const confirmArchive = () => {
    if (selectedCount === 0) {
      setShowArchiveConfirm(false);
      return;
    }

    onBulkStatus("Archived");
    setPendingBulkStatus("");
    setShowArchiveConfirm(false);
  };

  return (
    <>
      <section className="table-shell" aria-label="jobs table">
        <div className="table-toolbar">
          <span className="table-count">
            {jobs.length} records {selectedCount > 0 ? `• ${selectedCount} selected` : ""}
          </span>
          <div className="bulk-actions">
            <DisabledHint text={selectDisabledReason}>
              <select
                className="bulk-select"
                value={pendingBulkStatus}
                onChange={(event) => setPendingBulkStatus(event.target.value as JobStatus | "")}
                aria-label="bulk status selection"
                disabled={selectedCount === 0}
              >
                <option value="">
                  Choose status
                </option>
                {JOB_STATUSES.map((status) => (
                  <option value={status} key={status}>
                  {status}
                </option>
              ))}
            </select>
            </DisabledHint>
            <DisabledHint text={applyDisabledReason}>
              <button className="secondary" onClick={applyBulkStatus} disabled={!pendingBulkStatus || selectedCount === 0}>
                Apply Status
              </button>
            </DisabledHint>
          </div>
        </div>

        <div className="table-content">
          <table className="jobs-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={jobs.length > 0 && selectedIds.length === jobs.length}
                    onChange={(event) => onSelectAll(event.target.checked)}
                    aria-label="select all rows"
                  />
                </th>
                <th>Company</th>
                <th>Role</th>
                <th>Status</th>
                <th>Date Added</th>
                <th>Updated</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className={job.status === "Archived" ? "row-archived" : ""}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedSet.has(job.id)}
                      onChange={(event) => onToggleSelected(job.id, event.target.checked)}
                      aria-label={`select-${job.id}`}
                    />
                  </td>
                  <td>{job.company}</td>
                  <td>{job.roleTitle}</td>
                  <td>
                    <span className={`chip chip-${job.status.toLowerCase()}`}>{job.status}</span>
                  </td>
                  <td>{job.dateAdded}</td>
                  <td>{job.updatedAt.slice(0, 10)}</td>
                  <td>
                    <Link className="table-link" to={`/job/${job.id}`}>
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mobile-cards">
            {jobs.map((job) => (
              <article key={`${job.id}-mobile`} className="mobile-card">
                <div className="mobile-card-header">
                  <h4>{job.company}</h4>
                  <p>{job.roleTitle}</p>
                </div>
                <span className={`chip chip-${job.status.toLowerCase()}`}>{job.status}</span>
                <p>Date Added: {job.dateAdded}</p>
                <div className="mobile-row">
                  <input
                    type="checkbox"
                    checked={selectedSet.has(job.id)}
                    onChange={(event) => onToggleSelected(job.id, event.target.checked)}
                  />
                  <Link className="table-link" to={`/job/${job.id}`}>
                    Open
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {showArchiveConfirm && (
        <div className="modal-backdrop" role="dialog" aria-modal={true} aria-labelledby="archive-confirm-title">
          <div className="modal confirm-modal">
            <h2 id="archive-confirm-title">Archive Selected Jobs?</h2>
            <p>Archived jobs are hidden from active tracking but remain in your local data and exports.</p>
            <div className="modal-actions">
              <button className="secondary" onClick={() => setShowArchiveConfirm(false)}>
                Cancel
              </button>
              <button className="danger" onClick={confirmArchive}>
                Archive {selectedCount} {selectedCount === 1 ? "Job" : "Jobs"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
