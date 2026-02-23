# gh-prx

`gh-prx` is a GitHub CLI extension that gives agents one command surface for PR review and CI debugging.

Default output is human-readable text. Opt into JSON when you need machine processing.

## Why this exists

Agents usually bounce between:

- `gh pr view`
- `gh pr checks`
- `gh run view --log-failed`
- `gh api ...`

This extension collapses that loop into one workflow.

## Install (2 minutes)

Prereqs:

- `gh` authenticated (`gh auth status`)
- `bun`

Local install:

```bash
git clone <your-repo-url> gh-prx
cd gh-prx
bun install
bun run build
gh extension install .
```

Run:

```bash
gh prx --help
gh prx context
```

## Command quickstart

```bash
# One-shot PR + CI context
gh prx context

# Review thread queue
gh prx threads list --unresolved

# CI status and failures
gh prx ci status
gh prx ci logs --failed
gh prx ci annotations --failed

# Fail-fast watch loop
gh prx ci watch --fail-fast --format jsonl

# Blocker diagnosis
gh prx doctor
```

## Output formats

- `text` (default): for humans and agent-readable terminal output
- `json`: deterministic machine output for scripts
- `jsonl`: streaming events (best for `ci watch`)

Example:

```bash
gh prx context --format json
gh prx ci watch --fail-fast --format jsonl
gh prx context --no-color
```

## Repository targeting

- If you are inside a git repo, repository is auto-detected.
- Override with `--repo owner/name` anytime.

Example:

```bash
gh prx context --repo cli/cli
```

## Docs

- Command reference: `docs/COMMANDS.md`
- Setup/development: `docs/SETUP.md`
- Agent workflow guide: `docs/AGENT_GUIDE.md`

## Development

```bash
bun run lint
bun run format
bun run typecheck
bun test
```

Live e2e against your current repo:

```bash
bun run e2e:live
```
