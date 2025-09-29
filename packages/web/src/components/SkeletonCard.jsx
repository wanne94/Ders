import React from 'react';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';

const SkeletonCard = React.memo(({ type = 'lecture' }) => {
  return (
    <Card className="h-full w-full flex flex-col relative animate-pulse">
      <CardContent className="h-full p-4">
        <div className="flex h-full">
          {/* Left side - Information skeleton */}
          <div className="flex-1 pr-4 flex flex-col justify-center">
            
            {/* Title skeleton */}
            <Skeleton className="h-5 w-4/5 mb-2" />
            
            {/* Second line of title for longer titles */}
            <Skeleton className="h-5 w-3/5 mb-4" />

            {/* Info items skeleton */}
            <div className="flex flex-col gap-2">
              {/* First info item */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-[70%]" />
              </div>
              
              {/* Second info item */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              
              {/* Third info item - conditional based on type */}
              {type === 'lecture' && (
                <>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-3/5" />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-2/5" />
                  </div>
                </>
              )}
              
              {type === 'daija' && (
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-[65%]" />
                </div>
              )}
            </div>

          </div>

          {/* Right side - Image skeleton */}
          <div className="w-20 sm:w-24 h-full flex-shrink-0 flex items-center justify-center">
            <Skeleton
              className={`w-24 ${type === 'daija' ? 'h-24 rounded-full' : 'h-32 rounded-lg'}`}
            />
          </div>

        </div>
      </CardContent>
      
      {/* Status badge skeleton for lectures */}
      {type === 'lecture' && (
        <Skeleton className="absolute top-2 right-2 w-20 h-6 rounded-full" />
      )}
    </Card>
  );
});

SkeletonCard.displayName = 'SkeletonCard';

export default SkeletonCard;