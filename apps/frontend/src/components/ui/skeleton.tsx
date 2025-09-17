import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

export function Skeleton({ 
  className, 
  width, 
  height, 
  rounded = true 
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-muted',
        rounded && 'rounded-md',
        className
      )}
      style={{
        width: width || '100%',
        height: height || '1rem',
      }}
    />
  );
}

export function PlanCardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton height="1.5rem" width="60%" />
          <Skeleton height="1rem" width="80%" />
        </div>
        <Skeleton height="1.5rem" width="4rem" className="rounded-full" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Skeleton height="1rem" width="1rem" className="rounded-full" />
          <Skeleton height="1rem" width="3rem" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton height="1rem" width="1rem" className="rounded-full" />
          <Skeleton height="1rem" width="3rem" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton height="1rem" width="1rem" className="rounded-full" />
          <Skeleton height="1rem" width="3rem" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton height="1rem" width="1rem" className="rounded-full" />
          <Skeleton height="1rem" width="3rem" />
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Skeleton height="2.5rem" width="100%" />
        <Skeleton height="2.5rem" width="4rem" />
      </div>
    </div>
  );
}

export function TrainingSessionSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton height="1.5rem" width="70%" />
          <Skeleton height="1rem" width="50%" />
        </div>
        <Skeleton height="1.5rem" width="4rem" className="rounded-full" />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton height="1rem" width="2rem" />
          <Skeleton height="1rem" width="4rem" />
        </div>
        <Skeleton height="0.5rem" width="100%" />
      </div>
      
      <div className="space-y-3">
        <Skeleton height="1.25rem" width="6rem" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <Skeleton height="1rem" width="8rem" />
                <Skeleton height="1rem" width="3rem" className="rounded-full" />
              </div>
              <Skeleton height="0.875rem" width="12rem" />
            </div>
            <Skeleton height="2rem" width="2rem" className="rounded" />
          </div>
        ))}
      </div>
      
      <div className="flex space-x-2 pt-4 border-t">
        <Skeleton height="2.5rem" width="100%" />
        <Skeleton height="2.5rem" width="100%" />
      </div>
    </div>
  );
}