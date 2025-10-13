import { Badge } from '@/components/ui/badge';

interface RemovedExercise {
  id: string;
  name: string;
  estimatedMinutes: number;
  priority: 'low' | 'medium';
}

interface ReducedExercise {
  id: string;
  name: string;
  fromSets: number;
  toSets: number;
  priority: 'medium' | 'high';
  minutesSaved: number;
}

interface TimeCrunchSummaryProps {
  summary?: string | null;
  minutes?: number | null;
  diff?: {
    removedExercises: RemovedExercise[];
    reducedExercises: ReducedExercise[];
    totalMinutesSaved: number;
    originalDuration: number;
    achievedDuration: number;
    targetDuration: number;
  } | null;
}

export function TimeCrunchSummary({ summary, minutes, diff }: TimeCrunchSummaryProps) {
  if (!diff || !summary) {
    return null;
  }

  return (
    <div className="rounded-lg border border-primary/40 bg-primary/10 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Badge variant="default" className="bg-primary text-primary-foreground">
          Time Crunch Mode{minutes ? ` (${minutes} min)` : ''}
        </Badge>
        <span className="text-sm text-primary/80">核心訓練保留完成</span>
      </div>

      <p className="text-sm leading-relaxed text-primary/90">{summary}</p>

      <div className="grid gap-2 text-sm">
        <div className="flex justify-between text-primary/80">
          <span>原始課表</span>
          <span>{Math.round(diff.originalDuration)} 分鐘</span>
        </div>
        <div className="flex justify-between text-primary/80">
          <span>壓縮後</span>
          <span>{Math.round(diff.achievedDuration)} 分鐘</span>
        </div>
        <div className="flex justify-between font-semibold text-primary">
          <span>節省時間</span>
          <span>{Math.round(diff.totalMinutesSaved)} 分鐘</span>
        </div>
      </div>

      {(diff.removedExercises?.length ?? 0) > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">已移除</p>
          <ul className="mt-1 space-y-1 text-sm text-primary/80">
            {diff.removedExercises.map((exercise) => (
              <li key={exercise.id} className="flex justify-between">
                <span>{exercise.name}</span>
                <span>{exercise.estimatedMinutes.toFixed(1)} 分鐘</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(diff.reducedExercises?.length ?? 0) > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">已調整組數</p>
          <ul className="mt-1 space-y-1 text-sm text-primary/80">
            {diff.reducedExercises.map((exercise) => (
              <li key={exercise.id} className="flex justify-between">
                <span>{exercise.name}</span>
                <span>
                  {exercise.fromSets} → {exercise.toSets} 組 ({exercise.minutesSaved.toFixed(1)} 分)
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
