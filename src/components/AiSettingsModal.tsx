import { FormEvent, useEffect, useState } from "react";
import { AiSettings } from "../lib/aiSettings";

interface Props {
  isOpen: boolean;
  initial: AiSettings;
  onClose: () => void;
  onSave: (settings: AiSettings) => void;
}

export const AiSettingsModal = ({ isOpen, initial, onClose, onSave }: Props) => {
  const [openAiApiKey, setOpenAiApiKey] = useState(initial.openAiApiKey);
  const [openAiModel, setOpenAiModel] = useState(initial.openAiModel);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setOpenAiApiKey(initial.openAiApiKey);
    setOpenAiModel(initial.openAiModel);
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
