# Break My System - Architecture

## Overview

Break My System is a full-stack Next.js application that provides interactive system design learning experiences. The architecture follows a client-server model with a deterministic exercise engine and optional AI enhancement.

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Browser Client                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ Home Page    │  │  Workspace   │  │  Debrief  │ │
│  │ (Exercise    │  │  (3-panel    │  │  (Scoring │ │
│  │  Catalog)    │  │   Layout)    │  │   & Viz)  │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
│         │                  │                 │       │
│         └──────────────────┴─────────────────┘       │
│                        │                              │
│                   React/Next.js                       │
└────────────────────────┬────────────────────────────┘
                         │ HTTP/JSON
┌────────────────────────┴────────────────────────────┐
│               Next.js API Routes                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ /exercises│  │ /sessions│  │ /progress        │  │
│  │          │  │ /messages│  │                  │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
│                        │                             │
│  ┌─────────────────────┴──────────────────────────┐ │
│  │         Exercise Engine                        │ │
│  │  ┌─────────────┐  ┌────────────────────────┐  │ │
│  │  │ State       │  │ Demo Interviewer       │  │ │
│  │  │ Machine     │  │ (Deterministic)        │  │ │
│  │  └─────────────┘  └────────────────────────┘  │ │
│  │                                                │ │
│  │  ┌────────────────────────────────────────┐   │ │
│  │  │ Exercise Definitions (Version Controlled) │ │
│  │  │ - 6 complete exercises                    │ │
│  │  │ - Stories, failures, hints, rubrics       │ │
│  │  └────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────┘ │
│                        │                             │
│          Optional: OpenAI API (AI Interviewer)      │
│                        │                             │
└────────────────────────┴────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────┐
│              Prisma ORM + SQLite                     │
│  ┌──────┐  ┌──────────┐  ┌────────┐  ┌──────────┐ │
│  │ User │  │ Exercise │  │Session │  │ Message  │ │
│  └──────┘  └──────────┘  └────────┘  └──────────┘ │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │ Diagram  │  │ Debrief  │  │ Progress Record  │ │
│  └──────────┘  └──────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## Key Components

### Frontend (Next.js App Router)

**Pages:**
- `/` - Home page with exercise catalog and progress summary
- `/workspace/[sessionId]` - Exercise workspace (3-panel layout)
- `/debrief/[sessionId]` - Debrief with scoring and visualization

**Components:**
- `DiagramEditor` - Canvas-based architecture diagramming
- `RetryWaveViz` - Recharts visualization for retry storms
- Mobile-responsive with tabbed layout

### API Layer (Next.js API Routes)

**Endpoints:**
- `GET /api/exercises` - List all exercises
- `POST /api/sessions` - Create or resume session
- `GET /api/sessions/[id]` - Get session details
- `POST /api/sessions/[id]/messages` - Send message, get interviewer response
- `POST /api/sessions/[id]/stage` - Advance to next stage
- `POST /api/sessions/[id]/diagram` - Save diagram
- `GET /api/progress` - Get user progress

### Exercise Engine

**State Machine:**
- Deterministic progression: `SCENARIO → CLARIFY → INITIAL_DESIGN → FAILURE_INJECTION → ADAPTATION → CONCEPT_REVEAL → SOFTWARE_TRANSLATION → DEBRIEF → COMPLETE`
- No AI control over stage transitions
- Explicit user action required to advance

**Demo Interviewer:**
- Deterministic responses based on stage and input keywords
- Detects reasoning signals and misconceptions
- Provides hints at 3 levels
- Fallback when OpenAI API unavailable

**AI Interviewer (Optional):**
- Uses OpenAI GPT-4 mini for natural conversation
- Structured JSON responses validated with Zod
- Falls back to Demo Interviewer on errors

### Exercise Definitions

Exercises are **version-controlled TypeScript objects** (not database-only):

```typescript
interface ExerciseDefinition {
  id: string
  title: string
  setting: string
  openingStory: string
  stagePrompts: { ... }
  clarifyingQuestionChips: string[]
  hints: Hint[]
  failureScenarios: FailureScenario[]
  conceptReveal: ConceptReveal
  softwareTranslation: SoftwareTranslation
  debriefRubric: DebriefRubric
  reasoningSignals: string[]
  misconceptions: string[]
}
```

All six exercises have complete content with no placeholders.

