import { exercises, getExerciseById } from '@/lib/exercises'
import { ExerciseDefinitionSchema } from '@/lib/exercises/types'

describe('Exercise Definitions', () => {
  it('should have exactly 6 exercises', () => {
    expect(exercises).toHaveLength(6)
  })
  
  it('should have exercises in correct order', () => {
    expect(exercises[0].id).toBe('airport-bathroom')
    expect(exercises[1].id).toBe('pizza-shop')
    expect(exercises[2].id).toBe('concert-wristband')
    expect(exercises[3].id).toBe('shopping-cart')
    expect(exercises[4].id).toBe('retry-army')
    expect(exercises[5].id).toBe('double-charged')
  })
  
  it('should validate all exercises against schema', () => {
    exercises.forEach(exercise => {
      expect(() => ExerciseDefinitionSchema.parse(exercise)).not.toThrow()
    })
  })
  
  it('should have complete content for each exercise', () => {
    exercises.forEach(exercise => {
      expect(exercise.title).toBeTruthy()
      expect(exercise.openingStory.length).toBeGreaterThan(300)
      expect(exercise.hints.length).toBe(3)
      expect(exercise.failureScenarios.length).toBeGreaterThan(0)
      expect(exercise.conceptReveal.title).toBeTruthy()
      expect(exercise.softwareTranslation.analogyToSoftware.length).toBeGreaterThan(3)
      expect(exercise.debriefRubric.modelAnswer.length).toBeGreaterThan(100)
    })
  })
  
  it('should have distinct opening stories', () => {
    const stories = exercises.map(e => e.openingStory)
    const uniqueStories = new Set(stories)
    expect(uniqueStories.size).toBe(6)
  })
  
  it('should have distinct concepts revealed', () => {
    const concepts = exercises.map(e => e.conceptReveal.title)
    const uniqueConcepts = new Set(concepts)
    expect(uniqueConcepts.size).toBe(6)
  })
  
  it('should have distinct settings', () => {
    const settings = exercises.map(e => e.setting)
    const uniqueSettings = new Set(settings)
    expect(uniqueSettings.size).toBe(6)
  })
  
  it('should have meaningful reasoning signals', () => {
    exercises.forEach(exercise => {
      expect(exercise.reasoningSignals.length).toBeGreaterThan(3)
      exercise.reasoningSignals.forEach(signal => {
        expect(signal.length).toBeGreaterThan(5)
      })
    })
  })
  
  it('should have distinct transfer questions', () => {
    const questions = exercises.map(e => e.debriefRubric.transferQuestion)
    const uniqueQuestions = new Set(questions)
    expect(uniqueQuestions.size).toBe(6)
  })
  
  it('should retrieve exercise by id', () => {
    const exercise = getExerciseById('airport-bathroom')
    expect(exercise).toBeDefined()
    expect(exercise?.title).toBe('Airport Bathroom Disaster')
  })
  
  it('should return undefined for invalid id', () => {
    const exercise = getExerciseById('invalid-id')
    expect(exercise).toBeUndefined()
  })
  
  it('Airport Bathroom should have rate limiting concepts', () => {
    const exercise = getExerciseById('airport-bathroom')
    expect(exercise?.conceptReveal.title).toContain('Rate Limiting')
    expect(exercise?.openingStory).toContain('airport')
  })
  
  it('Pizza Shop should have bottleneck concepts', () => {
    const exercise = getExerciseById('pizza-shop')
    expect(exercise?.conceptReveal.title).toContain('Bottleneck')
    expect(exercise?.openingStory).toContain('pizza')
  })
  
  it('Concert Wristband should have consistency concepts', () => {
    const exercise = getExerciseById('concert-wristband')
    expect(exercise?.conceptReveal.title).toContain('Consistency')
    expect(exercise?.openingStory).toContain('wristband')
  })
  
  it('Shopping Cart should have race condition concepts', () => {
    const exercise = getExerciseById('shopping-cart')
    expect(exercise?.conceptReveal.title).toContain('Race Conditions')
    expect(exercise?.openingStory).toContain('flash sale')
  })
  
  it('Retry Army should have retry storm concepts', () => {
    const exercise = getExerciseById('retry-army')
    expect(exercise?.conceptReveal.title).toContain('Retry Storms')
    expect(exercise?.openingStory).toContain('retry')
  })
  
  it('Double-Charged should have idempotency concepts', () => {
    const exercise = getExerciseById('double-charged')
    expect(exercise?.conceptReveal.title).toContain('Idempotency')
    expect(exercise?.openingStory).toContain('charged twice')
  })
})
