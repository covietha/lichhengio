import type { Progress } from "../services/progress";
import { muted } from "../ui";

export function ProgressBar({ progress, label }: { progress: Progress; label: string }) {
  if (progress.percent === null) return <p className={`text-sm ${muted}`}>Chưa có việc để tính tiến độ</p>;
  const complete = progress.percent === 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className={`text-sm ${muted}`}>{progress.done}/{progress.total} việc xong</p>
        <p className="font-display text-lg font-bold tabular-nums">{progress.percent}%</p>
      </div>
      <div
        role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.percent}
        className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-line"
      >
        <div className={`h-full rounded-full ${complete ? "bg-ok" : "bg-pen"}`} style={{ width: `${progress.percent}%` }} />
      </div>
    </div>
  );
}
