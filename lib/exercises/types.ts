import { z } from "zod"

export const ExerciseStage = z.enum([
  "SCENARIO",
  "CLARIFY",
  "INITIAL_DESIGN",
  "FAILURE_INJECTION",
  "ADAPTATION",
  "CONCEPT_REVEAL",
  "SOFTWARE_TRANSLATION",
  "DEBRIEF",
  "COMPLETE"
])

export type ExerciseStage = z.infer<typeof ExerciseStage>

export const HintSchema = z.object({
  level: z.number(),
  content: z.string()
})

export const FailureScenarioSchema = z.object({
  trigger: z.string(),
  description: z.string(),
  impact: z.string()
})

export const ConceptRevealSchema = z.object({
  title: z.string(),
  explanation: z.string(),
  whyItMatters: z.string()
})

export const SoftwareTranslationSchema = z.object({
  analogyToSoftware: z.array(z.object({
    analogy: z.string(),
    software: z.string(),
    example: z.string()
  })),
  commonPatterns: z.array(z.string()),
  antiPatterns: z.array(z.string())
})

export const DebriefRubricSchema = z.object({
  clarifySignals: z.array(z.string()),
  bottleneckSignals: z.array(z.string()),
  adaptSignals: z.array(z.string()),
  tradeoffSignals: z.array(z.string()),
  softwareSignals: z.array(z.string()),
  modelAnswer: z.string(),
  transferQuestion: z.string(),
  commonMisconceptions: z.array(z.string())
})

export const StagePromptsSchema = z.object({
  scenario: z.string(),
  clarify: z.string(),
  initialDesign: z.string(),
  failureInjection: z.string(),
  adaptation: z.string(),
  conceptReveal: z.string(),
  softwareTranslation: z.string()
})

export const ExerciseDefinitionSchema = z.object({
  id: z.string(),
  title: z.string(),
  setting: z.string(),
  conceptsPreview: z.string(),
  duration: z.number(),
  ordinal: z.number(),
  openingStory: z.string(),
  objectives: z.string(),
  constraints: z.string(),
  stagePrompts: StagePromptsSchema,
  clarifyingQuestionChips: z.array(z.string()),
  hints: z.array(HintSchema),
  failureScenarios: z.array(FailureScenarioSchema),
  conceptReveal: ConceptRevealSchema,
  softwareTranslation: SoftwareTranslationSchema,
  debriefRubric: DebriefRubricSchema,
  reasoningSignals: z.array(z.string()),
  misconceptions: z.array(z.string())
})

export type ExerciseDefinition = z.infer<typeof ExerciseDefinitionSchema>
