
import { Skeleton } from "@/components/ui/skeleton"

export default function PostSkeleton() {
  return (
    <div className="gap-8 mt-10 flex flex-col items-center w-full">
      {[1, 2].map((i) => (
        <div key={i} className="border rounded-xl overflow-hidden bg-brand-mid shadow-sm w-full">
          {/* Image Placeholder */}
          <Skeleton className="w-full aspect-square" />
          
          {/* Content Placeholder */}
          <div className="flex justify-between p-4">
            <div className="space-y-2 w-full">
              <Skeleton className="h-4 w-25" />
              <Skeleton className="h-4 w-50" />
              <Skeleton className="h-3 w-12.5" />
            </div>
            <Skeleton className="size-9 rounded-full" />
          </div>
          
          {/* Comments Placeholder */}
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}
