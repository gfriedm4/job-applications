import { FormEvent, useEffect, useState } from "react";
import { extractJobDraftFromDescription } from "../lib/ai";
import { JobDraft } from "../state/store";

interface Props {
  isOpen: boolean;
  apiKey: string;
  model: string;
  onClose: () => void;
  onOpenSettings: () => void;
  onEnterManually: () => void;
  onDraftReady: (draft: JobDraft) => void;
}

export const PasteJobDescriptionModal = ({
  isOpen,
  apiKey,
  model,
  onClose,
  onOpenSettings,
  onEnterManually,
  onDraftReady
}: Props) => {
  const [jobDescription, setJobDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setError(null);
    setIsSubmitting(false);
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const canGenerate = Boolean(apiKey.trim()) && jobDescription.trim().length >= 40 && !isSubmitting;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canGenerate) {
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const draft = await extractJobDraftFromDescription({
        apiKey,
        model,
        jobDescription
      });
      onDraftReady(draft);
      setJobDescription("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not generate a job draft.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal={true} aria-labelledby="paste-job-title">
      <form className="modal paste-modal" onSubmit={submit}>
        <header className="modal-header">
          <h2 id="paste-job-title">Paste Job Description</h2>
          <button className="secondary" type="button" onClick={onClose}>
            Close
          </button>
        </header>

        <p className="step-hint">
          Paste the full posting and generate a pre-filled draft. You can review and edit everything before saving.
        </p>

        {!apiKey.trim() && (
          <p className="warning api-warning">
            Add your OpenAI API key in settings before generating a draft.
            <button type="button" className="link-button" onClick={onOpenSettings}>
              Open Settings
            </button>
          </p>
        )}

        <label className="paste-label">
          Job Description
          <textarea
            rows={12}
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Paste the full job listing text here..."
          />
        </label>

        {error && <p className="error">{error}</p>}

        <div className="modal-actions">
          <button className="secondary" type="button" onClick={onEnterManually}>
            Enter Manually
          </button>
          <button className="primary" type="submit" disabled={!canGenerate}>
            {isSubmitting ? "Generating..." : "Generate Draft"}
          </button>
        </div>
      </form>
    </div>
  );
};
