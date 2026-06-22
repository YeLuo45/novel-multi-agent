# novel-multi-agent

## Project rules

- Keep core domain logic in `packages/core`; agents depend on core, never the reverse.
- Every agent must be deterministic by default so the project runs without API keys.
- Use observable contract tests under `<package>/test/`; do not test private helpers directly.
- Preserve the writing pipeline: premise → bible → outline → chapter draft → critique → revise → memory update.
- Treat generated manuscripts as artifacts under `.novel-ma/`, not source files.
