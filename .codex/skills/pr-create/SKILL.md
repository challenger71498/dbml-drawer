---
name: pr-create
description: Use when creating or drafting a GitHub pull request for this repository, especially when generating a consistent PR title and description from branch changes, commits, or a diff. Enforces service-scoped conventional PR titles such as `feat(frontend): ...` and `fix(backend): ...`, and a standard PR description template.
---

# PR Create

Use this skill when the user asks to create a PR, draft a PR title/body, or prepare PR text for this repository.

## Workflow

1. Inspect the branch changes against the intended base branch.
   - Prefer `git status --short --branch`.
   - Use `git diff --stat <base>` and, when needed, `git diff <base> -- <path>`.
   - If the base branch is not specified, infer it from the tracking branch or default to `origin/main`.
2. Determine the PR type.
   - `feat`: new user-facing or product capability.
   - `fix`: bug fix.
   - `refactor`: behavior-preserving code restructuring.
   - `test`: test-only changes.
   - `docs`: documentation or spec-only changes.
   - `chore`: tooling, dependency, repository maintenance.
3. Determine the service scope.
   - Use `frontend` when the primary runtime behavior is in `frontend/`.
   - Use `backend` when the primary runtime behavior is in `backend/`.
   - Use `frontend,backend` when both services materially change.
   - Use `repo` only when changes are repository-level and not owned by either service.
   - OpenSpec changes should follow the service affected by the proposal, not `docs`, unless the PR is spec-only.
4. Generate the title and description using the required format below.
5. If creating the PR through GitHub tooling, use the generated title and body exactly unless the user asks for edits.

## Required Title Format

Always include a parenthesized scope:

```text
<type>(<service>): <short imperative summary>
```

Examples:

```text
feat(frontend): add diagram selection focus
fix(backend): validate health check response shape
chore(repo): add pull request creation skill
```

Title rules:

- Use lowercase `type` and scope.
- Keep the summary concise, usually under 72 characters.
- Use an imperative phrase: `add`, `fix`, `wire`, `remove`, `update`.
- Do not omit the scope.
- Do not use vague summaries such as `misc updates` or `fix stuff`.

## Required Description Template

Use this template for every PR body:

```markdown
## Summary

- 

## Changes

- 

## Validation

- 

## Notes

- 
```

Section guidance:

- `Summary`: one or two bullets describing the user-visible outcome.
- `Changes`: concrete implementation bullets grouped by behavior, not by file list.
- `Validation`: commands run, test results, or `Not run` with a reason.
- `Notes`: risks, follow-ups, migration notes, or `None`.

Keep the description concise. Do not paste long diffs, logs, or generated coverage tables.
