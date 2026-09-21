# Break My System

**Build it. Break it. Understand it.**

An interactive system-design learning tool that teaches experienced engineers system design concepts through real-world scenarios, failures, and adaptations.

## Features

- 🎯 **6 Complete Exercises** covering core distributed systems concepts
- 🎨 **Interactive Workspace** with 3-panel design (scenario, conversation, diagram)
- 🤖 **Demo Interviewer** works without OpenAI API key (AI interviewer optional)
- 📊 **Retry Wave Visualization** for understanding retry storms
- 💾 **Session Persistence** - resume exercises after browser refresh
- 🏗️ **Diagram Editor** for sketching architectures
- 📈 **Progress Tracking** with debrief and scoring

## Exercises

1. **Airport Bathroom Disaster** - Rate limiting, backpressure, graceful degradation
2. **Pizza Shop Meltdown** - Bottleneck analysis, throughput vs latency, batching
3. **Concert Wristband Chaos** - Consistency, caching, idempotency, CAP theorem
4. **Shopping Cart Under Stress** - Race conditions, locking strategies, hot keys
5. **Retry Army** - Retry storms, exponential backoff, circuit breakers
6. **Double-Charged Customer** - Idempotency, exactly-once semantics, distributed transactions

## Installation

### Prerequisites

- Node.js 18+ and npm

### Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Initialize database and seed data
npx prisma db push
npm run db:seed

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## Usage

1. Open the home page to see all exercises
2. Click "Start" on any exercise to begin
3. Work through the stages: scenario → clarify → design → failure → adapt → concepts → debrief
4. Use the diagram editor to sketch your architecture
5. Sessions automatically save - refresh anytime to resume

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma + SQLite (portable to PostgreSQL)
- **Validation**: Zod
- **Charts**: Recharts
- **AI (Optional)**: OpenAI API for interviewer responses

## Project Structure

```
/app                 # Next.js app router pages
  /api              # API routes
  /workspace        # Exercise workspace page
  /debrief          # Debrief page
/components         # React components
/lib                # Core logic
  /exercises        # Exercise definitions
  state-machine.ts  # Stage progression
  demo-interviewer.ts # Deterministic interviewer
/prisma             # Database schema and seed
/__tests__          # Jest tests
```

## Development Commands

```bash
npm run dev         # Start dev server
npm run build       # Production build
npm run start       # Start production server
npm run lint        # Run ESLint
npm test            # Run tests
npm run typecheck   # TypeScript type checking
npm run db:studio   # Open Prisma Studio
```

## AI Interviewer (Optional)

To enable the AI interviewer with natural conversation:

1. Get an OpenAI API key from https://platform.openai.com
2. Add to `.env`:
   ```
   OPENAI_API_KEY=sk-...
   ```
3. Restart the dev server

Without an API key, the app uses the **Demo Interviewer** which provides deterministic, helpful responses based on the exercise stage and your input.

## Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test state-machine

# Watch mode
npm run test:watch
```

## MVP Limitations

This is an MVP focused on demonstrating the core concept. Known limitations:

- **No authentication** - single guest user only
- **No user accounts** - progress not synced across devices
- **SQLite database** - suitable for local dev, not production scale
- **Limited mobile optimization** - desktop-first design
- **No exercise analytics** - no aggregated learner insights
- **Demo interviewer is simple** - AI interviewer provides better experience
- **Debrief scoring is mock** - would need ML model for real assessment
- **No content editor** - exercises are code-defined, not CMS-managed
- **Limited accessibility features** - would need ARIA labels, keyboard nav improvements
- **No exercise hints tracking** - doesn't remember which hints you've seen

## Future Enhancements

- User accounts and progress sync
- More exercises covering additional patterns
- Adaptive difficulty based on performance
- Community-contributed exercises
- Real-time collaboration mode
- Mobile-optimized UI
- Production database (PostgreSQL)
- Advanced analytics dashboard

## Architecture

See [docs/architecture.md](docs/architecture.md) for detailed system design.

## Contributing

This is an MVP demonstration. For production use, consider:

- Adding proper authentication
- Migrating to PostgreSQL
- Implementing real debrief scoring logic
- Adding accessibility features
- Comprehensive error handling
- Rate limiting for AI API calls
- Improved mobile responsiveness

## License

MIT
