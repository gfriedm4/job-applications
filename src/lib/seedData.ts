import { JobRecord, JobStatus, TimelineEventType } from "./types";
import { createId } from "./utils";

interface SeedTimelineItem {
  daysAgo: number;
  type: TimelineEventType;
  message: string;
}

interface SeedReminder {
  daysFromNow: number;
  text: string;
  completed?: boolean;
}

interface SeedJobInput {
  company: string;
  roleTitle: string;
  status: JobStatus;
  daysAgo: number;
  location?: string;
  salaryText?: string;
  notes?: string;
  tags?: string[];
  sourceType?: string;
  documents?: Array<{ label: string; pathOrUrl: string; note?: string }>;
  reminders?: SeedReminder[];
  timeline?: SeedTimelineItem[];
}

const MS_DAY = 86_400_000;

const dateOnly = (at: number): string => new Date(at).toISOString().slice(0, 10);

const buildTimeline = (now: number, items: SeedTimelineItem[] = []): JobRecord["timelineEvents"] => {
  return items
    .map((item) => ({
      id: createId(),
      type: item.type,
      at: new Date(now - item.daysAgo * MS_DAY).toISOString(),
      message: item.message
    }))
    .sort((a, b) => (a.at > b.at ? -1 : 1));
};

const makeSeedJob = (now: number, input: SeedJobInput): JobRecord => {
  const createdAtMs = now - input.daysAgo * MS_DAY;
  const updatedAtMs = createdAtMs + Math.min(6, Math.max(1, input.daysAgo)) * 0.4 * MS_DAY;

  return {
    id: createId(),
    company: input.company,
    roleTitle: input.roleTitle,
    dateAdded: dateOnly(createdAtMs),
    status: input.status,
    location: input.location,
    salaryText: input.salaryText,
    notes: input.notes,
    tags: input.tags ?? [],
    sourceType: input.sourceType,
    documents: (input.documents ?? []).map((document) => ({
      id: createId(),
      ...document
    })),
    reminders: (input.reminders ?? []).map((reminder) => {
      const reminderAt = now + reminder.daysFromNow * MS_DAY;
      return {
        id: createId(),
        dueDate: dateOnly(reminderAt),
        text: reminder.text,
        completed: reminder.completed ?? false,
        createdAt: new Date(createdAtMs + MS_DAY).toISOString()
      };
    }),
    timelineEvents: buildTimeline(now, input.timeline),
    createdAt: new Date(createdAtMs).toISOString(),
    updatedAt: new Date(updatedAtMs).toISOString()
  };
};

export const createSeedJobs = (): JobRecord[] => {
  const now = Date.now();

  return [
    makeSeedJob(now, {
      company: "Northstar AI",
      roleTitle: "Frontend Engineer",
      status: "Applied",
      daysAgo: 5,
      location: "Remote (US)",
      salaryText: "$140k - $170k",
      notes: "Applied with tailored resume focused on design systems and performance optimization.",
      tags: ["React", "TypeScript", "Remote"],
      sourceType: "Company site",
      documents: [
        {
          label: "Resume v4",
          pathOrUrl: "~/Documents/job-search/resume-frontend-v4.pdf"
        },
        {
          label: "Cover Letter",
          pathOrUrl: "~/Documents/job-search/cover-letter-northstar.md"
        }
      ],
      reminders: [{ daysFromNow: 2, text: "Follow up with recruiter if no response." }],
      timeline: [
        { daysAgo: 5, type: "created", message: "Job created with status Wishlist" },
        { daysAgo: 4, type: "statusChanged", message: "Wishlist -> Applied" }
      ]
    }),
    makeSeedJob(now, {
      company: "Beacon Health",
      roleTitle: "Full Stack Engineer",
      status: "Interview",
      daysAgo: 16,
      location: "Boston, MA",
      salaryText: "$150k - $180k",
      notes: "Great culture fit so far. Preparing architecture examples for panel round.",
      tags: ["Node.js", "Platform", "Healthcare"],
      sourceType: "Referral",
      reminders: [{ daysFromNow: 1, text: "Review STAR stories before interview." }],
      timeline: [
        { daysAgo: 16, type: "created", message: "Job created with status Wishlist" },
        { daysAgo: 15, type: "statusChanged", message: "Wishlist -> Applied" },
        { daysAgo: 9, type: "statusChanged", message: "Applied -> Interview" },
        { daysAgo: 3, type: "noteAdded", message: "Recruiter confirmed final panel for Friday." }
      ]
    }),
    makeSeedJob(now, {
      company: "ParcelPath",
      roleTitle: "Senior React Engineer",
      status: "Offer",
      daysAgo: 24,
      location: "New York, NY",
      salaryText: "$175k - $200k + equity",
      notes: "Offer received. Evaluating growth path and team structure.",
      tags: ["React", "Mentorship", "Product"],
      sourceType: "LinkedIn",
      reminders: [{ daysFromNow: 3, text: "Send response to offer package." }],
      timeline: [
        { daysAgo: 24, type: "created", message: "Job created with status Wishlist" },
        { daysAgo: 23, type: "statusChanged", message: "Wishlist -> Applied" },
        { daysAgo: 15, type: "statusChanged", message: "Applied -> Interview" },
        { daysAgo: 1, type: "statusChanged", message: "Interview -> Offer" }
      ]
    }),
    makeSeedJob(now, {
      company: "Lumina Labs",
      roleTitle: "Product Engineer",
      status: "Wishlist",
      daysAgo: 2,
      location: "Remote",
      salaryText: "$130k - $160k",
      notes: "Strong mission and small team. Need to finish portfolio refresh before applying.",
      tags: ["Startup", "Product", "Remote"],
      sourceType: "Company site",
      timeline: [{ daysAgo: 2, type: "created", message: "Job created with status Wishlist" }]
    }),
    makeSeedJob(now, {
      company: "Orbit Cloud",
      roleTitle: "Platform Engineer",
      status: "Rejected",
      daysAgo: 28,
      location: "Austin, TX",
      salaryText: "$155k - $185k",
      notes: "Rejected after onsite. Feedback: wanted deeper distributed systems experience.",
      tags: ["Kubernetes", "SRE"],
      sourceType: "Referral",
      timeline: [
        { daysAgo: 28, type: "created", message: "Job created with status Wishlist" },
        { daysAgo: 27, type: "statusChanged", message: "Wishlist -> Applied" },
        { daysAgo: 18, type: "statusChanged", message: "Applied -> Interview" },
        { daysAgo: 7, type: "statusChanged", message: "Interview -> Rejected" }
      ]
    }),
    makeSeedJob(now, {
      company: "Pine & Co",
      roleTitle: "Design Technologist",
      status: "Archived",
      daysAgo: 45,
      location: "San Francisco, CA",
      salaryText: "$145k - $175k",
      notes: "Archived after role scope changed away from engineering depth.",
      tags: ["Design Systems", "Frontend"],
      sourceType: "Referral",
      timeline: [
        { daysAgo: 45, type: "created", message: "Job created with status Wishlist" },
        { daysAgo: 42, type: "statusChanged", message: "Wishlist -> Applied" },
        { daysAgo: 30, type: "statusChanged", message: "Applied -> Archived" }
      ]
    })
  ];
};
