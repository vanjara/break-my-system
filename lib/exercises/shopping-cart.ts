import { ExerciseDefinition } from "./types"

export const shoppingCartExercise: ExerciseDefinition = {
  "id": "shopping-cart",
  "ordinal": 4,
  "title": "Shopping Cart Under Stress",
  "setting": "Online retailer during flash sale on limited inventory",
  "conceptsPreview": "Inventory management, locking strategies, race conditions",
  "duration": 40,
  "openingStory": "You're the lead engineer at ShopFast, an online retailer. Marketing just announced a flash sale: 100 limited-edition sneakers, 50% off, starts at noon.\n\nYour system:\n- Web application where users browse and add items to cart\n- MySQL database tracking inventory\n- When user adds to cart, item is reserved for 10 minutes\n- Checkout processes payment and confirms the order\n\nAt 11:59 AM, you have 5,000 people on the product page, refreshing anxiously.\n\n12:00 PM: The sale goes live.\n\nWithin 60 seconds:\n- Your database shows 300 pairs in carts - but you only have 100 pairs\n- Users are complaining that items disappear from their cart at checkout\n- Someone completed checkout for 2 pairs, hit an error, retried, and got charged twice but only received one order confirmation\n- Your database is at 100% CPU\n- Some users see In Stock: -15 pairs on the product page\n\nThe CEO is watching the sale metrics live. Why did we oversell? Why are customers getting errors? Why is it so slow?\n\nWhat went wrong?",
  "objectives": "Design a system to handle high-concurrency inventory reservations, prevent overselling and race conditions, and ensure exactly-once semantics for critical operations.",
  "constraints": "Limited inventory, high concurrent access, temporary cart reservations, payment processing timeout risks, must not oversell or double-charge.",
  "stagePrompts": {
    "scenario": "You've read about the flash sale disaster. What underlying issues do you see?",
    "clarify": "What technical details would help you understand how inventory and carts should work?",
    "initialDesign": "Design a system to handle flash sales with limited inventory and high concurrency. How do you prevent overselling?",
    "failureInjection": "Your new system is deployed for the next flash sale. This time, 10,000 people hit the site at exactly 12:00:00. The item sells out in 30 seconds. But then: someone's checkout takes 15 seconds (slow payment processor), their reservation expires mid-checkout, and another person grabs their item. The first person hits Place Order and gets an error. They retry immediately (double-click). What breaks?",
    "adaptation": "How do you handle reservation expiry during checkout, slow external dependencies, and duplicate submissions?",
    "conceptReveal": "Let's explore the concurrency and consistency concepts at play.",
    "softwareTranslation": "Now let's map these inventory challenges to real distributed systems patterns."
  },
  "clarifyingQuestionChips": [
    "How do cart reservations work?",
    "What happens when a reservation expires?",
    "How do you prevent race conditions on inventory?",
    "Should checkout be atomic?",
    "How do you handle payment failures?"
  ],
  "hints": [
    {
      "level": 1,
      "content": "Think about the moment when multiple users click Add to Cart simultaneously for the last item. They all read 1 in stock at the same time. What happens next?"
    },
    {
      "level": 2,
      "content": "Consider using optimistic vs pessimistic locking. Optimistic: assume no conflicts, check at commit time. Pessimistic: lock the row before reading. Which works better for flash sales?"
    },
    {
      "level": 3,
      "content": "Key insight: You have three critical operations: 1) Reserve inventory, 2) Release expired reservations, 3) Convert reservation to order. Each must be atomic and handle race conditions. The expiry logic is particularly tricky - what if expiry happens during checkout?"
    }
  ],
  "failureScenarios": [
    {
      "trigger": "10,000 concurrent requests at sale start, payment processing timeout, double-submit",
      "description": "Extreme concurrency on limited inventory, reservation expires mid-checkout, user retries",
      "impact": "Race conditions cause overselling. Database locks contend, causing timeouts. Reservation expires while user is checking out, leading to errors. Double-click causes duplicate order attempt. User experience is terrible, and data integrity is violated."
    }
  ],
  "conceptReveal": {
    "title": "Race Conditions, Optimistic vs Pessimistic Locking, Idempotency",
    "explanation": "You've encountered core concurrency challenges:\n\n**Race Conditions**: When two operations happen at the same time on the same data, they can interfere. Classic example: Read inventory = 1, user A adds to cart (writes 0), user B adds to cart (writes 0) - but they both read 1 first. Now you've sold 2 items but only had 1.\n\n**Pessimistic Locking**: Lock the row before you read it. SELECT ... FOR UPDATE in SQL. Guarantees safety but reduces concurrency - everyone waits in line. Under high load, locks contend and performance degrades.\n\n**Optimistic Locking**: Assume no conflict. Read the data with a version number, do your work, then try to commit with a compare-and-swap: UPDATE inventory SET stock = stock - 1 WHERE id = X AND version = Y. If version changed (someone else modified it), your update fails and you retry. Works well when conflicts are rare.\n\n**Atomic Operations**: All or nothing. Reserving an item must atomically check stock AND decrement it. No race condition window.\n\n**Idempotency**: The same request submitted twice should have the same effect as submitting it once. For orders, this means using a unique idempotency key. If the user double-clicks, you recognize it's the same order and return the first result instead of creating two orders.\n\n**Hot Keys**: When many requests hit the same inventory record (e.g., the flash sale item), that one database row becomes a severe bottleneck. Even with good locking, you're serializing all requests.",
    "whyItMatters": "Every high-concurrency system faces race conditions. Banking (account balances), booking (flight seats), gaming (limited items). Getting this wrong means losing money, angry customers, and data corruption."
  },
  "softwareTranslation": {
    "analogyToSoftware": [
      {
        "analogy": "Inventory count in database",
        "software": "Shared mutable state / database row",
        "example": "Account balance, available seats, rate limit counter"
      },
      {
        "analogy": "Cart reservation",
        "software": "Temporary lock or lease",
        "example": "Redis key with TTL, distributed lock, reservation record with expiry"
      },
      {
        "analogy": "Reading stock, then decrementing",
        "software": "Read-modify-write race condition",
        "example": "Classic concurrent counter problem"
      },
      {
        "analogy": "Pessimistic locking (lock before read)",
        "software": "SELECT FOR UPDATE, mutex, distributed lock",
        "example": "Database row lock, Redis SETNX, ZooKeeper lock"
      },
      {
        "analogy": "Optimistic locking (version check)",
        "software": "Compare-and-swap, ETags, version numbers",
        "example": "UPDATE WHERE version = X, DynamoDB conditional writes, ETags in HTTP"
      },
      {
        "analogy": "Idempotency key for duplicate orders",
        "software": "Idempotency key / deduplication",
        "example": "Stripe idempotency keys, message deduplication in SQS"
      }
    ],
    "commonPatterns": [
      "Optimistic concurrency: Use version numbers or ETags",
      "Pessimistic locking: SELECT FOR UPDATE for critical sections",
      "Atomic operations: Use database atomics like DECR in Redis",
      "Idempotency keys: Client generates unique ID per logical request",
      "Reservation pattern: Temporary hold with TTL, then confirm or release",
      "Queue-based: Serialize requests through a queue to eliminate races",
      "Sharding: Partition hot keys across multiple shards"
    ],
    "antiPatterns": [
      "Read-then-write without locking: Classic race condition",
      "Long-held locks: Holding locks while calling external APIs",
      "No idempotency: Double-submit creates duplicate orders",
      "Unbounded retries: Retry loops amplify load under contention",
      "Ignoring hot keys: All requests hit the same record"
    ]
  },
  "debriefRubric": {
    "clarifySignals": [
      "Asked about concurrency levels and expected load",
      "Inquired about transactional requirements",
      "Considered timeout and failure scenarios",
      "Thought about idempotency and duplicate prevention"
    ],
    "bottleneckSignals": [
      "Identified hot key problem (single inventory record)",
      "Recognized database lock contention",
      "Spotted race condition in read-modify-write",
      "Understood that high concurrency amplifies the issue"
    ],
    "adaptSignals": [
      "Proposed optimistic or pessimistic locking",
      "Suggested atomic operations",
      "Recommended idempotency keys",
      "Considered reservation pattern with TTL",
      "Mentioned queue-based serialization or sharding"
    ],
    "tradeoffSignals": [
      "Discussed optimistic vs pessimistic locking tradeoffs",
      "Balanced consistency vs performance",
      "Considered reservation UX vs inventory accuracy",
      "Mentioned complexity of distributed locking"
    ],
    "softwareSignals": [
      "Named specific locking mechanisms (SELECT FOR UPDATE, Redis locks)",
      "Connected to real systems (Stripe idempotency, conditional writes)",
      "Understood database transaction isolation levels",
      "Mapped to distributed systems patterns"
    ],
    "modelAnswer": "Strong answer: Use atomic decrement for inventory (UPDATE inventory SET stock = stock - 1 WHERE id = X AND stock > 0). On success, create cart reservation with TTL. Use optimistic locking with version numbers for high-contention items. Implement idempotency keys for checkout (client sends unique key, server dedupes). Handle mid-checkout expiry by checking reservation is still valid before confirming order. Consider queue-based approach for extreme cases. In software: Redis DECR for counters, SELECT FOR UPDATE for critical sections, idempotency keys in API design, proper transaction isolation, caching to reduce database load.",
    "transferQuestion": "You're building a concert ticket sales platform. 10,000 tickets for a popular show. 100,000 people try to buy tickets in the first minute. How do you prevent overselling? What if someone's checkout takes 2 minutes and their reservation expires? Design the system.",
    "commonMisconceptions": [
      "Thinking read-then-write is safe without locking",
      "Believing database will automatically prevent races",
      "Assuming external APIs are fast and reliable",
      "Not considering idempotency for user actions"
    ]
  },
  "reasoningSignals": [
    "race condition awareness",
    "locking strategy",
    "atomic operations",
    "idempotency design",
    "hot key mitigation"
  ],
  "misconceptions": [
    "reads and writes are always atomic",
    "database prevents all races",
    "retries are always safe",
    "locks have no cost"
  ]
}
