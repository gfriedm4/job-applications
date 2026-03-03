interface Props {
  hasOpenAiKey: boolean;
  onOpenSettings: () => void;
  onAddJob: () => void;
  onPasteJobDescription: () => void;
  onLoadSampleData: () => void;
}

export const EmptyDashboardWalkthrough = ({
  hasOpenAiKey,
  onOpenSettings,
  onAddJob,
  onPasteJobDescription,
  onLoadSampleData
}: Props) => {
  return (
    <section className="onboarding-shell" aria-label="getting started walkthrough">
      <header className="onboarding-header">
        <h2>Set Up Your Tracker</h2>
        <p>Add your first role in under two minutes with this quick walkthrough.</p>
      </header>

      <ol className="onboarding-steps">
        <li>
          <h3>Step 1: Configure Settings</h3>
          <p>
            Add your OpenAI key if you want to paste job descriptions and auto-fill job fields. You can still track everything
            manually without AI.
          </p>
          <div className="onboarding-actions">
            <button className="secondary" onClick={onOpenSettings}>
              Open Settings
            </button>
            {hasOpenAiKey && (
              <button className="primary" onClick={onPasteJobDescription}>
                Paste Job Description
              </button>
            )}
          </div>
        </li>

        <li>
          <h3>Step 2: Add Your First Job</h3>
          <p>Capture company, role, status, and notes so your pipeline starts with a clear baseline.</p>
          <div className="onboarding-actions">
            <button className="primary" onClick={onAddJob}>
              Create First Job
            </button>
          </div>
        </li>

        <li>
          <h3>Step 3: Learn the Workflow (Optional)</h3>
          <p>Load sample data to see how reminders, status changes, and exports work before tracking live applications.</p>
          <div className="onboarding-actions">
            <button className="secondary" onClick={onLoadSampleData}>
              Load Sample Data
            </button>
          </div>
        </li>
      </ol>
    </section>
  );
};
