import { ExerciseDefinition } from './types'

export const concertWristbandExercise: ExerciseDefinition = {
  id: 'concert-wristband",
  title: "Concert Wristband Chaos",
  setting: "Music festival with RFID wristbands and multiple entry gates",
  conceptsPreview: "Consistency, caching, idempotency, partition tolerance",
  duration: 40,
  ordinal: 3,
  openingStory: `You"re managing entry operations for SummerSound Festival - 50,000 attendees over 3 days. Each person gets an RFID wristband at will-call that grants access.

Your system:
- 8 entry gates, each with an RFID scanner
- Central database of valid wristbands
- Each gate has local Wi-Fi that connects to the central system
- VIP and GA (general admission) wristbands, with VIP accessing special areas

Day 1, 4 PM - gates open. Within 30 minutes, you're getting reports:
- Gate 3: Scanner keeps rejecting Sarah's valid VIP wristband
- Gate 7: A person scanned in, left to get food, came back - scanner says they're 'already inside"
- Gate 5: Someone"s GA wristband just let them into the VIP area
- Gate 2: Scanner is running 'slow" - taking 5 seconds per scan instead of 1 second

Then, the festival WiFi has a brief hiccup. For 30 seconds, gates can"t reach the central database. When it comes back, Gate 6 has let in 50 people with wristbands that were reported stolen yesterday.

What's going wrong?`,
  objectives: 'Design a distributed system with multiple entry points, handle network partitions, and ensure consistency while maintaining good user experience.",
  constraints: "Network can be unreliable, multiple gates operate independently, must handle duplicate scans, VIP vs GA access levels, stolen/invalid wristbands.",
  stagePrompts: {
    scenario: "You"ve just read about the festival wristband system. What patterns do you notice in these failures?',
    clarify: "What questions would help you understand how the wristband system should work?",
    initialDesign: "Design a system for managing wristband validation across multiple gates. How do you handle the consistency requirements?",
    failureInjection: "Your new system is live. Day 2 of the festival: A network switch fails, cutting off gates 4, 5, and 6 from the central database for 10 minutes. During this time, someone tries to scan in with a wristband that was just reported stolen from the merchandise tent. What happens?",
    adaptation: "How do you modify your design to handle these network partitions safely?",
    conceptReveal: "Let"s explore the distributed systems concepts you've encountered.',
    softwareTranslation: "Now let"s connect your wristband system to real distributed software architecture.'
  },
  clarifyingQuestionChips: [
    'Should someone be able to enter multiple times?',
    'How fast must each scan be?',
    'What happens if network is down?',
    'How fresh must the stolen wristband list be?',
    'Do gates need to sync with each other?'
  ],
  hints: [
    {
      level: 1,
      content: 'Think about what each gate can do independently vs what requires coordination with the central system. What decisions can be made locally?'
    },
    {
      level: 2,
      content: "Consider: If Gate 3 has an old cache of VIP wristbands, and someone's VIP status was revoked 5 minutes ago, should they get in? How fresh does your data need to be?"
    },
    {
      level: 3,
      content: "Key insight: This is the CAP theorem in action. During a network partition, you must choose: (C)onsistency - don't let anyone in when you can"t verify, or (A)vailability - keep letting people in with cached data. You can't have both during the partition.'
    }
  ],
  failureScenarios: [
    {
      trigger: 'Network switch failure partitions gates 4, 5, 6 from central database",
      description: "Gates lose connection for 10 minutes. A stolen wristband tries to enter.",
      impact: "If gates cache "valid" status, the stolen wristband gets in. If gates require online validation, all three gates stop working entirely and long queues form. Some people give up and leave, despite having valid tickets."
    }
  ],
  conceptReveal: {
    title: 'Consistency, Caching, Idempotency & CAP Theorem",
    explanation: `You"ve experienced fundamental distributed systems challenges:

**Consistency**: When multiple gates access the same data, how do you ensure they all see the same state? If Gate 3 caches that a wristband is valid, but the central system revokes it, you have stale data.

**Eventual Consistency**: The alternative to strong consistency. Gates might have slightly old data, but they'll eventually catch up. This enables operation during network issues, but means temporary inconsistencies.

**Caching & Invalidation**: Gates cache wristband validity for performance (faster scans). But 'there are only two hard things in Computer Science: cache invalidation and naming things." How do you know when your cache is stale?

**Idempotency**: Scanning the same wristband twice should have the same effect as scanning it once. This is idempotency - the operation can be repeated safely. If your system breaks when someone scans twice, it"s not idempotent.

**CAP Theorem**: During a network partition, you must choose between:
- (C)onsistency: All gates see the same data, but might have to stop working if they can't reach the database
- (A)vailability: All gates keep working, but might make decisions on stale data
You can't have both during a partition. What's the right choice for a festival?`,
    whyItMatters: 'Every distributed system faces these tradeoffs. Mobile apps, microservices, CDNs - they all must decide: when the network fails, do we stop working (consistent but unavailable) or keep working with potentially stale data (available but eventually consistent)?'
  },
  softwareTranslation: {
    analogyToSoftware: [
      {
        analogy: 'Entry gate with scanner",
        software: "API endpoint or service instance",
        example: "One of many Node.js servers behind a load balancer"
      },
      {
        analogy: 'Central wristband database",
        software: "Primary database or source of truth",
        example: "PostgreSQL primary database"
      },
      {
        analogy: "Gate's local cache",
        software: "Redis cache or local in-memory cache",
        example: "Each server has Redis cache of user auth tokens"
      },
      {
        analogy: 'Wi-Fi network connection",
        software: "Network between services",
        example: "Connection between API servers and database, or between microservices"
      },
      {
        analogy: 'Duplicate scan detection",
        software: "Idempotency keys or deduplication",
        example: "Payment API rejecting duplicate transaction IDs"
      },
      {
        analogy: 'Stolen wristband list",
        software: "Revocation list or blacklist",
        example: "List of revoked JWT tokens or banned users"
      }
    ],
    commonPatterns: [
      'Cache-aside: Read from cache, fall back to database on miss',
      'Write-through cache: Update cache and database together',
      'TTL (Time To Live): Cache expires after N seconds',
      'Cache stampede prevention: Only one request fetches on miss',
      'Read replicas: Scale reads, but they lag behind primary (eventual consistency)',
      'Idempotency keys: Client sends unique ID, server dedupes',
      'Circuit breaker: Stop calling failing service, fail fast'
    ],
    antiPatterns: [
      'Cache forever: Stale data never refreshes',
      'No cache validation: Never check if cache is still accurate',
      'Synchronous cross-service calls: One slow service slows everything',
      'Blindly retry on network errors: Creates duplicate operations',
      'Assume network is reliable: No fallback plan for partitions'
    ]
  },
  debriefRubric: {
    clarifySignals: [
      'Asked about consistency requirements',
      'Inquired about acceptable latency and staleness',
      'Considered network failure scenarios',
      'Thought about idempotency and duplicate operations'
    ],
    bottleneckSignals: [
      'Identified network latency as a constraint',
      'Recognized central database as a bottleneck or single point of failure',
      'Spotted cache invalidation challenges',
      'Understood partition scenarios'
    ],
    adaptSignals: [
      'Proposed caching with appropriate TTL',
      'Suggested eventual consistency with conflict resolution',
      'Recommended idempotency mechanisms',
      'Considered graceful degradation during network failures'
    ],
    tradeoffSignals: [
      'Discussed consistency vs availability tradeoffs (CAP)',
      'Balanced security (no stolen wristbands) vs user experience (fast entry)',
      'Considered cost of synchronization vs risk of stale data',
      'Mentioned operational complexity of distributed consensus'
    ],
    softwareSignals: [
      'Mapped gates to service instances or API endpoints',
      'Named caching technologies and strategies',
      'Connected to real scenarios like auth tokens, distributed databases',
      'Understood CAP theorem and its practical implications'
    ],
    modelAnswer: 'Strong answer: Use cache-aside pattern with short TTL (e.g., 30 seconds) for positive validations (valid wristbands), but always check central database for revocations/blacklist. Make entry idempotent - scanning twice is safe. During network partition, allow entry with cached positive validations but deny unknown wristbands (fail closed for security). Monitor cache hit rates and sync lag. In software: Redis cache with TTL, idempotency keys, circuit breakers, eventual consistency with bounded staleness, separate treatment for blacklists (strongly consistent) vs normal reads (eventually consistent).",
    transferQuestion: "You"re building a mobile banking app. Users can check their balance offline using cached data. But when they transfer money, it must hit the real backend. How do you design this? What data can be cached? For how long? What happens if the network is down?',
    commonMisconceptions: [
      'Believing strong consistency is always necessary',
      'Thinking caching solves all performance problems',
      'Assuming network is reliable',
      'Not considering idempotency for safety'
    ]
  },
  reasoningSignals: [
    'CAP theorem understanding',
    'cache invalidation strategy',
    'idempotency design',
    'partition tolerance',
    'eventual consistency acceptance'
  ],
  misconceptions: [
    'perfect consistency always needed',
    'cache never goes stale',
    'network never fails',
    'duplicate operations are impossible'
  ]
}
