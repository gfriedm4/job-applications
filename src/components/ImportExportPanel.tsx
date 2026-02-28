import { ChangeEvent, useState } from "react";
import { buildExportFilename } from "../lib/importExport";
import { ConflictItem } from "../lib/types";

interface Props {
  onExport: () => string;
  onReadImport: (file: File) => Promise<{ conflicts: ConflictItem[]; warnings: string[]; inserts: number }>;
  onApplyImport: (resolutions: Record<string, NonNullable<ConflictItem["resolution"]>>) => void;
}

export const ImportExportPanel = ({ onExport, onReadImport, onApplyImport }: Props) => {
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [inserts, setInserts] = useState<number>(0);
  const [resolutions, setResolutions] = useState<Record<string, NonNullable<ConflictItem["resolution"]>>>({});
  const [error, setError] = useState<string | null>(null);

  const doExport = () => {
    const json = onExport();
    const anchor = document.createElement("a");
    const blob = new Blob([json], { type: "application/json" });
    const canUseBlobUrl = typeof URL.createObjectURL === "function";
    const url = canUseBlobUrl
      ? URL.createObjectURL(blob)
      : `data:application/json;charset=utf-8,${encodeURIComponent(json)}`;

    anchor.href = url;
    anchor.download = buildExportFilename();
    anchor.click();
    if (canUseBlobUrl && typeof URL.revokeObjectURL === "function") {
      URL.revokeObjectURL(url);
    }
  };

  const doImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const preview = await onReadImport(file);
      setConflicts(preview.conflicts);
      setWarnings(preview.warnings);
      setInserts(preview.inserts);
      setResolutions({});
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Import failed.");
      setConflicts([]);
      setWarnings([]);
      setInserts(0);
      setResolutions({});
    }
  };

  const apply = () => {
    onApplyImport(resolutions);
    setConflicts([]);
    setWarnings([]);
    setInserts(0);
    setResolutions({});
  };

  return (
    <section className="io-panel">
      <h2>Import / Export</h2>
      <p className="io-description">Back up your tracker as JSON and merge it on another device with conflict review.</p>
      <div className="io-actions">
        <button className="primary" onClick={doExport}>
          Export JSON
        </button>
        <label className="file-input">
          <span>Import JSON</span>
          <input type="file" accept="application/json" onChange={doImport} />
        </label>
      </div>

      {error && <p className="error">{error}</p>}
      {warnings.length > 0 && (
        <ul className="warning-list">
          {warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      )}

      {(inserts > 0 || conflicts.length > 0) && (
        <div className="import-preview">
          <h3>Import Preview</h3>
          <p className="preview-stat">
            New records: <strong>{inserts}</strong>
          </p>
          <p className="preview-stat">
            Conflicts: <strong>{conflicts.length}</strong>
          </p>

          {conflicts.map((conflict) => (
            <div className="conflict-item" key={conflict.incoming.id}>
              <p>
                <strong>{conflict.existing.company}</strong> - {conflict.existing.roleTitle}
              </p>
              <div className="segmented-control">
                <label>
                  <input
                    type="radio"
                    name={conflict.incoming.id}
                    checked={(resolutions[conflict.incoming.id] ?? "keepExisting") === "keepExisting"}
                    onChange={() =>
                      setResolutions((current) => ({ ...current, [conflict.incoming.id]: "keepExisting" }))
                    }
                  />
                  Keep Existing
                </label>
                <label>
                  <input
                    type="radio"
                    name={conflict.incoming.id}
                    checked={resolutions[conflict.incoming.id] === "keepIncoming"}
                    onChange={() =>
                      setResolutions((current) => ({ ...current, [conflict.incoming.id]: "keepIncoming" }))
                    }
                  />
                  Keep Incoming
                </label>
                <label>
                  <input
                    type="radio"
                    name={conflict.incoming.id}
                    checked={resolutions[conflict.incoming.id] === "keepBoth"}
                    onChange={() => setResolutions((current) => ({ ...current, [conflict.incoming.id]: "keepBoth" }))}
                  />
                  Keep Both
                </label>
              </div>
            </div>
          ))}

          <button className="primary" onClick={apply}>
            Apply Import
          </button>
        </div>
      )}
    </section>
  );
};
