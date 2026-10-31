import { ExerciseDefinition } from "./types"

export const airportBathroomExercise: ExerciseDefinition = {
  "id": "airport-bathroom",
  "ordinal": 1,
  "title": "Airport Bathroom Disaster",
  "setting": "Busy international airport restroom during delayed flight wave",
  "conceptsPreview": "Resource management, queueing, system degradation",
  "duration": 35,
  "openingStory": "You're the facilities manager at Terminal 3 of a busy international airport. It's 6 PM on a Friday, and three wide-body flights from Europe have just been delayed by 4 hours due to weather. That's 900 extra passengers who weren't supposed to be here.\n\nYour main restroom near Gate 24 has:\n- 12 toilet stalls\n- 8 sinks\n- 4 paper towel dispensers\n- 2 attendants on duty\n\nWithin 15 minutes, lines snake out into the terminal. Passengers complain that stalls are broken when they're just occupied. The paper towel dispensers run empty faster than attendants can refill them. One family camps at the changing table for 20 minutes. The attendants are overwhelmed.\n\nWhat's really going on here?",
  "objectives": "Design a system to handle surge demand, identify bottlenecks, and gracefully degrade when resources are constrained.",
  "constraints": "Fixed physical space, limited attendant availability, unpredictable demand spikes, shared resources.",
  "stagePrompts": {
    "scenario": "You've just read the opening scenario. What immediate questions come to mind about the situation?",
    "clarify": "Before we design solutions, what information would help you understand the core problem?",
    "initialDesign": "Given what you know, how would you redesign the restroom operation to handle these surge events?",
    "failureInjection": "Your design is implemented. Now, all three delayed flights announce boarding simultaneously. 400 people rush to your restroom in a 10-minute window. One paper towel dispenser jams. What breaks?",
    "adaptation": "How do you adapt your design to handle this cascading failure?",
    "conceptReveal": "Let's connect what you've discovered to formal system design concepts.",
    "softwareTranslation": "Now let's map your restroom solutions to real software architecture patterns."
  },
  "clarifyingQuestionChips": [
    "What's the average usage time per stall?",
    "How quickly can attendants respond to issues?",
    "Are there backup restrooms nearby?",
    "Can we predict when surges will happen?",
    "What happens to the queue when it gets too long?"
  ],
  "hints": [
    {
      "level": 1,
      "content": "Think about what happens when demand exceeds capacity. How do physical queues behave differently than digital ones?"
    },
    {
      "level": 2,
      "content": "Consider: stalls are like worker threads, attendants are like maintenance processes, and the paper towel dispenser is a cache that needs refreshing. What's your biggest bottleneck?"
    },
    {
      "level": 3,
      "content": "Key insight: When one resource fails (jammed dispenser), does it affect unrelated resources (toilet stalls)? This is called head-of-line blocking. How do you isolate failures?"
    }
  ],
  "failureScenarios": [
    {
      "trigger": "Three flights board simultaneously",
      "description": "Demand spike of 400 people in 10 minutes, paper towel dispenser jams",
      "impact": "Attendants focus on the jammed dispenser while other maintenance tasks pile up. Queue grows beyond terminal capacity. People give up and look for other restrooms, creating a thundering herd problem elsewhere."
    }
  ],
  "conceptReveal": {
    "title": "Rate Limiting, Backpressure & Graceful Degradation",
    "explanation": "You've just experienced three fundamental distributed systems concepts:\n\n**Rate Limiting**: Your restroom has a maximum throughput (people per minute). When demand exceeds this, you need a strategy. Physical queues make this visible; digital systems need explicit limits.\n\n**Backpressure**: When your system can't handle the load, pressure builds up. In your restroom, it's a literal line. In software, it's requests waiting, memory filling up, or connections timing out.\n\n**Graceful Degradation**: When the paper towels ran out, your restroom didn't shut down - it degraded. Maybe people air-dry their hands or skip washing. In software, you might skip non-essential features, serve cached data, or reduce quality to keep core functionality working.\n\n**Head-of-Line Blocking**: When your attendants focus on one jammed dispenser, they can't service other needs. One failure blocks the entire maintenance queue.",
    "whyItMatters": "Real systems face unpredictable spikes: Black Friday sales, viral posts, DDoS attacks. Understanding how to handle demand that exceeds capacity - and how to fail gracefully - separates resilient systems from brittle ones."
  },
  "softwareTranslation": {
    "analogyToSoftware": [
      {
        "analogy": "Toilet stalls",
        "software": "Worker threads or connection pool",
        "example": "Database connection pool with max 20 connections"
      },
      {
        "analogy": "Queue in terminal",
        "software": "Request queue / message queue",
        "example": "Redis queue holding pending job requests"
      },
      {
        "analogy": "Paper towel dispenser cache",
        "software": "In-memory cache (Redis, Memcached)",
        "example": "User session cache that needs periodic refresh"
      },
      {
        "analogy": "Attendants",
        "software": "Background workers / cron jobs",
        "example": "Worker processes that handle cleanup, monitoring, cache warming"
      },
      {
        "analogy": "Redirecting to other restrooms",
        "software": "Load balancing / failover",
        "example": "Nginx routing requests to different server instances"
      },
      {
        "analogy": "Closing restroom when at capacity",
        "software": "Circuit breaker pattern",
        "example": "Stop accepting requests when system is overloaded, return 503"
      }
    ],
    "commonPatterns": [
      "Rate limiting: Max requests per user per minute (429 status)",
      "Queue with bounded size: Drop requests when queue is full",
      "Circuit breaker: Temporarily stop requests to failing service",
      "Bulkheads: Isolate failure domains (separate queues per resource)",
      "Graceful degradation: Serve cached/stale data under load",
      "Backpressure signaling: Return slow down signals to clients"
    ],
    "antiPatterns": [
      "Unlimited queueing: Memory fills up, system crashes",
      "Retry storms: Clients retry immediately, making overload worse",
      "Cascading failures: One bottleneck blocks everything else",
      "No monitoring: Can't see bottlenecks until total failure"
    ]
  },
  "debriefRubric": {
    "clarifySignals": [
      "Asked about capacity metrics (throughput, occupancy)",
      "Inquired about failure modes and degradation",
      "Considered monitoring and observability",
      "Thought about demand patterns and predictability"
    ],
    "bottleneckSignals": [
      "Identified the paper towel dispenser as a shared resource",
      "Recognized attendant time as a constraint",
      "Spotted head-of-line blocking risk",
      "Calculated or estimated throughput limits"
    ],
    "adaptSignals": [
      "Proposed queue length limits or alternative routing",
      "Suggested isolating maintenance tasks (bulkheads)",
      "Recommended graceful degradation strategies",
      "Considered circuit breaker or backpressure mechanisms"
    ],
    "tradeoffSignals": [
      "Discussed throughput vs consistency tradeoffs",
      "Balanced user experience vs system stability",
      "Considered cost of over-provisioning vs risk of underprovisioning",
      "Mentioned operational complexity of sophisticated solutions"
    ],
    "softwareSignals": [
      "Mapped physical resources to software equivalents",
      "Named specific technologies (Redis, circuit breakers, rate limiters)",
      "Connected to real-world scenarios (API rate limiting, connection pools)",
      "Understood caching and worker pool patterns"
    ],
    "modelAnswer": "Strong answer: Implement rate limiting at entry (max queue length), isolate maintenance tasks so one failure doesn't block others (bulkheads), degrade gracefully (disable paper towels but keep stalls open), monitor occupancy and queue length in real-time, add circuit breaker to redirect to backup restrooms when at capacity. In software: bounded request queues, separate worker pools per task type, circuit breakers, observability, and explicit backpressure signals to clients.",
    "transferQuestion": "You're designing an API for a mobile app that uploads photos. During a product launch, uploads spike 10x. How do you prevent your upload service from taking down your entire backend? What degrades first?",
    "commonMisconceptions": [
      "Assuming bigger queues always help (they can make problems worse)",
      "Believing you can handle any spike with enough resources (economic limits)",
      "Thinking all failures should retry immediately (retry storms)",
      "Not considering cascading failure effects"
    ]
  },
  "reasoningSignals": [
    "capacity planning",
    "bottleneck identification",
    "queue theory",
    "failure isolation",
    "graceful degradation",
    "monitoring and alerting"
  ],
  "misconceptions": [
    "bigger queues always better",
    "unlimited retries",
    "all requests are equal priority",
    "resources are infinite"
  ]
}
