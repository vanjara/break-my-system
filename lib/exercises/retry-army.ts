import { ExerciseDefinition } from './types'

export const retryArmyExercise: ExerciseDefinition = {
  id: 'retry-army",
  title: "Retry Army",
  setting: "City taxi dispatch after stadium event",
  conceptsPreview: "Retry storms, exponential backoff, thundering herd",
  duration: 40,
  ordinal: 5,
  openingStory: `You run the backend for RideNow, a popular taxi app. It"s 10:30 PM, and a major concert just ended at the stadium - 40,000 people flooding out at once.

Your system:
- Mobile app sends 'find me a ride" request to dispatch service
- Dispatch service checks available drivers and matches them
- If no drivers available, app auto-retries after 2 seconds
- Dispatch service can handle 5,000 requests/second normally

10:30 PM: Concert ends. 15,000 people open the app simultaneously.

10:30:05 PM: Your dispatch service has a brief hiccup (database connection pool exhausted for 3 seconds).

What happens next is catastrophic:

10:30:05-10:30:08: All 15,000 pending requests timeout and fail.

10:30:08: All 15,000 apps retry at the same time (synchronized by the 3-second outage).

10:30:10: Those 15,000 requests fail again (system is overloaded by the retry wave). They all retry again 2 seconds later.

10:30:12: Now you have 15,000 retries + 5,000 new requests = 20,000 requests at once.

10:30:14: Retry wave grows to 25,000 simultaneous requests.

Your system is now in a **retry storm**. Instead of recovering, each retry wave makes the problem worse. The dispatch service completely locks up. Your on-call engineer"s pager is melting.

How did a 3-second blip turn into a 20-minute outage?`,
  objectives: 'Understand retry amplification, design safe retry strategies with exponential backoff and jitter, and implement circuit breakers to prevent cascading failures.",
  constraints: "High concurrent clients, network timeouts, limited server capacity, external dependencies, client-side retry logic.",
  stagePrompts: {
    scenario: "You"ve read about the retry storm. What's the core mechanism that makes it worse?',
    clarify: "What would you want to know about the client retry behavior and server capacity?",
    initialDesign: "Design a retry strategy that prevents these synchronized retry waves. How do clients and servers coordinate?",
    failureInjection: "Your new retry strategy is deployed. New Year"s Eve: 50,000 people at a fireworks show all try to get rides at midnight. Your dispatch service briefly slows down (latency spikes to 10 seconds due to database query). What happens with your new retry logic?',
    adaptation: "How do you refine your design to handle latency spikes, not just outages?",
    conceptReveal: "Let"s explore the distributed systems concepts behind retry storms.',
    softwareTranslation: "Now let"s map your retry strategies to real software resilience patterns.'
  },
  clarifyingQuestionChips: [
    'How do clients decide when to retry?',
    'Can we tell clients to back off?',
    'Should retries be randomized?',
    "How do we detect we're in a retry storm?",
    'Can we shed load intentionally?'
  ],
  hints: [
    {
      level: 1,
      content: 'Notice how the brief outage synchronized all clients. They all failed at the same moment, so they all retry at the same moment. This synchronization is the killer.'
    },
    {
      level: 2,
      content: "Think about exponential backoff: retry after 1s, then 2s, then 4s, then 8s. But if everyone starts with 1s, they're still synchronized! You need jitter - randomization."
    },
    {
      level: 3,
      content: 'Key insight: Sometimes the best thing to do is NOT retry. Circuit breakers detect when a service is failing and stop sending requests, giving it time to recover. You "fail fast" instead of adding to the pile."
    }
  ],
  failureScenarios: [
    {
      trigger: '50,000 concurrent users at midnight, dispatch service latency spike to 10s",
      description: "High load + latency spike causes some requests to timeout. Clients retry.",
      impact: "Even with exponential backoff, if timeouts are too short, clients interpret latency spike as failure and retry. This adds more load, making latency worse. Positive feedback loop. Without circuit breakers, system thrashes."
    }
  ],
  conceptReveal: {
    title: 'Retry Storms, Exponential Backoff, Jitter & Circuit Breakers",
    explanation: `You"ve discovered how retries can destroy a system:

**Retry Storms**: When many clients retry simultaneously, they create a wave of traffic that can overload a recovering system. Each failure triggers more retries, creating a positive feedback loop. The system can't recover because it's drowning in retry traffic.

**Exponential Backoff**: Instead of retrying every 2 seconds (1, 2, 3, 4, 5...), retry with exponentially increasing delays (1, 2, 4, 8, 16...). This gives the system breathing room to recover.

**Jitter**: Adding randomization to retry delays. Instead of retrying after exactly 4 seconds, retry after 3-5 seconds (random). This desynchronizes clients and prevents thundering herd.

**Thundering Herd**: When many clients wait for the same event (like a service coming back online) and all act simultaneously. The stadium concert is a physical thundering herd; synchronized retries are a digital one.

**Circuit Breakers**: Stop sending requests when a service is failing. States: CLOSED (normal), OPEN (failing, reject immediately), HALF-OPEN (trying to recover, allow limited requests). This prevents retry storms and lets the service recover.

**Load Shedding**: When overloaded, intentionally reject some requests (e.g., return 503 Service Unavailable) to stay operational for others. Better to serve 80% well than 0% poorly.

**Backpressure**: Explicitly telling clients to slow down. HTTP 429 (Too Many Requests) or Retry-After headers signal 'wait before retrying."`,
    whyItMatters: "Retry storms have taken down major services: AWS, Azure, Google have all experienced these. A brief outage turns into hours of downtime because retry logic amplifies the problem. Good retry strategies and circuit breakers are essential for resilient distributed systems."
  },
  softwareTranslation: {
    analogyToSoftware: [
      {
        analogy: 'Synchronized concert-ending exodus",
        software: "Thundering herd / synchronized client behavior",
        example: "Cache expiry at exactly noon, all clients refresh simultaneously"
      },
      {
        analogy: 'App auto-retry after 2 seconds",
        software: "Client-side retry logic",
        example: "HTTP client retrying failed requests, mobile app retry loops"
      },
      {
        analogy: 'Brief dispatch service hiccup",
        software: "Temporary service degradation",
        example: "Database slow query, memory spike, network blip"
      },
      {
        analogy: 'Retry waves overwhelming dispatch",
        software: "Retry storm / amplification",
        example: "Failing service drowning in retry traffic"
      },
      {
        analogy: 'Exponential backoff (1s, 2s, 4s, 8s)",
        software: "Exponential backoff algorithm",
        example: "AWS SDK retry logic, gRPC default backoff"
      },
      {
        analogy: 'Random retry jitter",
        software: "Jitter in backoff calculations",
        example: "retry_delay = base * 2^attempt + random(0, 1000)ms"
      },
      {
        analogy: 'Stopping retries when system is down",
        software: "Circuit breaker pattern",
        example: "Netflix Hystrix, resilience4j, or cloud provider circuit breakers"
      }
    ],
    commonPatterns: [
      'Exponential backoff: min(MAX_DELAY, BASE * 2^attempt)',
      'Full jitter: random(0, exponential_backoff)',
      'Decorrelated jitter: More sophisticated randomization',
      'Circuit breaker: CLOSED → OPEN (on failures) → HALF-OPEN (test) → CLOSED',
      'Timeout configuration: Set timeouts longer than service p99 latency',
      'Retry budgets: Limit total retry rate (e.g., max 10% extra traffic from retries)',
      'Bulkheads: Isolate retry logic per dependency',
      'Fail fast: Return error immediately instead of queuing doomed requests'
    ],
    antiPatterns: [
      'Fixed retry interval: Creates synchronized retries',
      'Unlimited retries: Never give up, keep hammering',
      'No jitter: All clients retry at the same time',
      'Too-short timeouts: Interpret slow responses as failures, triggering unnecessary retries',
      'Retry on non-retryable errors: Retrying 400 Bad Request is pointless',
      'No circuit breaker: Keep retrying even when service is clearly down'
    ]
  },
  debriefRubric: {
    clarifySignals: [
      'Asked about client retry configuration',
      'Inquired about server capacity and limits',
      'Considered timeout settings',
      'Thought about retry budget or rate limiting'
    ],
    bottleneckSignals: [
      'Identified synchronized retries as the amplification mechanism',
      'Recognized that retries add load',
      'Spotted positive feedback loop',
      'Understood thundering herd problem'
    ],
    adaptSignals: [
      'Proposed exponential backoff',
      'Suggested jitter to desynchronize retries',
      'Recommended circuit breaker pattern',
      'Considered load shedding or backpressure signals',
      'Mentioned retry budgets or rate limits'
    ],
    tradeoffSignals: [
      'Discussed user experience vs system stability',
      'Balanced retry attempts vs giving up',
      'Considered client complexity vs server control',
      'Mentioned cost of sophisticated retry logic'
    ],
    softwareSignals: [
      'Named circuit breaker libraries (Hystrix, resilience4j)',
      'Connected to real incidents (AWS outages, etc.)',
      'Understood exponential backoff algorithms',
      'Mapped to HTTP status codes and headers (429, 503, Retry-After)'
    ],
    modelAnswer: 'Strong answer: Implement exponential backoff with full jitter on client side (retry after random(0, min(MAX, BASE * 2^attempt))). Add circuit breaker that opens after N consecutive failures, stays open for timeout period, then enters half-open to test recovery. Server should return 429 or 503 with Retry-After header when overloaded (explicit backpressure). Set reasonable timeouts (above p99 latency). Limit total retry budget (e.g., retries add max 20% traffic). Monitor retry rates and circuit breaker state. In software: Use battle-tested libraries, configure sensible defaults, implement load shedding, add observability.",
    transferQuestion: "Your API calls an external payment processor. During Black Friday, the processor starts returning 500 errors for 30 seconds. Your system has 10,000 concurrent checkout requests. Design your retry strategy. When do you give up? How do you communicate failures to users?",
    commonMisconceptions: [
      "Believing more retries always help',
      'Thinking synchronized retries are fine',
      'Assuming systems recover instantly',
      'Not considering retry traffic as additional load'
    ]
  },
  reasoningSignals: [
    'retry amplification',
    'exponential backoff',
    'jitter necessity',
    'circuit breaker design',
    'load shedding strategy'
  ],
  misconceptions: [
    'retries are always good',
    "synchronization doesn't matter",
    'systems recover instantly',
    'unlimited retries are safe'
  ]
}
