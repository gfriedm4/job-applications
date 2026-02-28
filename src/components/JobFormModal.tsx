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
  dateAdded: todayDate(),
  status: "Wishlist",
  tags: []
});

const trimOptional = (value?: string): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export const JobFormModal = ({ isOpen, initial, title, onClose, onSave }: Props) => {
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [draft, setDraft] = useState<JobDraft>(initial ?? emptyDraft());

  useEffect(() => {
    setDraft(initial ?? emptyDraft());
    setStep(1);
    setError(null);
  }, [initial, isOpen]);

  if (!isOpen) {
    return null;
  }

  const validateRequiredStep = (): string | null => {
    if (!draft.company.trim() || !draft.roleTitle.trim() || !draft.dateAdded || !draft.status) {
      return "Company, role title, date added, and status are required.";
    }

    return null;
  };

  const patchDraft = (changes: Partial<JobDraft>) => {
    setDraft((value) => ({ ...value, ...changes }));
    if (error) {
      setError(null);
    }
  };

  const continueToOptionalStep = () => {
    const validationError = validateRequiredStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setStep(2);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();

    if (step === 1) {
      continueToOptionalStep();
      return;
    }

    const validationError = validateRequiredStep();
    if (validationError) {
      setStep(1);
      setError(validationError);
      return;
    }

    onSave({
      ...draft,
      company: draft.company.trim(),
      roleTitle: draft.roleTitle.trim(),
      location: trimOptional(draft.location),
      salaryText: trimOptional(draft.salaryText),
      sourceType: trimOptional(draft.sourceType),
      notes: trimOptional(draft.notes),
      tags: draft.tags.map((tag) => tag.trim()).filter(Boolean)
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

        <div className="form-stepper" aria-live="polite">
          <p className="step-count">Step {step} of 2</p>
          <ol className="step-list" aria-hidden>
            <li className={step === 1 ? "active" : "complete"}>Required details</li>
            <li className={step === 2 ? "active" : ""}>Optional details</li>
          </ol>
          <p className="step-hint">
            {step === 1
              ? "Enter the essentials first so you can quickly save the job."
              : "Add optional context like notes or salary, or leave anything blank."}
          </p>
        </div>

        {step === 1 ? (
          <div className="form-grid">
            <label>
              Company *
              <input value={draft.company} onChange={(event) => patchDraft({ company: event.target.value })} required />
            </label>

            <label>
              Role Title *
              <input value={draft.roleTitle} onChange={(event) => patchDraft({ roleTitle: event.target.value })} required />
            </label>

            <label>
              Date Added *
              <input
                type="date"
                value={draft.dateAdded}
                onChange={(event) => patchDraft({ dateAdded: event.target.value })}
                required
              />
            </label>

            <label>
              Status *
              <select value={draft.status} onChange={(event) => patchDraft({ status: event.target.value as JobStatus })}>
                {JOB_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : (
          <div className="form-grid">
            <label>
              Location
              <input value={draft.location ?? ""} onChange={(event) => patchDraft({ location: event.target.value })} />
            </label>

            <label>
              Salary
              <input value={draft.salaryText ?? ""} onChange={(event) => patchDraft({ salaryText: event.target.value })} />
            </label>

            <label className="span-2">
              Source Type
              <input
                value={draft.sourceType ?? ""}
                onChange={(event) => patchDraft({ sourceType: event.target.value })}
                placeholder="LinkedIn, Referral, Company site"
              />
            </label>

            <label className="span-2">
              Tags (comma separated)
              <input
                value={draft.tags.join(", ")}
                onChange={(event) =>
                  patchDraft({
                    tags: event.target.value
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean)
                  })
                }
              />
            </label>

            <label className="span-2">
              Notes
              <textarea rows={5} value={draft.notes ?? ""} onChange={(event) => patchDraft({ notes: event.target.value })} />
            </label>
          </div>
        )}

        {error && <p className="error">{error}</p>}

        <div className="modal-actions">
          {step === 2 && (
            <button
              className="secondary"
              type="button"
              onClick={() => {
                setStep(1);
                setError(null);
              }}
            >
              Back
            </button>
          )}
          <button className="primary" type="submit">
            {step === 1 ? "Continue" : "Save Job"}
          </button>
        </div>
      </form>
    </div>
  );
};
