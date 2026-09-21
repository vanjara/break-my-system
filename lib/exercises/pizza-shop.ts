import { ExerciseDefinition } from "./types"

export const pizzaShopExercise: ExerciseDefinition = {
  "id": "pizza-shop",
  "ordinal": 2,
  "title": "Pizza Shop Meltdown",
  "setting": "Neighborhood pizza place on Friday game night",
  "conceptsPreview": "Bottleneck analysis, throughput vs latency, batching",
  "duration": 35,
  "openingStory": "You run Mario's Pizza, a beloved neighborhood spot. It's Friday night - the local high school football game just ended, and you know what's coming.\n\nYour setup:\n- One oven that fits 3 large pizzas at a time, 12-minute bake\n- Two prep stations for dough, sauce, and toppings\n- Three delivery drivers\n- One phone line for orders\n- Dine-in seats for 20 people\n\nBy 8:15 PM, you have:\n- 15 phone orders pending (mix of delivery and pickup)\n- 12 dine-in customers waiting for their pizzas\n- 4 delivery orders ready, but only 2 drivers are back\n\nThe oven is running full, but somehow pizzas are taking 45 minutes from order to delivery. Customers are calling to complain. Your prep team is working frantically, but there's a growing pile of almost-ready pizzas waiting for toppings.\n\nWhere's the real problem?",
  "objectives": "Identify the true bottleneck in a multi-stage process, understand throughput vs latency, and optimize resource allocation.",
  "constraints": "One oven with fixed capacity, limited prep space, shared delivery drivers, mixed priority orders.",
  "stagePrompts": {
    "scenario": "You've read about Mario's Pizza. What's your first reaction to the situation?",
    "clarify": "What would you measure or observe to understand where the system is breaking down?",
    "initialDesign": "How would you reorganize operations to maximize throughput while keeping customers happy?",
    "failureInjection": "Your system is working smoothly. Suddenly, a viral TikTok video shows someone getting proposed to at your restaurant. Orders spike 3x. Plus, your oven temperature starts dropping - pizzas now take 18 minutes instead of 12. What happens?",
    "adaptation": "How do you redesign your system to handle variable capacity and demand spikes?",
    "conceptReveal": "Let's explore the system design concepts behind what you experienced.",
    "softwareTranslation": "Now let's map your pizza shop insights to software architecture."
  },
  "clarifyingQuestionChips": [
    "How long does prep take per pizza?",
    "Can we batch multiple pizzas with the same toppings?",
    "How long are delivery drivers gone?",
    "What's the max throughput of the oven?",
    "Should dine-in orders get priority?"
  ],
  "hints": [
    {
      "level": 1,
      "content": "Look at the end-to-end flow: order → prep → oven → delivery/pickup. Where's the longest wait time? That's often where you should optimize first."
    },
    {
      "level": 2,
      "content": "Your oven is running at full capacity, but orders are slow. This suggests the oven isn't the bottleneck - even though it seems like it should be. What happens BEFORE the oven?"
    },
    {
      "level": 3,
      "content": "Key insight: If prep is slow, pizzas queue up waiting for oven space. If drivers are slow, finished pizzas sit on the counter. You can measure throughput at each stage. The slowest stage limits your entire system (Amdahl's Law)."
    }
  ],
  "failureScenarios": [
    {
      "trigger": "Viral TikTok causes 3x order spike + oven malfunction",
      "description": "Orders surge while oven capacity drops by 33% (18min vs 12min bake time)",
      "impact": "The oven becomes a severe bottleneck. Pizzas queue up. Prep team makes pizzas that sit waiting. Delivery drivers are idle. Kitchen runs out of counter space. Orders take 90+ minutes."
    }
  ],
  "conceptReveal": {
    "title": "Bottleneck Analysis, Throughput vs Latency & Batching",
    "explanation": "You've discovered three critical performance concepts:\n\n**Bottleneck Analysis**: In any multi-stage system, one stage is the slowest - that's your bottleneck. It doesn't matter how fast other stages are; your total throughput is limited by the slowest component. This is the Theory of Constraints.\n\n**Throughput vs Latency**: \n- Throughput: How many pizzas per hour can you make? \n- Latency: How long does one pizza take from order to customer?\nYou can optimize for one or the other, but often not both simultaneously.\n\n**Batching**: Making multiple similar pizzas at once is more efficient than making them one at a time. But batching increases latency for individual orders (they wait for the batch to fill). It's a tradeoff.\n\n**Priority Queuing**: Not all orders are equal. Dine-in customers waiting at tables vs delivery orders have different urgency. You need separate queues with different priorities.\n\n**Amdahl's Law**: If prep is 20% of your process and you make it infinitely fast, you only get a 20% overall improvement. Optimize the bottleneck first.",
    "whyItMatters": "In software, one slow database query can limit your entire API, even if your web servers are fast. Understanding bottlenecks helps you optimize the right thing. Many systems fail because teams optimize non-bottleneck components while ignoring the real constraint."
  },
  "softwareTranslation": {
    "analogyToSoftware": [
      {
        "analogy": "Oven (limited capacity)",
        "software": "Single-writer database or lock-protected critical section",
        "example": "Postgres database with one primary writer, or a mutex-protected resource"
      },
      {
        "analogy": "Prep stations",
        "software": "Request processing / business logic layer",
        "example": "Application servers processing requests before database writes"
      },
      {
        "analogy": "Delivery drivers",
        "software": "Background job workers or external API calls",
        "example": "Workers sending emails or processing payments"
      },
      {
        "analogy": "Batching similar pizzas",
        "software": "Batch processing or bulk operations",
        "example": "Batching database inserts, or accumulating logs before flushing to disk"
      },
      {
        "analogy": "Priority for dine-in vs delivery",
        "software": "Priority queues",
        "example": "Premium users get faster processing, or critical alerts bypass normal queues"
      },
      {
        "analogy": "Phone line (single order channel)",
        "software": "API endpoint or load balancer",
        "example": "HTTP API that accepts all incoming requests"
      }
    ],
    "commonPatterns": [
      "Profile before optimizing: Measure where time is actually spent",
      "Scale out non-bottleneck stages: Add more app servers",
      "Scale up bottleneck: Vertical scaling for databases",
      "Batch writes: Accumulate multiple operations before expensive I/O",
      "Separate read/write paths: Different priorities and scaling strategies",
      "Async processing: Don't make users wait for non-critical work"
    ],
    "antiPatterns": [
      "Premature optimization: Scaling components that aren't bottlenecks",
      "Ignoring single-writer constraints: Adding more web servers won't help if database is the bottleneck",
      "Unbounded batching: Waiting too long to fill batches hurts latency",
      "No prioritization: Treating background jobs same as user-facing requests"
    ]
  },
  "debriefRubric": {
    "clarifySignals": [
      "Asked about throughput at each stage",
      "Requested metrics on wait times and queue lengths",
      "Inquired about priority requirements",
      "Considered measurement and monitoring"
    ],
    "bottleneckSignals": [
      "Identified prep or oven as the constraint",
      "Calculated or estimated stage capacities",
      "Recognized that optimizing non-bottleneck stages won't help",
      "Understood the concept of limiting resource"
    ],
    "adaptSignals": [
      "Proposed batching similar orders",
      "Suggested separate queues for different priorities",
      "Recommended async processing (delivery while cooking)",
      "Considered capacity planning and admission control"
    ],
    "tradeoffSignals": [
      "Discussed throughput vs latency tradeoffs",
      "Balanced customer experience vs operational efficiency",
      "Considered cost of additional capacity",
      "Mentioned batching delay vs individual order speed"
    ],
    "softwareSignals": [
      "Mapped stages to software components",
      "Named patterns like batch processing, priority queues",
      "Connected to real databases, queues, workers",
      "Understood single-writer constraints"
    ],
    "modelAnswer": "Strong answer: Profile to find the true bottleneck (likely prep or oven). If oven is the bottleneck, batch similar pizzas and prioritize orders strategically. If prep is the bottleneck, add prep capacity or simplify recipes. Use separate queues for delivery vs dine-in. Monitor throughput at each stage. In software: profile database vs application layer, batch database writes, use priority queues, scale the actual bottleneck not other components, async processing for non-blocking operations.",
    "transferQuestion": "Your API serves user profile pages. Each page requires: 1) fetching user data (5ms), 2) fetching friend list (300ms), 3) rendering HTML (10ms). You need to serve 1000 req/sec. Where do you optimize first? How would batching help?",
    "commonMisconceptions": [
      "Assuming the busiest looking resource is the bottleneck",
      "Thinking more workers always help (not if database is the limit)",
      "Ignoring queueing delay vs processing time",
      "Believing you can optimize everything simultaneously"
    ]
  },
  "reasoningSignals": [
    "bottleneck identification",
    "throughput calculation",
    "batching benefits",
    "priority queue design",
    "capacity planning"
  ],
  "misconceptions": [
    "scale all components equally",
    "ignore single-writer limits",
    "no prioritization needed",
    "optimization is always good"
  ]
}
