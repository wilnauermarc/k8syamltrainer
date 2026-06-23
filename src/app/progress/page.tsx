import { ProgressDashboard } from "@/components/ProgressDashboard";

export const dynamic = "force-dynamic";

export default function ProgressPage() {
  return (
    <div className="flex min-h-full flex-col">
      <ProgressDashboard />
    </div>
  );
}
