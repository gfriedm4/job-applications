import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { JOB_STATUSES, JobRecord, JobStatus } from "../lib/types";

interface Props {
  job: JobRecord;
  onPatch: (changes: Partial<JobRecord>) => void;
  onAddReminder: (dueDate: string, text: string) => void;
  onToggleReminder: (id: string, completed: boolean) => void;
  onAddTimelineNote: (message: string) => void;
}

export const JobDetail = ({ job, onPatch, onAddReminder, onToggleReminder, onAddTimelineNote }: Props) => {
  const [noteText, setNoteText] = useState("");
  const [reminderText, setReminderText] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [docLabel, setDocLabel] = useState("");
  const [docPath, setDocPath] = useState("");

  const submitReminder = (event: FormEvent) => {
    event.preventDefault();
    if (!reminderDate || !reminderText.trim()) {
      return;
    }

    onAddReminder(reminderDate, reminderText.trim());
    setReminderText("");
    setReminderDate("");
  };

  const addNote = () => {
    if (!noteText.trim()) {
      return;
    }

    onAddTimelineNote(noteText.trim());
    setNoteText("");
  };

  const addDocument = () => {
    if (!docLabel.trim() || !docPath.trim()) {
      return;
    }

    onPatch({
      documents: [
        {
          id: `${Date.now()}`,
          label: docLabel.trim(),
          pathOrUrl: docPath.trim()
        },
        ...job.documents
      ]
    });
    setDocLabel("");
    setDocPath("");
  };

  return (
    <div className="detail-layout">
      <header className="detail-header">
        <div className="detail-title">
          <h1>
            {job.company} - {job.roleTitle}
          </h1>
          <p className="detail-meta">
            Added {job.dateAdded} | Updated {job.updatedAt.slice(0, 10)}
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
            Source URL
            <input value={job.sourceUrl} onChange={(event) => onPatch({ sourceUrl: event.target.value })} />
          </label>
          <label>
            Notes
            <textarea rows={6} value={job.notes ?? ""} onChange={(event) => onPatch({ notes: event.target.value })} />
          </label>
        </article>

        <article className="detail-card">
          <h2>Reminders</h2>
          <form onSubmit={submitReminder} className="inline-form">
            <input type="date" value={reminderDate} onChange={(event) => setReminderDate(event.target.value)} />
            <input
              placeholder="Follow-up task"
              value={reminderText}
              onChange={(event) => setReminderText(event.target.value)}
            />
            <button type="submit">Add</button>
          </form>
          <ul className="detail-list">
            {job.reminders.map((reminder) => (
              <li key={reminder.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={reminder.completed}
                    onChange={(event) => onToggleReminder(reminder.id, event.target.checked)}
                  />
                  {reminder.dueDate}: {reminder.text}
                </label>
              </li>
            ))}
          </ul>
        </article>

        <article className="detail-card">
          <h2>Documents</h2>
          <div className="inline-form">
            <input placeholder="Label" value={docLabel} onChange={(event) => setDocLabel(event.target.value)} />
            <input
              placeholder="Path or URL"
              value={docPath}
              onChange={(event) => setDocPath(event.target.value)}
            />
            <button type="button" onClick={addDocument}>
              Add
            </button>
          </div>
          <ul className="detail-list">
            {job.documents.map((document) => (
              <li key={document.id}>
                {document.label}: {document.pathOrUrl}
              </li>
            ))}
          </ul>
        </article>

        <article className="detail-card timeline">
          <h2>Timeline</h2>
          <div className="inline-form">
            <input
              value={noteText}
              placeholder="Add timeline note"
              onChange={(event) => setNoteText(event.target.value)}
            />
            <button type="button" onClick={addNote}>
              Add Note
            </button>
          </div>
          <ul className="detail-list">
            {job.timelineEvents.map((event) => (
              <li key={event.id}>
                <strong>{event.type}</strong> - {event.message}
                <small>{new Date(event.at).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
};
