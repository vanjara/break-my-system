import { getNextStage, canAdvanceStage, isStageComplete } from '@/lib/state-machine'
import { ExerciseStage } from '@/lib/exercises/types'

describe('State Machine', () => {
  it('should transition through stages in correct order', () => {
    expect(getNextStage('SCENARIO')).toBe('CLARIFY')
    expect(getNextStage('CLARIFY')).toBe('INITIAL_DESIGN')
    expect(getNextStage('INITIAL_DESIGN')).toBe('FAILURE_INJECTION')
    expect(getNextStage('FAILURE_INJECTION')).toBe('ADAPTATION')
    expect(getNextStage('ADAPTATION')).toBe('CONCEPT_REVEAL')
    expect(getNextStage('CONCEPT_REVEAL')).toBe('SOFTWARE_TRANSLATION')
    expect(getNextStage('SOFTWARE_TRANSLATION')).toBe('DEBRIEF')
    expect(getNextStage('DEBRIEF')).toBe('COMPLETE')
    expect(getNextStage('COMPLETE')).toBe(null)
  })
  
  it('should correctly identify when stage can advance', () => {
    expect(canAdvanceStage('SCENARIO')).toBe(true)
    expect(canAdvanceStage('CLARIFY')).toBe(true)
    expect(canAdvanceStage('DEBRIEF')).toBe(true)
    expect(canAdvanceStage('COMPLETE')).toBe(false)
  })
  
  it('should correctly identify complete stage', () => {
    expect(isStageComplete('SCENARIO')).toBe(false)
    expect(isStageComplete('DEBRIEF')).toBe(false)
    expect(isStageComplete('COMPLETE')).toBe(true)
  })
})
