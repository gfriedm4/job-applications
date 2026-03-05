import { Link } from "react-router-dom";
import { JobRecord } from "../lib/types";

interface Props {
  jobs: JobRecord[];
  sortBy: "company" | "roleTitle" | "status" | "dateAdded" | "updatedAt";
  sortDirection: "asc" | "desc";
  onSortChange: (nextSortBy: "company" | "roleTitle" | "status" | "dateAdded" | "updatedAt") => void;
}

const getAriaSort = (column: Props["sortBy"], sortBy: Props["sortBy"], sortDirection: Props["sortDirection"]) => {
  if (column !== sortBy) {
    return "none";
  }

  return sortDirection === "asc" ? "ascending" : "descending";
};

export const JobsTable = ({ jobs, sortBy, sortDirection, onSortChange }: Props) => {
  const sortColumns: Array<{ key: Props["sortBy"]; label: string }> = [
    { key: "company", label: "Company" },
    { key: "roleTitle", label: "Role" },
    { key: "status", label: "Status" },
    { key: "dateAdded", label: "Date Added" },
    { key: "updatedAt", label: "Updated" }
  ];

  const sortIndicator = (column: Props["sortBy"]) => {
    if (sortBy !== column) {
      return " \u2195";
    }

    return sortDirection === "asc" ? " \u2191" : " \u2193";
  };

  return (
    <section className="table-shell" aria-label="jobs table">
      <div className="table-toolbar">
        <span className="table-count">{jobs.length} records</span>
      </div>

      <div className="table-content">
        <table className="jobs-table">
          <thead>
            <tr>
              {sortColumns.map((column) => (
                <th key={column.key} scope="col" aria-sort={getAriaSort(column.key, sortBy, sortDirection)}>
                  <button
                    className={`sort-header ${sortBy === column.key ? "sort-header-active" : ""}`}
                    type="button"
                    onClick={() => onSortChange(column.key)}
                    aria-label={`Sort by ${column.label}`}
                  >
                    {column.label}
                    <span className="sort-indicator" aria-hidden="true">
                      {sortIndicator(column.key)}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className={job.status === "Archived" ? "row-archived" : ""}>
                <td>
                  {/* Keep a real link for keyboard and screen-reader navigation while making the full row clickable. */}
                  <Link
                    className="row-overlay-link"
                    to={`/job/${job.id}`}
                    aria-label={`Open details for ${job.company}, ${job.roleTitle}`}
                  />
                  {job.company}
                </td>
                <td>{job.roleTitle}</td>
                <td>
                  <span className={`chip chip-${job.status.toLowerCase()}`}>{job.status}</span>
                </td>
                <td>{job.dateAdded}</td>
                <td>{job.updatedAt.slice(0, 10)}</td>
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
