import { FormEvent, useEffect, useState } from "react";
import { JOB_STATUSES, JobStatus } from "../lib/types";
import { JobDraft } from "../state/store";
import { todayDate } from "../lib/utils";

interface Props {
  isOpen: boolean;
  initial?: JobDraft;
  title: string;
  onClose: () => void;
  onSave: (draft: JobDraft) => void;
}

const emptyDraft = (): JobDraft => ({
  company: "",
  roleTitle: "",
  sourceUrl: "",
  dateAdded: todayDate(),
  status: "Wishlist",
  tags: []
});

const urlPattern = /^https?:\/\//i;

export const JobFormModal = ({ isOpen, initial, title, onClose, onSave }: Props) => {
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<JobDraft>(initial ?? emptyDraft());

  useEffect(() => {
    setDraft(initial ?? emptyDraft());
  }, [initial, isOpen]);

  if (!isOpen) {
    return null;
  }

  const submit = (event: FormEvent) => {
    event.preventDefault();

    if (!draft.company.trim() || !draft.roleTitle.trim() || !draft.sourceUrl.trim() || !draft.dateAdded || !draft.status) {
      setError("Company, role title, source URL, date added, and status are required.");
      return;
    }

    if (!urlPattern.test(draft.sourceUrl)) {
      setError("Source URL must start with http:// or https://");
      return;
    }

    onSave({
      ...draft,
      company: draft.company.trim(),
      roleTitle: draft.roleTitle.trim(),
      sourceUrl: draft.sourceUrl.trim(),
      tags: draft.tags
    });
    setError(null);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal>
      <form className="modal" onSubmit={submit}>
        <header className="modal-header">
          <h2>{title}</h2>
          <button className="secondary" type="button" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="form-grid">
          <label>
            Company *
            <input
              value={draft.company}
              onChange={(event) => setDraft((value) => ({ ...value, company: event.target.value }))}
            />
          </label>

          <label>
            Role Title *
            <input
              value={draft.roleTitle}
              onChange={(event) => setDraft((value) => ({ ...value, roleTitle: event.target.value }))}
            />
          </label>

          <label>
            Source URL *
            <input
              value={draft.sourceUrl}
              onChange={(event) => setDraft((value) => ({ ...value, sourceUrl: event.target.value }))}
              placeholder="https://..."
            />
          </label>

          <label>
            Date Added *
            <input
              type="date"
              value={draft.dateAdded}
              onChange={(event) => setDraft((value) => ({ ...value, dateAdded: event.target.value }))}
            />
          </label>

          <label>
            Status *
            <select
              value={draft.status}
              onChange={(event) => setDraft((value) => ({ ...value, status: event.target.value as JobStatus }))}
            >
              {JOB_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label>
            Location
            <input
              value={draft.location ?? ""}
              onChange={(event) => setDraft((value) => ({ ...value, location: event.target.value }))}
            />
          </label>

          <label>
            Salary
            <input
              value={draft.salaryText ?? ""}
              onChange={(event) => setDraft((value) => ({ ...value, salaryText: event.target.value }))}
            />
          </label>

          <label>
            Source Type
            <input
              value={draft.sourceType ?? ""}
              onChange={(event) => setDraft((value) => ({ ...value, sourceType: event.target.value }))}
              placeholder="LinkedIn, Referral, Company site"
            />
          </label>

          <label className="span-2">
            Tags (comma separated)
            <input
              value={draft.tags.join(", ")}
              onChange={(event) =>
                setDraft((value) => ({
                  ...value,
                  tags: event.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
                }))
              }
            />
          </label>

          <label className="span-2">
            Notes
            <textarea
              rows={5}
              value={draft.notes ?? ""}
              onChange={(event) => setDraft((value) => ({ ...value, notes: event.target.value }))}
            />
          </label>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="modal-actions">
          <button className="primary" type="submit">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};
