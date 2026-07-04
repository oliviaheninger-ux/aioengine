# AI Coding Rules

This project uses AI-assisted development. Follow these rules carefully.

## Before changing code

- Understand the requested task before editing files.
- Keep changes narrow and directly related to the task.
- Do not modify auth, billing, database, env, deployment, or security files unless explicitly asked.
- Do not add new dependencies unless clearly necessary.
- Do not delete files without explaining why.

## High-risk areas

Changes to these areas require extra human review:

- Authentication and session logic
- Billing and payment code
- Database migrations and RLS policies
- Environment variables and config files
- Deployment settings
- GitHub Actions and CI
- Middleware and API routes
- Package/dependency files

## Testing

When making code changes:

- Run relevant tests when possible.
- Mention any tests that were not run.
- Keep the final summary specific and honest.

## Scope

If the task is UI-only, do not edit backend, database, billing, auth, or deployment files.
