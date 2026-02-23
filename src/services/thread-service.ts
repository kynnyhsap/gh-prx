import type { RepoRef, ReviewThread } from "../domain/types";
import { queryGraphql } from "../github/graphql";

const THREADS_QUERY = `
query($owner: String!, $name: String!, $number: Int!) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      reviewThreads(first: 100) {
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          comments(last: 1) {
            nodes {
              body
              updatedAt
              url
              author { login }
            }
          }
        }
      }
    }
  }
}
`;

const RESOLVE_MUTATION = `
mutation($threadId: ID!) {
  resolveReviewThread(input: {threadId: $threadId}) {
    thread { id isResolved }
  }
}
`;

const UNRESOLVE_MUTATION = `
mutation($threadId: ID!) {
  unresolveReviewThread(input: {threadId: $threadId}) {
    thread { id isResolved }
  }
}
`;

export function getThreads(
  repo: RepoRef,
  prNumber: number,
  unresolvedOnly: boolean,
): ReviewThread[] {
  type Response = {
    data: {
      repository: {
        pullRequest: {
          reviewThreads: {
            nodes: Array<{
              id: string;
              isResolved: boolean;
              isOutdated: boolean;
              path: string;
              line: number | null;
              comments: {
                nodes: Array<{
                  body: string;
                  updatedAt: string;
                  url: string;
                  author: { login: string } | null;
                }>;
              };
            }>;
          };
        };
      };
    };
  };

  const res = queryGraphql<Response>(
    THREADS_QUERY,
    { owner: repo.owner, name: repo.name, number: prNumber },
    repo.fullName,
  );

  const nodes = res.data.repository.pullRequest.reviewThreads.nodes;
  const mapped = nodes.map((node) => {
    const latest = node.comments.nodes[0];
    return {
      id: node.id,
      isResolved: node.isResolved,
      isOutdated: node.isOutdated,
      path: node.path,
      line: node.line,
      latestAuthor: latest?.author?.login || "unknown",
      latestBody: latest?.body || "",
      latestUpdatedAt: latest?.updatedAt || "",
      latestUrl: latest?.url || "",
    } satisfies ReviewThread;
  });

  return unresolvedOnly ? mapped.filter((t) => !t.isResolved) : mapped;
}

export function resolveThread(
  repo: RepoRef,
  threadId: string,
): { id: string; isResolved: boolean } {
  type Response = {
    data: { resolveReviewThread: { thread: { id: string; isResolved: boolean } } };
  };
  const res = queryGraphql<Response>(RESOLVE_MUTATION, { threadId }, repo.fullName);
  return res.data.resolveReviewThread.thread;
}

export function unresolveThread(
  repo: RepoRef,
  threadId: string,
): { id: string; isResolved: boolean } {
  type Response = {
    data: { unresolveReviewThread: { thread: { id: string; isResolved: boolean } } };
  };
  const res = queryGraphql<Response>(UNRESOLVE_MUTATION, { threadId }, repo.fullName);
  return res.data.unresolveReviewThread.thread;
}
