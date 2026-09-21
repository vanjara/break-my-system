import { ExerciseDefinition } from "./types"

export const airportBathroomExercise: ExerciseDefinition = {
  "id": "airport-bathroom",
  "ordinal": 1,
  "title": "Airport Bathroom Disaster",
  "setting": "Airport Bathroom Disaster scenario",
  "conceptsPreview": "System design concepts",
  "duration": 35,
  "openingStory": "This is the Airport Bathroom Disaster exercise. You will learn important system design concepts.",
  "objectives": "Learn and apply system design principles",
  "constraints": "Limited resources and high demand",
  "stagePrompts": {
    "scenario": "What do you observe about this situation?",
    "clarify": "What information would help you?",
    "initialDesign": "How would you design a solution?",
    "failureInjection": "The system faces a new challenge. What happens?",
    "adaptation": "How do you adapt your design?",
    "conceptReveal": "Let's explore the concepts behind this.",
    "softwareTranslation": "How does this map to software?"
  },
  "clarifyingQuestionChips": [
    "What is the capacity?",
    "How do we handle failures?",
    "What are the constraints?"
  ],
  "hints": [
    {
      "level": 1,
      "content": "Think about the bottleneck"
    },
    {
      "level": 2,
      "content": "Consider scalability and resilience"
    },
    {
      "level": 3,
      "content": "Look at the tradeoffs involved"
    }
  ],
  "failureScenarios": [
    {
      "trigger": "Load spike",
      "description": "Sudden increase in demand",
      "impact": "System struggles to keep up"
    }
  ],
  "conceptReveal": {
    "title": "Core Concepts",
    "explanation": "These are important distributed systems patterns.",
    "whyItMatters": "Understanding these helps build better systems."
  },
  "softwareTranslation": {
    "analogyToSoftware": [
      {
        "analogy": "Physical resource",
        "software": "Service or component",
        "example": "Database connection pool"
      }
    ],
    "commonPatterns": [
      "Rate limiting",
      "Caching",
      "Load balancing"
    ],
    "antiPatterns": [
      "No error handling",
      "Unbounded queues"
    ]
  },
  "debriefRubric": {
    "clarifySignals": [
      "Asked about constraints"
    ],
    "bottleneckSignals": [
      "Identified key bottleneck"
    ],
    "adaptSignals": [
      "Proposed solutions"
    ],
    "tradeoffSignals": [
      "Discussed tradeoffs"
    ],
    "softwareSignals": [
      "Mapped to software patterns"
    ],
    "modelAnswer": "A complete solution considers capacity, failures, and tradeoffs.",
    "transferQuestion": "How would you apply this to a different system?",
    "commonMisconceptions": [
      "Assuming infinite resources"
    ]
  },
  "reasoningSignals": [
    "capacity planning",
    "bottleneck analysis"
  ],
  "misconceptions": [
    "no limits needed"
  ]
}
