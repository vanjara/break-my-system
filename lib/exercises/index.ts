import { ExerciseDefinition } from "./types"
import { airportBathroomExercise } from "./airport-bathroom"
import { pizzaShopExercise } from "./pizza-shop"
import { concertWristbandExercise } from "./concert-wristband"
import { shoppingCartExercise } from "./shopping-cart"
import { retryArmyExercise } from "./retry-army"
import { doubleChargedExercise } from "./double-charged"

export const exercises: ExerciseDefinition[] = [
  airportBathroomExercise,
  pizzaShopExercise,
  concertWristbandExercise,
  shoppingCartExercise,
  retryArmyExercise,
  doubleChargedExercise
]

export const getExerciseById = (id: string): ExerciseDefinition | undefined => {
  return exercises.find(ex => ex.id === id)
}

export {
  airportBathroomExercise,
  pizzaShopExercise,
  concertWristbandExercise,
  shoppingCartExercise,
  retryArmyExercise,
  doubleChargedExercise
}

export type { ExerciseDefinition }
