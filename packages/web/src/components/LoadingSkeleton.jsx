import React from 'react';
import { Skeleton } from './ui/skeleton';
import { Card, CardContent } from './ui/card';

const LoadingSkeleton = ({ type = 'list', count = 5 }) => {
  const renderListItem = () => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Skeleton className="w-20 h-20 rounded" />
          <div className="flex-1">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-5 w-1/2 mb-2" />
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderCardItem = () => (
    <div className="col-span-12 sm:col-span-6 md:col-span-4">
      <Card>
        <Skeleton className="h-48 w-full rounded-t-lg" />
        <CardContent className="p-4">
          <Skeleton className="h-7 w-4/5 mb-2" />
          <Skeleton className="h-5 w-full mb-1" />
          <Skeleton className="h-5 w-3/5 mb-4" />
          <div className="flex justify-between gap-2">
            <Skeleton className="h-9 w-[45%] rounded" />
            <Skeleton className="h-9 w-[45%] rounded" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTableRow = () => (
    <div className="flex items-center p-4 border-b gap-4">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-5 w-1/3" />
      </div>
      <Skeleton className="h-5 w-[15%]" />
      <Skeleton className="h-5 w-[15%]" />
      <div className="flex gap-2">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
    </div>
  );

  const renderStatsSkeleton = () => (
    <Card>
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <Skeleton className="h-8 w-3/5 mx-auto mb-2" />
          <Skeleton className="h-5 w-2/5 mx-auto" />
        </div>
        
        <div className="flex justify-between items-end h-48 mb-6">
          {[...Array(12)].map((_, index) => (
            <div key={index} className="w-[7%] flex flex-col items-center">
              <Skeleton 
                className="w-full mb-2"
                style={{ height: Math.random() * 150 + 50 }}
              />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <Skeleton className="h-10 w-64 mx-auto rounded-md" />
        </div>
      </CardContent>
    </Card>
  );

  const renderDetailsSkeleton = () => (
    <Card>
      <Skeleton className="h-72 w-full rounded-t-lg" />
      <CardContent className="p-6">
        <Skeleton className="h-9 w-3/4 mb-2" />
        <Skeleton className="h-6 w-1/2 mb-6" />
        
        <div className="space-y-4">
          {[...Array(4)].map((_, index) => (
            <div key={index}>
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          ))}
        </div>
        
        <div className="flex gap-4 mt-8">
          <Skeleton className="h-10 w-32 rounded" />
          <Skeleton className="h-10 w-32 rounded" />
        </div>
      </CardContent>
    </Card>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="grid grid-cols-12 gap-6">
            {[...Array(count)].map((_, index) => (
              <React.Fragment key={index}>
                {renderCardItem()}
              </React.Fragment>
            ))}
          </div>
        );
      
      case 'table':
        return (
          <Card>
            {[...Array(count)].map((_, index) => (
              <React.Fragment key={index}>
                {renderTableRow()}
              </React.Fragment>
            ))}
          </Card>
        );
      
      case 'stats':
        return renderStatsSkeleton();
      
      case 'details':
        return renderDetailsSkeleton();
      
      case 'list':
      default:
        return (
          <>
            {[...Array(count)].map((_, index) => (
              <React.Fragment key={index}>
                {renderListItem()}
              </React.Fragment>
            ))}
          </>
        );
    }
  };

  return (
    <div className="w-full p-4">
      {renderSkeleton()}
    </div>
  );
};

export default LoadingSkeleton;