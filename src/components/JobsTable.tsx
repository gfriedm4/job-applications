import { Link } from "react-router-dom";
import { JobRecord } from "../lib/types";

interface Props {
  jobs: JobRecord[];
}

export const JobsTable = ({ jobs }: Props) => {
  return (
    <section className="table-shell" aria-label="jobs table">
      <div className="table-toolbar">
        <span className="table-count">{jobs.length} records</span>
      </div>

      <div className="table-content">
        <table className="jobs-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Status</th>
              <th>Date Added</th>
              <th>Updated</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className={job.status === "Archived" ? "row-archived" : ""}>
                <td>{job.company}</td>
                <td>{job.roleTitle}</td>
                <td>
                  <span className={`chip chip-${job.status.toLowerCase()}`}>{job.status}</span>
                </td>
                <td>{job.dateAdded}</td>
                <td>{job.updatedAt.slice(0, 10)}</td>
                <td>
                  <Link className="table-link" to={`/job/${job.id}`}>
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mobile-cards">
          {jobs.map((job) => (
            <article key={`${job.id}-mobile`} className="mobile-card">
              <div className="mobile-card-header">
                <h4>{job.company}</h4>
                <p>{job.roleTitle}</p>
              </div>
              <span className={`chip chip-${job.status.toLowerCase()}`}>{job.status}</span>
              <p>Date Added: {job.dateAdded}</p>
              <div className="mobile-row">
                <Link className="table-link" to={`/job/${job.id}`}>
                  Open
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
