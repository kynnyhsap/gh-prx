# gh-prx skill

Use this skill to iterate on GitHub PRs quickly with `gh prx`.

## Core loop

1. Run `gh prx context`.
2. Read `suggestedNextAction`.
3. If review blockers:
   - `gh prx threads list --unresolved`
4. If CI blockers:
   - `gh prx ci status`
   - `gh prx ci logs --failed`
   - `gh prx ci annotations --failed`
5. Re-run `gh prx context`.

## Command cheatsheet

- PR snapshot: `gh prx context`
- Review queue: `gh prx threads list --unresolved`
- Resolve thread: `gh prx threads resolve <thread-id>`
- CI status: `gh prx ci status`
- Fail logs: `gh prx ci logs --failed`
- Diagnostics: `gh prx ci annotations --failed`
- Watch mode: `gh prx ci watch --fail-fast --format jsonl`
- Blocker diagnosis: `gh prx doctor`

## Output mode guidance

- default `text`: readable terminal output
- `json`: deterministic parsing for scripts
- `jsonl`: streaming events in watch mode
