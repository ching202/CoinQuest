# Evidence environment and limitations

The assistant ran source diagnostics on November 23, 2026 UTC (November 22 Pacific) in Linux with Node v24.22.3 and npm 11.19.1.

`npm ci --no-audit --no-fund` in the original frontend failed with HTTP 403 retrieving zod-validation-error-4.0.2.tgz. An attempted isolated install of React/React DOM/esbuild also failed with HTTP 403 retrieving esbuild. No successful application startup, browser execution, lint run, or production build is claimed.

The runner reads original App.jsx, removes import lines, retains the logic before the outer JSX return, and exposes calculated values/functions. It substitutes simple state hooks and a simulated database to investigate source behavior. It does not render React, simulate the React scheduler faithfully, or verify Supabase serialization, transactions, permissions, constraints, or network behavior. A microtask/event-loop flush lets the original loading function settle. It is diagnostic evidence only and is not Kyle's required white-box test suite or coverage report.

The simulated failure in SV-02 deliberately lets profile updates persist and rejects the following insert. This demonstrates the client sequence's partial-write risk under those conditions; Kyle must verify the actual test service behavior. The completed=false fixture in SV-01 may be an unsupported database state and requires schema review.

No real financial data, live database writes, or browser screenshots were used. Application source was not corrected. verify_source.cjs accepts the original App.jsx path as its argument and exits if its extraction marker does not match.
