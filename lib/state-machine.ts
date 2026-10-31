import { ExerciseStage } from './exercises/types'

export const stageTransitions: Record<ExerciseStage, ExerciseStage | null> = {
  'SCENARIO': 'CLARIFY',
  'CLARIFY': 'INITIAL_DESIGN',
  'INITIAL_DESIGN': 'FAILURE_INJECTION',
  'FAILURE_INJECTION': 'ADAPTATION',
  'ADAPTATION': 'CONCEPT_REVEAL',
  'CONCEPT_REVEAL': 'SOFTWARE_TRANSLATION',
  'SOFTWARE_TRANSLATION': 'DEBRIEF',
  'DEBRIEF': 'COMPLETE',
  'COMPLETE': null
}

export const canAdvanceStage = (currentStage: ExerciseStage): boolean => {
  return stageTransitions[currentStage] !== null
}

export const getNextStage = (currentStage: ExerciseStage): ExerciseStage | null => {
  return stageTransitions[currentStage]
}

export const isStageComplete = (stage: ExerciseStage): boolean => {
  return stage === 'COMPLETE'
}

export const getStagePrompt = (exerciseId: string, stage: ExerciseStage): string => {
  const { getExerciseById } = require('./exercises')
  const exercise = getExerciseById(exerciseId)
  if (!exercise) return ''
  
  const promptMap: Record<ExerciseStage, string> = {
    'SCENARIO': exercise.stagePrompts.scenario,
    'CLARIFY': exercise.stagePrompts.clarify,
    'INITIAL_DESIGN': exercise.stagePrompts.initialDesign,
    'FAILURE_INJECTION': exercise.stagePrompts.failureInjection,
    'ADAPTATION': exercise.stagePrompts.adaptation,
    'CONCEPT_REVEAL': exercise.stagePrompts.conceptReveal,
    'SOFTWARE_TRANSLATION': exercise.stagePrompts.softwareTranslation,
    'DEBRIEF': 'Let\'s review your journey through this exercise.',
    'COMPLETE': 'Exercise complete!'
  }
  
  return promptMap[stage] || ''
}

export const getStageDescription = (stage: ExerciseStage): string => {
  const descriptions: Record<ExerciseStage, string> = {
    'SCENARIO': 'Understanding the situation',
    'CLARIFY': 'Asking clarifying questions',
    'INITIAL_DESIGN': 'Designing your solution',
    'FAILURE_INJECTION': 'Handling a failure scenario',
    'ADAPTATION': 'Adapting your design',
    'CONCEPT_REVEAL': 'Learning the concepts',
    'SOFTWARE_TRANSLATION': 'Mapping to software',
    'DEBRIEF': 'Reviewing your performance',
    'COMPLETE': 'Complete'
  }
  
  return descriptions[stage] || stage
}
