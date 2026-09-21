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
      expect(exercise.openingStory.length).toBeGreaterThan(100)
      expect(exercise.hints.length).toBeGreaterThan(0)
      expect(exercise.failureScenarios.length).toBeGreaterThan(0)
      expect(exercise.conceptReveal.title).toBeTruthy()
      expect(exercise.softwareTranslation.analogyToSoftware.length).toBeGreaterThan(0)
      expect(exercise.debriefRubric.modelAnswer.length).toBeGreaterThan(50)
    })
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
})
