import { FormEvent, useEffect, useState } from "react";
import { AiSettings } from "../lib/aiSettings";

interface Props {
  isOpen: boolean;
  initial: AiSettings;
  onClose: () => void;
  onSave: (settings: AiSettings) => void;
  onClearDashboardData: () => void;
}

export const AiSettingsModal = ({ isOpen, initial, onClose, onSave, onClearDashboardData }: Props) => {
  const [openAiApiKey, setOpenAiApiKey] = useState(initial.openAiApiKey);
  const [openAiModel, setOpenAiModel] = useState(initial.openAiModel);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setOpenAiApiKey(initial.openAiApiKey);
    setOpenAiModel(initial.openAiModel);
    setIsClearConfirmOpen(false);
  }, [isOpen, initial]);

  if (!isOpen) {
    return null;
  }

  const submit = (event: FormEvent) => {
    event.preventDefault();

    onSave({
      openAiApiKey: openAiApiKey.trim(),
      openAiModel: openAiModel.trim() || initial.openAiModel
    });
  };

  const confirmClearDashboardData = () => {
    onClearDashboardData();
    setIsClearConfirmOpen(false);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal={true} aria-labelledby="ai-settings-title">
      <form className="modal settings-modal" onSubmit={submit}>
        <header className="modal-header">
          <h2 id="ai-settings-title">AI Settings</h2>
          <button className="secondary" type="button" onClick={onClose}>
            Close
          </button>
        </header>

        <p className="step-hint">
          Your key is stored only in this browser&apos;s localStorage and is not included in import/export JSON files.
        </p>

        <div className="form-grid settings-grid">
          <label className="span-2">
            OpenAI API Key
            <input
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={openAiApiKey}
              onChange={(event) => setOpenAiApiKey(event.target.value)}
              placeholder="sk-..."
            />
          </label>

          <label className="span-2">
            Model
            <input
              value={openAiModel}
              onChange={(event) => setOpenAiModel(event.target.value)}
              placeholder="gpt-4.1-mini"
            />
          </label>
        </div>

        <section className="settings-danger-zone" aria-labelledby="settings-danger-zone-title">
          <h3 id="settings-danger-zone-title">Danger Zone</h3>
          <p className="step-hint">This permanently removes all job records, reminders, timeline notes, and dashboard filters.</p>
          {isClearConfirmOpen ? (
            <div className="settings-danger-confirm">
              <p>Clear all dashboard data now? This action cannot be undone.</p>
              <div className="modal-actions settings-danger-actions">
                <button className="secondary" type="button" onClick={() => setIsClearConfirmOpen(false)}>
                  Cancel
                </button>
                <button className="danger" type="button" onClick={confirmClearDashboardData}>
                  Yes, Clear Data
                </button>
              </div>
            </div>
          ) : (
            <button className="danger" type="button" onClick={() => setIsClearConfirmOpen(true)}>
              Clear Dashboard Data
            </button>
          )}
        </section>

        <div className="modal-actions">
          <button className="secondary" type="button" onClick={() => setOpenAiApiKey("")}>
            Clear Key
          </button>
          <button className="primary" type="submit">
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};
