# Agent Guide

Use this loop for deterministic PR iteration:

1. `gh prx context`
2. Follow `suggestedNextAction`
3. Use a targeted command:
   - review work: `gh prx threads list --unresolved`
   - CI work: `gh prx ci status`, `gh prx ci logs --failed`, `gh prx ci annotations --failed`
4. Re-run `gh prx context`
5. Repeat until `ready_to_merge`

## Recommended output modes

- Default `text`: fast scan + readable for both humans and agents
- `json`: deterministic machine payload for script chaining
- `jsonl`: streaming mode for long-running watch commands

## Fast recipes

CI-first loop:

```bash
gh prx ci watch --fail-fast --format jsonl
gh prx ci logs --failed
gh prx ci annotations --failed
```

Review-first loop:

```bash
gh prx threads list --unresolved
gh prx context
gh prx doctor
```
