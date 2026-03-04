import { ChangeEvent, useState } from "react";
import { buildExportFilename } from "../lib/importExport";

interface Props {
  canExport: boolean;
  onExport: () => string;
  onReadImport: (file: File) => Promise<{ warnings: string[]; jobs: number }>;
  onApplyImport: () => void;
  headingLevel?: 2 | 3;
}

export const ImportExportPanel = ({ canExport, onExport, onReadImport, onApplyImport, headingLevel = 2 }: Props) => {
  const [warnings, setWarnings] = useState<string[]>([]);
  const [pendingJobs, setPendingJobs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const Heading = headingLevel === 3 ? "h3" : "h2";

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
      setWarnings(preview.warnings);
      setPendingJobs(preview.jobs);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Import failed.");
      setWarnings([]);
      setPendingJobs(null);
    }
  };

  const apply = () => {
    onApplyImport();
    setWarnings([]);
    setPendingJobs(null);
  };

  return (
    <section className="io-panel">
      <Heading>{canExport ? "Import / Export" : "Import"}</Heading>
      <p className="io-description">Back up your tracker as JSON and restore it later with a full replace import.</p>
      <div className="io-actions">
        {canExport && (
          <button className="primary" type="button" onClick={doExport}>
            Export JSON
          </button>
        )}
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

      {pendingJobs !== null && (
        <div className="import-preview">
          <h3>Replace All Data</h3>
          <p className="preview-stat">
            Imported records: <strong>{pendingJobs}</strong>
          </p>
          <p className="preview-stat">Applying this import will replace your current tracker state.</p>
          <button className="primary" type="button" onClick={apply}>
            Replace All
          </button>
        </div>
      )}
    </section>
  );
};
