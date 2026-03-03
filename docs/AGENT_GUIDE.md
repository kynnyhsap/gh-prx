# Agent Guide

Use this loop for deterministic PR iteration:

1. `gh prx context --agent`
2. Read `suggestedNextAction` and `suggestedNextCommand`
3. Use `gh prx next --agent` when you want a single actionable item
4. Use a targeted command:
   - review work: `gh prx threads list --unresolved`
   - CI work: `gh prx ci status`, `gh prx ci diagnose`, `gh prx ci logs --failed`, `gh prx ci annotations --failed`
5. Re-run `gh prx context --agent`
6. Repeat until `ready_to_merge`

## Recommended output modes

- Default `text`: fast scan + readable for both humans and agents
- `json`: deterministic machine payload for script chaining
- `jsonl`: streaming mode for long-running watch commands
- `--agent`: defaults to JSON/no-color and enables smart flags (`--unresolved`, `--failed`, `--fail-fast`)

## Fast recipes

CI-first loop:

```bash
gh prx ci watch --fail-fast --format jsonl
gh prx ci diagnose
gh prx ci logs --failed
gh prx ci annotations --failed
```

Review-first loop:

```bash
gh prx threads list --unresolved
gh prx next --agent
gh prx context
gh prx doctor
```