### Database Schema (Prisma + SQLite)

**Models:**
- `User` - Guest user (no auth in MVP)
- `Exercise` - Basic exercise metadata synced from definitions
- `ExerciseSession` - Active or completed exercise attempts
- `Message` - Conversation history
- `DiagramNode` - Architecture diagram nodes
- `DiagramEdge` - Connections between nodes
- `Debrief` - Scoring and feedback (future)
- `ProgressRecord` - Per-exercise progress tracking

**Data Flow:**
1. Exercise definitions → Seed script → Database
2. User starts exercise → Create session
3. Every interaction persisted immediately
4. Diagram auto-saves on change
5. Session survives browser refresh

## Design Decisions

### Why SQLite?
- **MVP simplicity**: No server setup required
- **Portable**: Single file database
- **Future migration**: Prisma makes PostgreSQL migration trivial

### Why Demo Interviewer?
- **No API key required**: App works immediately
- **Deterministic**: Consistent behavior for testing
- **Graceful degradation**: Fallback for AI failures

### Why Version-Controlled Exercises?
- **Code review**: Exercise content changes are peer-reviewed
- **Type safety**: Zod validation catches errors
- **No CMS needed**: Simpler for MVP

### Why Deterministic State Machine?
- **Predictable**: No AI hallucination of curriculum
- **Testable**: State transitions are unit-testable
- **Pedagogical control**: Authors control learning path

## Security Considerations

### MVP State (No Auth)
- Single guest user
- No sensitive data
- No authorization checks

### Production Recommendations
- Add authentication (NextAuth.js)
- Add CSRF protection
- Rate limit API endpoints
- Sanitize user inputs
- Environment variable validation
- Encrypt API keys

## Performance

### Optimizations
- Server-side rendering for initial load
- Automatic session persistence (no explicit save button)
- Diagram debouncing (auto-save on change)
- React Query for data fetching (future)

### Bottlenecks
- SQLite limits concurrent writes (OK for MVP, not production)
- OpenAI API latency (mitigated by Demo Interviewer fallback)
- No caching layer (Redis recommended for production)

## Testing Strategy

**Unit Tests:**
- State machine transitions
- Exercise validation (Zod schemas)
- Demo interviewer logic

**Integration Tests:**
- API endpoints (mocked database)
- Session persistence
- Diagram CRUD

**E2E Tests (Future):**
- Complete exercise flow
- Browser refresh resume
- Mobile responsiveness

## Deployment

### Local Development
```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

### Production Recommendations
- **Hosting**: Vercel (Next.js native)
- **Database**: Migrate to PostgreSQL (Supabase, Railway, Neon)
- **Environment**: Separate dev/staging/prod databases
- **Monitoring**: Sentry for errors, Vercel Analytics
- **CI/CD**: GitHub Actions for tests + deploy

## Future Architecture Enhancements

1. **Caching Layer**: Redis for session data
2. **Message Queue**: For async AI responses
3. **CDN**: For static assets
4. **Analytics**: PostHog or Mixpanel
5. **Real-time**: WebSockets for collaborative mode
6. **Search**: Algolia for exercise discovery
7. **Auth**: NextAuth.js with multiple providers

## Code Organization

```
/app                    # Next.js 15 App Router
  /api                 # Server-side API routes
  page.tsx             # Home page
  layout.tsx           # Root layout
  globals.css          # Global styles

/components            # Reusable React components
  DiagramEditor.tsx   # Canvas diagram builder
  RetryWaveViz.tsx    # Recharts visualization

/lib                   # Business logic (server-side)
  /exercises          # Exercise definitions
    types.ts          # Zod schemas
    index.ts          # Exports all exercises
    airport-bathroom.ts
    pizza-shop.ts
    ... (6 exercises)
  db.ts               # Prisma client singleton
  state-machine.ts    # Stage transition logic
  demo-interviewer.ts # Interviewer responses

/prisma
  schema.prisma       # Database schema
  seed.ts            # Initial data

/__tests__            # Jest unit tests
  state-machine.test.ts
  exercises.test.ts
  demo-interviewer.test.ts
  api.test.ts
```

## Conclusion

The architecture balances **MVP simplicity** with **production readiness**. The deterministic exercise engine and Demo Interviewer ensure the app works immediately without external dependencies, while optional AI enhancement provides a premium experience. The version-controlled exercise definitions enable rigorous content quality control.
