import React from 'react';

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

export const MissionSkeleton = () => (
   <div className="p-5 rounded-2xl bg-white border border-gray-100 space-y-3">
      <div className="flex gap-4">
         <Skeleton className="w-10 h-10 shrink-0" />
         <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
         </div>
      </div>
      <Skeleton className="h-10 w-full" />
   </div>
);

export const FeedSkeleton = () => (
   <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
      <div className="flex gap-3">
         <Skeleton className="w-8 h-8" />
         <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-2 w-16" />
         </div>
      </div>
      <Skeleton className="h-6 w-3/4" />
      <div className="grid grid-cols-3 gap-4">
         <Skeleton className="h-4 w-full" />
         <Skeleton className="h-4 w-full" />
         <Skeleton className="h-4 w-full" />
      </div>
   </div>
);

export default Skeleton;
