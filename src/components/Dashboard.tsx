import { calculateFunnelMetrics } from "../lib/analytics";
import { JobRecord } from "../lib/types";

interface Props {
  jobs: JobRecord[];
}

export const Dashboard = ({ jobs }: Props) => {
  const funnel = calculateFunnelMetrics(jobs);
  const metrics = [
    { label: "Total Jobs", value: jobs.length, className: "card-total" },
    { label: "Applied to Interview", value: `${funnel.conversionAppliedToInterview}%`, className: "card-convert" },
    { label: "Interview to Offer", value: `${funnel.conversionInterviewToOffer}%`, className: "card-convert" },
    { label: "Applied to Offer", value: `${funnel.conversionAppliedToOffer}%`, className: "card-convert" },
    { label: "Avg Days in Pipeline", value: funnel.averageDaysToCurrentStatus, className: "card-duration" }
  ];

  return (
    <section className="dashboard-grid" aria-label="dashboard metrics">
      <div className="dashboard-heading">
        <h2>Dashboard</h2>
        <p>Accessibility-friendly summary of your pipeline health.</p>
      </div>
      {metrics.map((metric) => (
        <article className={`card ${metric.className}`} key={metric.label}>
          <h3>{metric.label}</h3>
          <p className="metric-value">{metric.value}</p>
        </article>
      ))}
    </section>
  );
};
