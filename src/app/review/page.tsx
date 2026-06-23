import { ReviewWorkspace } from "@/components/ReviewWorkspace";
import { getExercisesByMode } from "@/lib/exercises";

export default function ReviewPage() {
  const exercises = getExercisesByMode("review");

  return <ReviewWorkspace exercises={exercises} />;
}
