import { JOB_STATUSES, JobRecord } from "./types";
import { daysBetween, nowIso } from "./utils";

export interface FunnelMetrics {
  countsByStatus: Record<string, number>;
  conversionAppliedToInterview: number;
  conversionInterviewToOffer: number;
  conversionAppliedToOffer: number;
  averageDaysToCurrentStatus: number;
}

const toRate = (num: number, den: number): number => (den === 0 ? 0 : Number(((num / den) * 100).toFixed(1)));

export const calculateFunnelMetrics = (jobs: JobRecord[]): FunnelMetrics => {
  const countsByStatus: Record<string, number> = {};
  for (const status of JOB_STATUSES) {
    countsByStatus[status] = 0;
  }

  for (const job of jobs) {
    countsByStatus[job.status] = (countsByStatus[job.status] ?? 0) + 1;
  }

  const applied = countsByStatus.Applied;
  const interview = countsByStatus.Interview;
  const offer = countsByStatus.Offer;

  const totalDays = jobs.reduce((sum, job) => sum + daysBetween(job.dateAdded, nowIso()), 0);
  const averageDaysToCurrentStatus = jobs.length ? Number((totalDays / jobs.length).toFixed(1)) : 0;

  return {
    countsByStatus,
    conversionAppliedToInterview: toRate(interview, applied),
    conversionInterviewToOffer: toRate(offer, interview),
    conversionAppliedToOffer: toRate(offer, applied),
    averageDaysToCurrentStatus
  };
};
