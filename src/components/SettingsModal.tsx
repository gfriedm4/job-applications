import { FormEvent, useEffect, useState } from "react";
import { AiSettings } from "../lib/aiSettings";
import { ImportExportPanel } from "./ImportExportPanel";

interface Props {
  isOpen: boolean;
  initial: AiSettings;
  onClose: () => void;
  onSave: (settings: AiSettings) => void;
  canExport: boolean;
  onExport: () => string;
  onReadImport: (file: File) => Promise<{ warnings: string[]; jobs: number }>;
  onApplyImport: () => void;
  onClearDashboardData: () => void;
}

export const SettingsModal = ({
  isOpen,
  initial,
  onClose,
  onSave,
  canExport,
  onExport,
  onReadImport,
  onApplyImport,
  onClearDashboardData
}: Props) => {
  const [openAiApiKey, setOpenAiApiKey] = useState(initial.openAiApiKey);
  const [openAiModel, setOpenAiModel] = useState(initial.openAiModel);
  const [darkMode, setDarkMode] = useState(initial.darkMode);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setOpenAiApiKey(initial.openAiApiKey);
    setOpenAiModel(initial.openAiModel);
    setDarkMode(initial.darkMode);
    setIsClearConfirmOpen(false);
  }, [isOpen, initial]);

  if (!isOpen) {
    return null;
  }

  const submit = (event: FormEvent) => {
    event.preventDefault();

    onSave({
      openAiApiKey: openAiApiKey.trim(),
      openAiModel: openAiModel.trim() || initial.openAiModel,
      darkMode
    });
  };

  const confirmClearDashboardData = () => {
    onClearDashboardData();
    setIsClearConfirmOpen(false);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal={true} aria-labelledby="settings-title">
      <form className="modal settings-modal" onSubmit={submit}>
        <header className="modal-header">
          <h2 id="settings-title">Settings</h2>
          <button className="secondary" type="button" onClick={onClose}>
            Close
          </button>
        </header>

        <p className="step-hint">Preferences are stored only in this browser&apos;s localStorage.</p>

        <section className="settings-appearance" aria-labelledby="settings-appearance-title">
          <h3 id="settings-appearance-title">Appearance</h3>
          <label className="settings-toggle">
            Dark Mode
            <input type="checkbox" checked={darkMode} onChange={(event) => setDarkMode(event.target.checked)} />
          </label>
        </section>

        <section className="settings-section" aria-labelledby="settings-ai-title">
          <h3 id="settings-ai-title">AI</h3>
          <p className="step-hint">
            Your API key is not included in import/export JSON files and stays in this browser only.
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
        </section>

        <section className="settings-section" aria-labelledby="settings-import-title">
          <h3 id="settings-import-title">Data</h3>
          <ImportExportPanel
            canExport={canExport}
            onExport={onExport}
            onReadImport={onReadImport}
            onApplyImport={onApplyImport}
            headingLevel={3}
          />
        </section>

        <section className="settings-danger-zone" aria-labelledby="settings-danger-zone-title">
          <h3 id="settings-danger-zone-title">Danger Zone</h3>
          <p className="step-hint">This permanently removes all job records, timeline notes, and dashboard filters.</p>
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
