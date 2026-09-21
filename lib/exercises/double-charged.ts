import { ExerciseDefinition } from './types'

export const doubleChargedExercise: ExerciseDefinition = {
  id: 'double-charged",
  title: "Double-Charged Customer",
  setting: "Coffee shop loyalty app with payment terminal",
  conceptsPreview: "Idempotency, exactly-once semantics, distributed transactions",
  duration: 40,
  ordinal: 6,
  openingStory: `You"re the tech lead for CoffeeLoyalty, a mobile app that lets customers order and pay from their phone at local coffee shops.

Your system:
- Mobile app → your API → payment processor (Stripe)
- When user taps 'Pay $5.50", app calls your API, you call Stripe, return success
- Shop"s tablet shows the order and receipt

Monday morning rush, 8:15 AM. Sarah orders her usual latte:

1. She taps 'Pay"
2. App shows "Processing..." for 10 seconds
3. Network is slow (café WiFi), request times out on the client
4. Sarah sees "Payment Failed" error
5. She taps "Pay" again
6. Second request goes through, she sees "Success!"
7. She picks up her latte and leaves

Tuesday morning: Sarah checks her credit card statement. Two charges: $5.50 and $5.50.

She emails support. Your team investigates. Logs show:
- First request: Hit your API, called Stripe, Stripe succeeded, but response to mobile app timed out
- Second request: Hit your API as a new request, called Stripe again, succeeded

Sarah was charged twice but only got one coffee. Your database shows two separate order records with two separate Stripe transaction IDs.

Wednesday: Three more double-charge complaints. Then someone says they were charged but never got their order - they think the app "glitched" so they canceled and paid at the register instead. Your database shows the charge succeeded, but the café"s tablet never received the order.

How do you fix this? How do you prevent it? And how do you even know which charges are duplicates?`,
  objectives: 'Design idempotent APIs that safely handle duplicate requests, implement exactly-once semantics for critical operations, and handle distributed transaction failures.",
  constraints: "Network timeouts, client retries, external payment APIs, distributed state across multiple systems, must not double-charge or lose orders.",
  stagePrompts: {
    scenario: "You"ve read about the double-charging problem. What's the root cause?',
    clarify: "What information would help you design a system that prevents double-charges?",
    initialDesign: "Design a payment flow that"s safe even when clients retry due to timeouts. How do you ensure exactly-once payment processing?',
    failureInjection: "Your new system is deployed. A customer taps "Pay", your API calls Stripe successfully, but then your API server crashes before sending the response. The client retries with your new idempotency mechanism. Meanwhile, another request from a different customer has the same idempotency key (client bug). What happens?",
    adaptation: "How do you handle server failures mid-transaction and idempotency key collisions?",
    conceptReveal: "Let"s explore the distributed systems concepts around exactly-once semantics.',
    softwareTranslation: "Now let"s map your payment flow to general distributed systems patterns.'
  },
  clarifyingQuestionChips: [
    'Can we detect duplicate requests?',
    'What makes a request unique?',
    'How do we handle partial failures?',
    'Should we store payment state?',
    'How long do we remember requests?'
  ],
  hints: [
    {
      level: 1,
      content: 'Think about what makes two requests "the same." If Sarah taps Pay twice, are they two separate orders, or the same order attempted twice? You need a way to identify intent."
    },
    {
      level: 2,
      content: "Idempotency keys: The client generates a unique ID (UUID) for each logical operation. If the request is retried, it uses the same key. Your server can then detect "I"ve seen this key before' and return the previous result instead of processing again."
    },
    {
      level: 3,
      content: 'Key insight: You need to store the idempotency key + result atomically with the payment. If your server crashes after calling Stripe but before responding, the retry must see that the payment already happened. This requires transactional thinking across your database and the external payment API.'
    }
  ],
  failureScenarios: [
    {
      trigger: 'API server crashes after Stripe call succeeds, client retries; separate request has colliding idempotency key",
      description: "Server failure mid-transaction + idempotency key collision (client bug)",
      impact: "If idempotency keys aren"t scoped properly (e.g., per-user), a collision could return wrong results. If crash recovery isn't atomic, system might think payment succeeded but not record the order, or vice versa.'
    }
  ],
  conceptReveal: {
    title: 'Idempotency, Exactly-Once Semantics & Distributed Transactions",
    explanation: `You"ve encountered one of the hardest problems in distributed systems:

**Idempotency**: An operation is idempotent if performing it multiple times has the same effect as performing it once. GET requests are naturally idempotent. POST (creating an order) is not - unless you explicitly design it to be.

**Idempotency Keys**: A unique identifier that represents a logical operation. The client generates it (often a UUID) and sends it with the request. The server stores the key + result. On retry, the server sees the key already exists and returns the cached result instead of re-processing.

**Exactly-Once Semantics**: The holy grail - ensuring a request is processed exactly once, never zero times (lost) and never twice (duplicated). In reality, you usually get:
- At-most-once: Might be lost, but never duplicated (unreliable)
- At-least-once: Guaranteed to happen, but might duplicate (requires idempotency to be safe)
- Exactly-once: Appears to happen exactly once (achieved via idempotency + deduplication)

**Distributed Transactions**: When one logical operation spans multiple systems (your database + Stripe's API), ensuring consistency is hard. If your database write succeeds but Stripe call fails, or vice versa, you have inconsistency.

**Two-Phase Commit**: Classic algorithm for distributed transactions: (1) PREPARE - ask all parties if they can commit, (2) COMMIT - if all agree, commit; otherwise abort. Problem: Slow, blocking, doesn"t work across organizational boundaries (you can't control Stripe"s commit).

**Saga Pattern**: Break the transaction into a sequence of local transactions, each with a compensating action. If step 3 fails, you execute compensation for steps 2 and 1. Payment systems often use this.

**Outbox Pattern**: Write your database change AND a 'to-do" record in the same local transaction. A background worker reads the to-do, calls the external API (Stripe), and marks it done. Ensures you don"t lose the intent even if the API call fails.`,
    whyItMatters: "Every payment system, booking system, financial transaction, or critical operation must be idempotent. Network failures, timeouts, and retries are inevitable. Systems that don't handle this correctly lose money, double-charge customers, or corrupt data. This is why Stripe, AWS, and others provide idempotency keys as a first-class feature."
  },
  softwareTranslation: {
    analogyToSoftware: [
      {
        analogy: 'Sarah taps Pay twice",
        software: "Client retry due to timeout",
        example: "Mobile app, browser, or service retrying HTTP request"
      },
      {
        analogy: 'Same order, two attempts",
        software: "Duplicate request detection",
        example: "Idempotency key in HTTP header (Idempotency-Key: uuid)"
      },
      {
        analogy: 'Server crashes after Stripe succeeds",
        software: "Partial failure / crash during distributed transaction",
        example: "Server dies after external API call but before committing local DB"
      },
      {
        analogy: "Payment succeeded but tablet didn't get order",
        software: "Split-brain / inconsistent state across systems",
        example: "Payment processed but order not recorded, or vice versa"
      },
      {
        analogy: 'Checking if payment already processed",
        software: "Idempotency check / deduplication",
        example: "SELECT * FROM payments WHERE idempotency_key = X"
      },
      {
        analogy: 'Recording payment + order atomically",
        software: "Local transaction with outbox",
        example: "INSERT payment and outbox record in single DB transaction"
      }
    ],
    commonPatterns: [
      'Idempotency keys: Client-generated UUID in request header',
      'Idempotency cache: Store key → result mapping, TTL 24 hours',
      'Outbox pattern: Local transaction writes DB + outbox, worker processes outbox',
      'Saga pattern: Sequence of steps with compensating transactions',
      'Two-phase commit: Prepare then commit (rarely used across org boundaries)',
      'Exactly-once semantics: Idempotency + deduplication + retries',
      'Conditional writes: Only update if state matches expected value',
      'Request deduplication: Message queue dedupes by message ID'
    ],
    antiPatterns: [
      'No idempotency: Retries create duplicates',
      "Server-generated IDs: Can't detect duplicates",
      'No crash recovery: Partial transactions leave inconsistent state',
      'Trusting client not to retry: Clients always retry',
      'Synchronous external calls without saga: Failures leave split-brain',
      'Forgetting idempotency keys: Old keys accumulate forever'
    ]
  },
  debriefRubric: {
    clarifySignals: [
      'Asked about request uniqueness and client retry behavior',
      'Inquired about transaction boundaries',
      'Considered failure modes and crash recovery',
      'Thought about idempotency key lifetime and scope'
    ],
    bottleneckSignals: [
      'Identified lack of idempotency as the core issue',
      'Recognized distributed transaction challenge',
      'Spotted potential for split-brain state',
      'Understood network timeout implications'
    ],
    adaptSignals: [
      'Proposed idempotency keys',
      'Suggested outbox pattern or saga',
      'Recommended storing request state atomically',
      'Considered compensating transactions for failures',
      'Mentioned proper idempotency key scoping'
    ],
    tradeoffSignals: [
      'Discussed consistency vs availability',
      'Balanced complexity of distributed transactions vs risk',
      'Considered idempotency cache size/lifetime tradeoffs',
      'Mentioned operational overhead of saga pattern'
    ],
    softwareSignals: [
      'Named idempotency key pattern (Stripe, AWS)',
      'Connected to real payment systems',
      'Understood outbox and saga patterns',
      'Mapped to distributed transaction challenges'
    ],
    modelAnswer: "Strong answer: Client generates idempotency key (UUID) per logical payment. Server checks if key exists in database. If yes, return cached result. If no, call Stripe with Stripe's idempotency key, store result + key in database transaction, return success. Use outbox pattern: write payment + outbox record atomically, worker sends to tablet. Idempotency keys scoped per user, TTL 24 hours. Handle collisions by checking order details match. In software: Idempotency-Key header, database unique constraint on key, outbox table for reliable async propagation, saga or two-phase commit for multi-step transactions.",
    transferQuestion: "You"re building a ticket booking system. A user books a concert ticket: (1) charge credit card, (2) reserve seat in venue DB, (3) send confirmation email. Network is unreliable, client might retry. How do you ensure exactly-once? What if step 2 fails after step 1 succeeds?',
    commonMisconceptions: [
      'Believing networks are reliable',
      'Thinking retries are rare',
      'Assuming transactions naturally span systems',
      'Not considering partial failures'
    ]
  },
  reasoningSignals: [
    'idempotency design',
    'exactly-once semantics',
    'distributed transaction handling',
    'outbox pattern',
    'compensating transactions'
  ],
  misconceptions: [
    'clients never retry',
    'server-side deduplication is automatic',
    'transactions span systems',
    'partial failures are impossible'
  ]
}
