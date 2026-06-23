import type { Exercise, TrainingMode } from "../domain/types";
import { debugExercises } from "./debug";
import { trainExercises } from "./train";

export const exercises: Exercise[] = [...trainExercises, ...debugExercises];

export function getExerciseById(id: string): Exercise | undefined {
  return exercises.find((e) => e.id === id);
}

export function getExercisesByMode(mode: TrainingMode): Exercise[] {
  return exercises.filter((e) => e.mode === mode);
}

export function getExercisesByDifficulty(
  difficulty: Exercise["difficulty"],
  mode?: TrainingMode,
): Exercise[] {
  return exercises.filter(
    (e) => e.difficulty === difficulty && (mode === undefined || e.mode === mode),
  );
}

export { debugExercises, trainExercises };
