import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, Building2, Clock, Calendar, User, Briefcase, GraduationCap, BookOpen } from 'lucide-react';
import { formatDateWithDay, generateLectureSlug, generateDaijaSlug, generateOrganizationSlug } from '../utils/dataHelpers';
import { getImageUrl, getDefaultLectureImage, getDefaultDaijaImage, getDefaultOrganizationImage } from '@/utils/imageUtils';
import { formatDaijaTitle } from '../utils';
import { useLectureStatusWithCountdown } from '../hooks/useLectureStatus';
import CancelledOverlay from './CancelledOverlay';

const EnhancedUniversalCard = React.memo(({ data }) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  
  // Use real-time status and countdown for lectures
  const lectureStatus = useLectureStatusWithCountdown(
    data?.type?.toLowerCase() === 'predavanje' ? data : null,
    {
      statusUpdateInterval: 60000, // Update status every minute
      countdownUpdateInterval: 1000 // Update countdown every second
    }
  );

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  if (!data) {
    return null;
  }

  const getDisplayData = () => {
    const entityType = data.type?.toLowerCase() || 'unknown';
    
    switch (entityType) {
      case 'predavanje':
        // Use real-time status info or fallback to provided statusInfo
        const statusInfo = lectureStatus.statusInfo || data.statusInfo;
        const isPastLecture = statusInfo?.status === 'past';
        
        return {
          type: 'lecture',
          title: data.title?.toUpperCase() || '',
          image: data.image || getDefaultLectureImage(),
          imageStyle: 'rounded-lg',
          isPastLecture,
          statusInfo,
          countdown: lectureStatus.countdown,
          isLive: lectureStatus.isLive,
          isUpcoming: lectureStatus.isUpcoming,
          infoItems: [
            // Handle multiple daijas
            data.daijaIds && data.daijaIds.length > 1 
              ? { icon: User, text: `${data.daijaIds.length} Predavača` }
              : data.daija && typeof data.daija === 'object' 
                ? { icon: User, text: formatDaijaTitle(data.daija.name, data.daija.title) }
                : data.speaker ? { icon: User, text: data.speaker }
                : null,
            data.organization && { icon: Briefcase, text: data.organization },
            data.date && { icon: Calendar, text: formatDateWithDay(data.date) },
            data.time && { icon: Clock, text: data.time },
            data.address && { icon: MapPin, text: data.address },
            data.city && { icon: Building2, text: data.city }
          ].filter(Boolean),
          onClick: () => {
            const slug = generateLectureSlug(data);
            router.push(`/profile/lecture/${data._id}`);
          }
        };
      
      case 'daija':
        return {
          type: 'daija',
          title: formatDaijaTitle(data.name, data.title),
          titlePrefix: null,
          image: data.image || getDefaultDaijaImage(),
          imageStyle: 'rounded-full',
          infoItems: [
            data.specialization && { icon: GraduationCap, text: data.specialization },
            data.city && { icon: Building2, text: data.city },
            data.lectureCount !== undefined && { 
              icon: BookOpen, 
              text: `Broj predavanja: ${data.lectureCount || 0}`,           
            }
          ].filter(Boolean),
          onClick: () => {
            const slug = generateDaijaSlug(data);
            router.push(`/profile/daija/${data._id}`);
          }
        };
      
      case 'udruženje':
        return {
          type: 'organization',
          title: data.name,
          image: data.image || getDefaultOrganizationImage(),
          imageStyle: 'rounded-lg',
          infoItems: [
            data.shortDescription && { icon: Briefcase, text: data.shortDescription },
            data.address && { icon: MapPin, text: data.address },
            data.city && { icon: Building2, text: data.city },
            data.lectureCount !== undefined && { 
              icon: BookOpen, 
              text: `Broj predavanja: ${data.lectureCount || 0}`,           
            }
          ].filter(Boolean),
          onClick: () => {
            const slug = generateOrganizationSlug(data);
            router.push(`/profile/organization/${data._id}`);
          }
        };
      
      default:
        return null;
    }
  };

  const displayData = getDisplayData();
  
  if (!displayData) {
    return null;
  }

  const imageUrl = imageError ? 
    (displayData.type === 'lecture' ? getDefaultLectureImage() :
     displayData.type === 'daija' ? getDefaultDaijaImage() :
     getDefaultOrganizationImage()) : 
    getImageUrl(displayData.image, displayData.type);

  const getBadgeColor = (color) => {
    switch(color) {
      case 'green': return 'bg-green-50 text-green-600 border-green-200';
      case 'yellow': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'red': return 'bg-red-50 text-red-600 border-red-200';
      case 'gray': return 'bg-gray-50 text-gray-600 border-gray-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <Card 
      className="h-full w-full flex flex-col relative overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={displayData.onClick}
    >
      {/* Live indicator for lectures */}
      {displayData.type === 'lecture' && displayData.isLive && (
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-red-500 text-white font-medium text-xs px-2 py-0.5 animate-pulse border border-red-400 pointer-events-none">
            UŽIVO
          </Badge>
        </div>
      )}

      {/* Countdown for upcoming lectures */}
      {displayData.type === 'lecture' && displayData.isUpcoming && displayData.countdown && (
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-blue-50 text-blue-600 font-medium text-xs px-2 py-0.5 border border-blue-200 pointer-events-none">
            {displayData.countdown}
          </Badge>
        </div>
      )}

      {/* Enhanced Status badge for lectures */}
      {displayData.type === 'lecture' && displayData.statusInfo && (
        <div className="absolute top-3 right-3 z-10">
          <Badge 
            className={`${getBadgeColor(displayData.statusInfo.badgeColor)} font-medium text-xs px-2 py-0.5 max-w-[160px] whitespace-normal text-center border pointer-events-none`}
          >
            {displayData.statusInfo.badgeText || 'N/A'}
          </Badge>
        </div>
      )}
      
      <CardContent className="h-full p-4 flex flex-col overflow-hidden">
        {/* Title section for lectures - full width */}
        {displayData.type === 'lecture' && (
          <>
            <h2 className="text-base font-bold mb-2 mt-6 text-left w-full text-gray-900 truncate">
              {displayData.title}
              {data.lecturePart && ` (dio ${data.lecturePart}.)`}
            </h2>
            <div className="border-b border-gray-200 mb-2" />
          </>
        )}

        <div className="flex h-full flex-1 gap-3">
          {/* Left side - Information */}
          <div className="flex-1 flex flex-col justify-center min-w-0 overflow-hidden">
            {/* Main title for non-lecture types */}
            {displayData.type !== 'lecture' && (
              <h2 className="text-base font-semibold mb-2 text-left text-gray-900 truncate">
                {displayData.title}
                {data.lecturePart && ` (dio ${data.lecturePart}.)`}
              </h2>
            )}

            {/* Info items */}
            <div className="flex flex-col gap-1.5">
              {displayData.infoItems.slice(0, 5).map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-600 line-clamp-1 text-left leading-relaxed">
                      {item.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right side - Image */}
          <div className="w-28 h-36 flex-shrink-0 relative self-center">
            <div className={`w-full h-full relative overflow-hidden shadow-sm ${displayData.imageStyle}`}>
              <Image
                src={imageUrl}
                alt={displayData.title}
                fill
                sizes="112px"
                className="object-cover object-top"
                onError={handleImageError}
              />
            </div>
          </div>
        </div>

        {/* Cancelled overlay for lectures */}
        {displayData.type === 'lecture' && data.cancelled && (
          <CancelledOverlay show={true} />
        )}
      </CardContent>
    </Card>
  );
});

EnhancedUniversalCard.displayName = 'EnhancedUniversalCard';

export default EnhancedUniversalCard;