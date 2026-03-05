import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { JOB_STATUSES, JobRecord, JobStatus, TimelineEventType } from "../lib/types";

interface Props {
  job: JobRecord;
  onPatch: (changes: Partial<JobRecord>) => void;
  onAddTimelineNote: (message: string) => void;
}

const formatTimestamp = (value: string) =>
  new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

const timelineTypeLabel: Record<TimelineEventType, string> = {
  created: "Created",
  statusChanged: "Status Changed",
  noteAdded: "Note Added",
  updated: "Updated"
};

const relativeFormatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

const formatRelativeTime = (value: string) => {
  const time = new Date(value);
  const diffMs = time.getTime() - Date.now();
  const absMs = Math.abs(diffMs);
  if (absMs < 3_600_000) {
    return relativeFormatter.format(Math.round(diffMs / 60_000), "minute");
  }
  if (absMs < 86_400_000) {
    return relativeFormatter.format(Math.round(diffMs / 3_600_000), "hour");
  }
  return relativeFormatter.format(Math.round(diffMs / 86_400_000), "day");
};


export const JobDetail = ({ job, onPatch, onAddTimelineNote }: Props) => {
  const [noteText, setNoteText] = useState("");
  const timelineNotes = job.timelineEvents.filter((event) => event.type === "noteAdded").length;

  const submitTimelineNote = (event: FormEvent) => {
    event.preventDefault();
    if (!noteText.trim()) {
      return;
    }

    onAddTimelineNote(noteText.trim());
    setNoteText("");
  };

  return (
    <div className="detail-layout">
      <header className="detail-header">
        <div className="detail-title">
          <h1>
            {job.company} - {job.roleTitle}
          </h1>
          <p className="detail-meta">
            Added {job.dateAdded} | Last updated {job.updatedAt.slice(0, 10)}
          </p>
        </div>
        <Link className="table-link" to="/">
          Back to list
        </Link>
      </header>

      <section className="detail-grid">
        <article className="detail-card">
          <h2>Core Info</h2>
          <label>
            Status
            <select value={job.status} onChange={(event) => onPatch({ status: event.target.value as JobStatus })}>
              {JOB_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label>
            Company
            <input value={job.company} onChange={(event) => onPatch({ company: event.target.value })} />
          </label>
          <label>
            Role Title
            <input value={job.roleTitle} onChange={(event) => onPatch({ roleTitle: event.target.value })} />
          </label>
          <label>
            Notes
            <textarea rows={6} value={job.notes ?? ""} onChange={(event) => onPatch({ notes: event.target.value })} />
          </label>
        </article>

        <article className="detail-card detail-card--timeline">
          <div className="section-heading">
            <div className="section-title-block">
              <h2>Timeline</h2>
              <p className="section-subtitle">Capture decisions with context so updates are always explainable.</p>
            </div>
            <div className="section-stats">
              <span className="section-count">{job.timelineEvents.length}</span>
              <span className="stat-chip">{timelineNotes} notes</span>
            </div>
          </div>
          <form className="inline-form timeline-form section-composer" onSubmit={submitTimelineNote}>
            <input
              value={noteText}
              placeholder="What changed, and why?"
              onChange={(event) => setNoteText(event.target.value)}
            />
            <button type="submit" className="primary" disabled={!noteText.trim()}>
              Log Note
            </button>
          </form>
          <p className="composer-hint">Record intent and outcome, not only the action.</p>
          {job.timelineEvents.length === 0 ? (
            <p className="empty-state">No timeline events yet. Log changes so the decision trail stays clear.</p>
          ) : (
            <ul className="detail-list timeline-list">
              {job.timelineEvents.map((event) => (
                <li key={event.id} className={`timeline-item timeline-item--${event.type}`}>
                  <div className="timeline-meta">
                    <span className={`event-chip event-chip--${event.type}`}>{timelineTypeLabel[event.type]}</span>
                    <div className="timeline-date-group">
                      <time dateTime={event.at}>{formatTimestamp(event.at)}</time>
                      <small>{formatRelativeTime(event.at)}</small>
                    </div>
                  </div>
                  <p className="timeline-message">{event.message}</p>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </div>
  );
};
