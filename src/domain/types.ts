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
  reviewDecision?: string;
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
}
