import type { Progress } from "../services/progress";
import { muted } from "../ui";

export function ProgressBar({ progress, label }: { progress: Progress; label: string }) {
  if (progress.percent === null) return <p className={`text-sm ${muted}`}>Chưa có việc để tính tiến độ</p>;
  return (
    <div>
      <div
        role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.percent}
        className="h-2 w-full overflow-hidden rounded-full bg-ink/10 dark:bg-ink-dark/15"
      >
        <div className="h-full bg-brand dark:bg-brand-dark" style={{ width: `${progress.percent}%` }} />
      </div>
      <p className={`mt-1 text-xs ${muted}`}>{progress.done}/{progress.total} việc xong · {progress.percent}%</p>
    </div>
  );
}
