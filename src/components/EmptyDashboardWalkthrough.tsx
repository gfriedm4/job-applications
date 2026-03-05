interface Props {
  hasOpenAiKey: boolean;
  onOpenSettings: () => void;
  onAddJob: () => void;
  onPasteJobDescription: () => void;
}

export const EmptyDashboardWalkthrough = ({
  hasOpenAiKey,
  onOpenSettings,
  onAddJob,
  onPasteJobDescription
}: Props) => {
  return (
    <section className="onboarding-shell" aria-label="getting started walkthrough">
      <header className="onboarding-header">
        <h2>Start Tracking Your Applications</h2>
        <p>Add your first role to unlock dashboard metrics and progress tracking.</p>
      </header>

      <div className="onboarding-actions">
        <button className="primary" onClick={onAddJob}>
          Add Your First Job
        </button>
        {hasOpenAiKey && (
          <button className="secondary" onClick={onPasteJobDescription}>
            Paste Job Description
          </button>
        )}
        <button className="secondary" onClick={onOpenSettings}>
          Settings
        </button>
      </div>
    </section>
  );
};
