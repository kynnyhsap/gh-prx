export type OutputFormat = "text" | "json" | "jsonl";

export interface RepoRef {
  host: string;
  owner: string;
  name: string;
  fullName: string;
}

export interface PrRef {
  number: number;
  title: string;
  url: string;
  baseRefName: string;
  headRefName: string;
  headRefOid: string;
  mergeStateStatus?: string;
  mergeable?: string;
  reviewDecision?: string;
  reviewRequestsCount?: number;
  isDraft: boolean;
}

export interface ReviewThread {
  id: string;
  isResolved: boolean;
  isOutdated: boolean;
  path: string;
  line: number | null;
  latestAuthor: string;
  latestBody: string;
  latestUpdatedAt: string;
  latestUrl: string;
}

export interface CheckSummary {
  name: string;
  state: string;
  bucket: string;
  startedAt?: string;
  completedAt?: string;
  workflow?: string;
  link?: string;
}

export interface JobSummary {
  databaseId: number;
  name: string;
  status: string;
  conclusion: string | null;
  startedAt?: string;
  completedAt?: string;
}

export interface RunSummary {
  databaseId: number;
  workflowName: string;
  status: string;
  conclusion: string | null;
  url: string;
  jobs: JobSummary[];
}

export interface Annotation {
  path: string;
  start_line: number;
  end_line: number;
  annotation_level: string;
  message: string;
  title: string | null;
}

export interface Diagnostic {
  severity: "error" | "warn" | "info";
  code: string;
  message: string;
  nextAction: string;
  command?: string;
}

export type SuggestedNextAction =
  | "fix_ci"
  | "wait_for_ci"
  | "address_review"
  | "address_changes_requested"
  | "wait_for_review"
  | "mark_ready"
  | "ready_to_merge";

export interface PrxContext {
  schemaVersion: number;
  repo: string;
  pr: PrRef;
  unresolvedThreads: ReviewThread[];
  checks: CheckSummary[];
  latestRun: RunSummary | null;
  failingChecks: CheckSummary[];
  failedJobs: JobSummary[];
  pendingChecks: CheckSummary[];
  suggestedNextAction: SuggestedNextAction;
  suggestedNextCommand: string;
}

export interface NextStep {
  schemaVersion: number;
  repo: string;
  pr: number;
  kind:
    | "ci_failure"
    | "ci_pending"
    | "changes_requested"
    | "unresolved_thread"
    | "waiting_review"
    | "draft"
    | "ready_to_merge";
  reason: string;
  command: string;
  details: Record<string, unknown>;
}

export interface AnnotationGroup {
  path: string;
  count: number;
  levels: Record<string, number>;
  annotations: Annotation[];
}

export interface CiDiagnosis {
  schemaVersion: number;
  repo: string;
  run: RunSummary;
  failingJobs: JobSummary[];
  logsByJob: Array<{
    jobId: number;
    jobName: string;
    tailLines: number;
    logTail: string;
  }>;
  annotationsCount: number;
  annotationsByPath: AnnotationGroup[];
  suggestedNextAction: string;
  suggestedNextCommand: string;
}
