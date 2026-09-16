# SSOP — Smart Sewer Operations Platform

SSOP is a municipal drainage monitoring and flood-prevention prototype for Chennai, India. It provides a map-first operations console for monitoring sewer conditions, prioritising flood risk, coordinating field crews, reviewing proof of work, and retaining an auditable ticket history.

The project is designed as a working full-stack prototype rather than a static mock-up. It includes a React frontend, an Express and tRPC backend, a MySQL-compatible database accessed through Drizzle ORM, managed project secrets, Google Maps integration, browser voice features, and a server-side JARVIS assistant.

## Project identity

| Field | Value |
| --- | --- |
| Product | Smart Sewer Operations Platform |
| Short name | SSOP |
| Domain | Municipal drainage, sewer monitoring, flood prevention |
| Primary operating context | Chennai Corporation, North zone |
| Founder | Anbumathi Chezhian.M |
| Founder profile | Electronics & IoT Developer |
| Founder portfolio | [v0-anbumathi-chezhian-2203.vercel.app](https://v0-anbumathi-chezhian-2203.vercel.app/) |
| License | MIT |
| Package manager | pnpm |
| Runtime | Node.js with TypeScript |

## What the prototype does

SSOP combines operational monitoring, workforce coordination, and evidence-based closure into one control-room workflow.

### Command centre

The Overview screen is the administrative landing page. It presents current operational KPIs, active tickets, critical alerts, ward performance, monsoon context, and a continuously updating last-synced time in the Asia/Kolkata timezone. Counts are derived from the active ticket and verification state rather than being hard-coded display totals.

### Google Maps operations view

The Live Map uses the native Google Maps JavaScript interface centred on Chennai. Google roads, labels, place names, zoom controls, and map interaction remain visible. SSOP places illustrative sewer monitoring points over the map when exact municipal asset coordinates are not available in the prototype data. Selecting a point opens a sensor panel with fill level, ultrasonic reading, battery, signal, status, history, and recent events.

The browser loads the key from the managed Vite secret named `VITE_GOOGLE_MAPS_API_KEY`. The key is not committed to the repository and can be replaced in the project secret configuration before republishing.

### Alerts and tickets

The Alerts view lists current sensor-driven warnings. The Tickets view provides the active operational queue. Selecting a ticket opens a detail drawer with the manhole, ward, crew, deadline, current status, timeline, field updates, and proof-of-work photo handling.

Employees can attach proof photos locally in the ticket drawer and submit completed work for verification. The Admin verification queue displays the uploaded thumbnails before approval. An approved ticket is removed from active work, marked closed, and archived in the database with its operational details and proof references.

### Ticket history

Ticket History preserves approved and closed work as an audit record. Each record can include the ticket ID, manhole, title, status, crew, deadline, ward, fill level, proof-photo references, closure details, approver, and approval timestamp.

### JARVIS assistant

JARVIS is the SSOP operational assistant. It can answer questions about the system, roles, ticket lifecycle, sensor response, proof review, and reporting. It receives current SSOP context, including the India time, role, active alerts, and a bounded list of live tickets, so it can explain the current state without inventing unsupported data.

The backend first attempts the configured server-side ChatGPT integration. If that is unavailable, it falls back to the secure built-in SSOP assistant. API credentials are never placed in browser code.

JARVIS also supports confirmed Admin voice commands. Examples include:

```text
assign TKT-1098 to Crew Bravo
mark TKT-1098 resolved
```

Voice commands require an on-screen confirmation before execution. Assignment commands persist the crew assignment and create a persistent activity record. JARVIS then reports the result using the operational confirmation format:

> I did assigned the ticket TKT-1098 to Crew Bravo.

The JARVIS interface includes a listening and speaking state, animated waveform treatment, live clock, typed questions, and browser microphone conversation where supported. Admins can enable **standby listening** from the JARVIS view. While enabled, the browser listens locally for the wake word `JARVIS`, then sends the following request to the assistant. JARVIS can also speak a new operational-alert summary when the active alert count increases. Standby is opt-in, persists as a local browser preference, requires microphone permission, and can be disabled at any time. Browser speech recognition cannot guarantee background or device-level always-on operation, so the page must remain open and the browser must continue the recognition session.

### JARVIS assignment activity log

The JARVIS workspace contains a visible Assignment log. Each confirmed autonomous assignment is written to `jarvis_assignment_logs` and displayed with:

- Ticket ID.
- Assigned crew.
- Assignment timestamp.
- Assignment source, normally `JARVIS autonomous assignment`.

The list is ordered newest first and refreshes after a successful autonomous assignment. This provides a simple operational audit trail for AI-assisted workforce routing.

### Workforce roles and access

The initial SSOP screen supports two prototype workspaces:

| Role | Access |
| --- | --- |
| Admin | Overview, Live Map, Alerts, Tickets, Risk Analytics, Sensor Health, Citizen Reports, Ticket History, JARVIS, and Settings |
| Employee | My Tasks, restricted Notifications, JARVIS assistance, Settings, assigned ticket drawers, proof upload, and verification submission |

Admin switching from Settings requires the prototype password `1234`. The passcode is verified by the server against the managed `SSOP_ADMIN_PASSCODE` secret and is not compared in React source. Employees select a crew profile from Crew Alpha, Crew Bravo, Crew Charlie, or Crew Delta and see only the tickets assigned to that crew. Admin-only ticket commands are rejected for Employee workspaces.

**Prototype Admin passcode:** `1234`

This passcode is included only because it is part of the current demonstration workflow. It must be replaced with authenticated user accounts, a securely stored credential, and server-side authorization before production deployment.

The role switcher is a prototype UI workflow. Production deployment should replace it with authenticated user identities, server-side role claims, stronger credential management, and policy enforcement on every protected procedure.

### Assignment persistence

Open tickets without an existing assignment are automatically seeded through a round-robin sequence across Crew Alpha, Crew Bravo, Crew Charlie, and Crew Delta. Assignments are stored in `ticket_assignments` and reused across sessions. Explicit JARVIS assignments update the persisted assignment and add a separate activity-log record.

### Reports

SSOP generates branded PDF and CSV reports for manhole and sensor information. The PDF format includes SSOP branding, a risk indicator, metric cards, telemetry information, event timeline, and a recommended action. CSV output is available for data workflows and export.

### Other operational views

The prototype includes the following working views:

- **Risk Analytics:** ward risk cards, forecast explanation, and analysis export.
- **Sensor Health:** device health summary, battery and signal indicators, and sensor report export.
- **Citizen Reports:** public-reported drainage issues correlated with sensor points.
- **Settings:** operating context, alert thresholds, notification mode, role switching, crew selection, and founder profile.
- **Founder profile:** a branded card and portfolio link for Anbumathi Chezhian.M. Hovering or focusing the card reveals featured IoT project names including Simple Hackpad, DARK SIGNAL, RaspCamX, WinXport, and ASTRADEV.

## Technology stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Frontend | React 19, TypeScript | Component-based interface and state management |
| Styling | Tailwind CSS 4 and project CSS tokens | Responsive dark control-room visual system |
| Icons | Lucide React | Consistent operational iconography |
| Routing | Wouter | Lightweight client-side view routing |
| Data fetching | TanStack Query and tRPC React | Typed queries, mutations, caching, and invalidation |
| Backend | Express 4 and tRPC 11 | HTTP server and typed API procedures |
| Database | MySQL-compatible database or TiDB | Persistent users, assignments, statuses, history, and JARVIS logs |
| ORM | Drizzle ORM and Drizzle Kit | Type-safe schema and migration generation |
| Map | Google Maps JavaScript API | Native Chennai road map and map controls |
| AI | Server-side ChatGPT integration with secure SSOP fallback | JARVIS questions and operational explanations |
| Voice | Web Speech API | Browser speech synthesis and microphone recognition |
| Storage | Project storage helpers and S3-compatible references | User-uploaded media and file references where enabled |
| Testing | Vitest and TypeScript compiler | Contract checks and static validation |
| Build | Vite and esbuild | Production frontend and backend bundles |

## Repository structure

```text
.
├── client/
│   ├── index.html
│   ├── public/
│   └── src/
│       ├── components/       # Shared UI, map, layout, and shadcn components
│       ├── contexts/         # Theme and app contexts
│       ├── hooks/            # Reusable React hooks
│       ├── lib/              # tRPC and utility clients
│       ├── pages/
│       │   └── Home.tsx      # Main SSOP dashboard and view workflows
│       └── index.css         # SSOP theme and component styling
├── drizzle/
│   ├── schema.ts             # MySQL/TiDB table definitions
│   ├── relations.ts
│   ├── migrations/           # Migration directory used by Drizzle Kit
│   ├── 0000_*.sql
│   ├── 0001_*.sql
│   ├── 0002_*.sql
│   ├── 0003_*.sql
│   └── 0004_*.sql             # JARVIS assignment activity log
├── server/
│   ├── _core/                # WebDev framework, auth, LLM, maps, storage, and server helpers
│   ├── db.ts                 # Database query and mutation helpers
│   ├── routers.ts            # tRPC application procedures
│   ├── storage.ts
│   └── *.test.ts             # Vitest coverage
├── shared/                   # Shared constants and types
├── package.json
├── pnpm-lock.yaml
├── drizzle.config.ts
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Database model

The current schema contains the following entities:

| Table | Purpose |
| --- | --- |
| `users` | OAuth-backed user identity, role, and sign-in metadata |
| `employee_profiles` | Crew login profiles and display names |
| `ticket_assignments` | Current persisted crew assignment for each ticket |
| `ticket_statuses` | Current persisted status and status-update source |
| `ticket_history` | Approved and archived ticket closure records |
| `jarvis_assignment_logs` | Append-only autonomous JARVIS assignment activity |

All business timestamps are stored as database timestamps. The UI converts them to the operator's local display timezone, with SSOP operational displays using Asia/Kolkata where specified.

## Backend API surface

The tRPC router is defined in `server/routers.ts`.

### Authentication

- `auth.me` returns the current OAuth user when available.
- `auth.logout` clears the active session cookie.

### JARVIS

- `jarvis.ask` accepts a question and optional live SSOP context, then returns the answer and provider label.

### Workforce

- `workforce.profiles` lists employee profiles.
- `workforce.assignments` lists persisted ticket assignments.
- `workforce.seedProfiles` creates or updates the four crew profiles.
- `workforce.assign` creates or updates the current assignment for a ticket.
- `workforce.statuses` lists persisted ticket statuses.
- `workforce.updateStatus` creates or updates a ticket status.
- `workforce.jarvisAssignments` lists autonomous assignment history newest first.
- `workforce.recordJarvisAssignment` records a confirmed autonomous assignment.

### Ticket history

- `ticketHistory.list` lists archived closure records.
- `ticketHistory.recordApproval` stores a complete approved-ticket record and serialized proof-photo references.

The current prototype keeps several procedures public to support its local role-switching workflow. A production version should use protected procedures and an Admin-only middleware for assignment, status, and approval mutations.

## Local development

### Prerequisites

Install the following before starting local development:

- Node.js 20 or newer.
- pnpm 10 or a compatible pnpm release.
- A MySQL-compatible database or TiDB instance for persistent workflows.
- A Google Maps JavaScript API key with the required Maps JavaScript API enabled.
- Optional ChatGPT credentials if external JARVIS responses are required.

### Install dependencies

```bash
pnpm install
```

### Configure environment variables

Create a local `.env.local` file for development. It is ignored by Git and must never be committed.

```dotenv
DATABASE_URL=mysql://user:password@host:3306/database
JWT_SECRET=replace-with-a-long-random-secret
VITE_APP_ID=your-manus-oauth-app-id
OAUTH_SERVER_URL=https://api.manus.im
OWNER_OPEN_ID=your-owner-open-id
BUILT_IN_FORGE_API_URL=your-built-in-forge-api-url
BUILT_IN_FORGE_API_KEY=your-built-in-forge-api-key
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
OPENAI_API_KEY=optional-server-side-key
```

For a managed WebDev deployment, configure the publish-time secrets through the project secret manager instead of editing `.env.local`. In particular, keep `VITE_GOOGLE_MAPS_API_KEY` editable as a managed secret so the map key can be rotated and the project republished without changing source code.

### Apply database migrations

Generate a migration after changing `drizzle/schema.ts`, review the SQL, and apply it to the configured database.

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

The convenience script combines these operations:

```bash
pnpm db:push
```

Never use production data as test fixtures. The migration history currently includes the `jarvis_assignment_logs` table in `drizzle/0004_parched_moonstone.sql`.

### Start the development server

```bash
pnpm dev
```

The Vite and Express development server serves the application on the configured local port, normally `http://localhost:3000`.

## Quality checks

Run the standard checks before opening a pull request or deploying:

```bash
pnpm check
pnpm test
pnpm build
```

The current test suite covers authentication logout behavior, Google Maps configuration, JARVIS contracts and assignment-log query exposure, and OpenAI credential validation. The build produces the frontend under `dist/public` and the bundled server entrypoint under `dist/index.js`.

## Production workflow

Build the application first:

```bash
pnpm build
```

Start the generated server with:

```bash
pnpm start
```

Before publishing, verify that the database migration has been applied, the managed Google Maps key is present, optional AI credentials are configured server-side, and no `.env*` file or credential has entered Git. The WebDev project uses its managed deployment and checkpoint workflow for publishing. The Git repository is the source-control backup and collaboration channel; it does not replace managed secrets or database configuration.

## Security and privacy notes

The prototype contains a password-protected role switcher for demonstration purposes. The password is intentionally defined by the prototype requirement and is not suitable for production authentication. Replace it with real identity-based authorization before municipal deployment.

Google Maps and ChatGPT credentials must remain in managed secrets or server-side environment variables. Do not place private API keys in React source, browser storage, issue comments, or committed environment files.

Assignment and status mutations should be protected with authenticated server-side authorization in a production deployment. Client-side role hiding improves the prototype experience but is not an authorization boundary.

Proof photos may contain sensitive location or personnel information. A production system should use private object storage, access-controlled signed URLs, retention policies, malware scanning, and an audit trail for every view and approval.

The map sewer points are illustrative when exact municipal asset coordinates are unavailable. They must not be treated as authoritative infrastructure data without validation against the municipality's asset registry.

The browser voice features depend on Web Speech API support and user microphone permission. Voice commands require confirmation in the interface, but operators should still review the target ticket and crew before accepting an action.

JARVIS standby is deliberately opt-in. A browser application cannot silently obtain microphone permission or promise uninterrupted device-wide listening. The wake-word detector runs through the browser's speech-recognition implementation while the SSOP page is open. It does not upload continuous raw microphone audio to SSOP; only text after the wake word is sent to the assistant workflow.

The September 2026 security review removed the local `.env.local` file containing the development Google Maps key and moved Admin passcode verification to the server-side `SSOP_ADMIN_PASSCODE` secret. The repository scan found no committed Google, OpenAI, Twilio, or bearer-token credential. The Maps key is a browser-facing API key by design and must still be restricted by Google Cloud application and API restrictions.

The project retains prototype authorization limitations. Several workforce and ticket-history procedures use public tRPC procedures so the local role-switching demonstration continues to work without OAuth login. A production deployment must replace that convenience with authenticated, server-side role checks, rate limiting for `jarvis.ask`, and protected assignment, status, approval, and activity-log mutations.

## Operational workflow

1. An operator signs in to the Admin or Employee workspace.
2. The Admin reviews the Overview, Alerts, map points, and active ticket queue.
3. Open tickets receive persisted round-robin crew assignments when no assignment exists.
4. The Admin may ask JARVIS for an explanation or issue a confirmed assignment or status command.
5. JARVIS persists every autonomous assignment in the assignment table and activity log.
6. The selected employee sees only that crew's assigned tasks.
7. The employee opens a ticket, adds field updates, uploads proof photos, and submits the work for verification.
8. The Admin reviews the notification thumbnail and closure details.
9. Approval archives the ticket in `ticket_history`, removes it from active work, and updates the operational counters.
10. Operators can later inspect the closure record and JARVIS assignment activity for audit and reporting.

## Known prototype limitations

The current data set is a demonstration data set and does not represent a live municipal sensor fleet. Sensor telemetry, citizen reports, ward risk values, and sewer coordinates require integration with authoritative municipal systems.

The role switcher is a prototype convenience and does not replace production authentication. Browser speech recognition varies by browser and device. The application does not currently provide a production-grade notification broker, offline field mode, multi-tenant municipal separation, or a full incident-management escalation policy.

## Founder

SSOP was developed by **Anbumathi Chezhian.M**, an Electronics & IoT Developer. Featured project references in the interface include Simple Hackpad, DARK SIGNAL, RaspCamX, WinXport, and ASTRADEV.

Visit the [founder portfolio](https://v0-anbumathi-chezhian-2203.vercel.app/) for the broader project profile.

## References

[1]: https://react.dev/ "React documentation"
[2]: https://vite.dev/ "Vite documentation"
[3]: https://trpc.io/docs/ "tRPC documentation"
[4]: https://orm.drizzle.team/docs/overview "Drizzle ORM documentation"
[5]: https://developers.google.com/maps/documentation/javascript/overview "Google Maps JavaScript API documentation"
[6]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API "MDN Web Speech API reference"
[7]: https://vitest.dev/guide/ "Vitest documentation"
