import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-shimmer rounded-md bg-muted", className)}
      {...props}
    />
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[80%]" />
      </div>
    </div>
  )
}

function SkeletonTable() {
  return (
    <div className="w-full">
      <div className="rounded-lg border bg-card">
        <div className="border-b p-4">
          <Skeleton className="h-6 w-[200px]" />
        </div>
        <div className="p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[80px]" />
              <div className="ml-auto">
                <Skeleton className="h-8 w-[80px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SkeletonChart() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-[180px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
        <div className="space-y-2">
          <div className="flex items-end space-x-2 h-[200px]">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton
                key={i}
                className="flex-1"
                style={{ height: `${Math.random() * 150 + 50}px` }}
              />
            ))}
          </div>
          <div className="flex justify-between">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-8" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
            <div className="mt-4 space-y-2">
              <Skeleton className="h-8 w-[120px]" />
              <Skeleton className="h-3 w-[80px]" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <SkeletonChart />
        <SkeletonChart />
      </div>

      <SkeletonTable />
    </div>
  )
}

function SkeletonTransactionList() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 rounded-lg border p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-5 w-[80px]" />
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-3 w-[100px]" />
              <Skeleton className="h-3 w-[60px]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function SkeletonProfile() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-6">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[120px]" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="h-5 w-[120px]" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-5 w-[140px]" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-4 w-[120px]" />
                </div>
                <Skeleton className="h-5 w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export {
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonChart,
  SkeletonDashboard,
  SkeletonTransactionList,
  SkeletonProfile,
}