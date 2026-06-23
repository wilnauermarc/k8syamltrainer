import { TrainingWorkspace } from "@/components/TrainingWorkspace";
import { getExercisesByMode } from "@/lib/exercises";

export default function TrainPage() {
  const exercises = getExercisesByMode("train");

  return <TrainingWorkspace exercises={exercises} />;
}
