import { TrainingWorkspace } from "@/components/TrainingWorkspace";
import { getExercisesByMode } from "@/lib/exercises";

export default function DebugPage() {
  const exercises = getExercisesByMode("debug");

  return (
    <div className="flex h-full min-h-0 flex-col">
      <TrainingWorkspace exercises={exercises} variant="debug" />
    </div>
  );
}
