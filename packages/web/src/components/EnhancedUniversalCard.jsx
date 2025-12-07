import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, Building2, Clock, Calendar, User, Briefcase, GraduationCap, CalendarCheck, BookOpen } from 'lucide-react';
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

  const getHeldLecturesCount = (entity) => {
    if (!entity) return null;

    const possibleKeys = [
      'completedLecturesCount',
      'heldLecturesCount',
      'lecturesHeld',
      'lectureCount'
    ];

    for (const key of possibleKeys) {
      const value = entity[key];
      if (typeof value === 'number' && !Number.isNaN(value)) {
        return value;
      }
    }

    return null;
  };

  const formatHeldLecturesText = (count) => {
    if (count === 0) {
      return '0 održanih predavanja';
    }

    if (count === 1) {
      return '1 održano predavanje';
    }

    if (count >= 2 && count <= 4) {
      return `${count} održana predavanja`;
    }

    return `${count} održanih predavanja`;
  };

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
            typeof data.lectureCount === 'number' && {
              icon: BookOpen,
              text: `Broj predavanja: ${data.lectureCount || 0}`
            }
          ].filter(Boolean),
          onClick: () => {
            const slug = generateDaijaSlug(data);
            router.push(`/profile/daija/${data._id}`);
          }
        };
      
      case 'udruženje': {
        const heldLecturesCount = getHeldLecturesCount(data);

        return {
          type: 'organization',
          title: data.name,
          image: data.image || getDefaultOrganizationImage(),
          imageStyle: 'rounded-lg',
          infoItems: [
            typeof heldLecturesCount === 'number' && {
              icon: CalendarCheck,
              text: formatHeldLecturesText(heldLecturesCount)
            },
            data.shortDescription && { icon: Briefcase, text: data.shortDescription },
            data.address && { icon: MapPin, text: data.address },
            data.city && { icon: Building2, text: data.city }
          ].filter(Boolean),
          onClick: () => {
            const slug = generateOrganizationSlug(data);
            router.push(`/profile/organization/${data._id}`);
          }
        };
      }
      
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

  const isDaijaCard = displayData.type === 'daija';
  const isOrganizationCard = displayData.type === 'organization';
  const isLectureCard = displayData.type === 'lecture';
  const daijaName = data?.name || displayData.title;
  const daijaTitle = data?.title;

  // Check if lecture is cancelled
  const isCancelled = data.cancelled || data.isCancelled || displayData.statusInfo?.status === 'cancelled';

  return (
    <Card
      className={`flex flex-col relative overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 cursor-pointer w-full ${
        isOrganizationCard ? 'min-h-[260px]' : isLectureCard ? 'h-auto' : 'h-[240px]'
      } ${isLectureCard && isCancelled ? 'opacity-85' : ''}`}
      onClick={displayData.onClick}
    >
      {/* Live indicator for lectures - identično mobilnoj */}
      {displayData.type === 'lecture' && displayData.isLive && (
        <div className="absolute top-2 left-2 z-10">
          <Badge className="bg-red-500 text-white font-bold text-xs px-1.5 py-1 animate-pulse border border-red-400 pointer-events-none rounded">
            UŽIVO
          </Badge>
        </div>
      )}

      {/* Countdown for upcoming lectures - identično mobilnoj */}
      {displayData.type === 'lecture' && displayData.isUpcoming && displayData.countdown && !displayData.isLive && (
        <div className="absolute top-2 left-2 z-10">
          <Badge className="bg-[#e3f2fd] text-[#1565c0] font-bold text-xs px-1.5 py-1 pointer-events-none rounded">
            {displayData.countdown}
          </Badge>
        </div>
      )}

      {/* Status badge for lectures - identično mobilnoj */}
      {displayData.type === 'lecture' && displayData.statusInfo && (
        <div className="absolute top-2 right-2 z-10">
          <Badge
            className={`${getBadgeColor(displayData.statusInfo.badgeColor)} font-bold text-xs px-1.5 py-1 max-w-[180px] whitespace-normal text-center border pointer-events-none rounded`}
          >
            {displayData.statusInfo.badgeText || 'N/A'}
          </Badge>
        </div>
      )}
      
      <CardContent
        className={
          isDaijaCard
            ? 'h-full p-4 flex flex-col items-center justify-center text-center gap-2'
            : isOrganizationCard
              ? 'p-0 h-full flex flex-col'
              : 'p-4 flex flex-col overflow-hidden'
        }
      >
        {isOrganizationCard ? (
          /* Organization kartica */
          <div className="flex flex-col h-full">
            <div className="relative w-full h-36 sm:h-40 overflow-hidden bg-gray-100">
              <Image
                src={imageUrl}
                alt={displayData.title}
                fill
                sizes="(min-width: 640px) 180px, 100vw"
                className="object-cover"
                onError={handleImageError}
              />
            </div>
            <div className="flex flex-col flex-1 px-4 py-4 gap-2">
              <h2 className="text-base font-semibold text-gray-900 leading-tight">
                {displayData.title}
              </h2>
              {displayData.infoItems.length > 0 && (
                <div className="flex flex-col gap-2">
                  {displayData.infoItems.slice(0, 6).map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index} className="flex items-start gap-2">
                        <Icon className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="text-[15px] text-gray-600 leading-snug line-clamp-2">
                          {item.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : isDaijaCard ? (
          /* Daija kartica - identično mobilnoj: slika desno 100x100 kružna, info lijevo */
          <div className="flex flex-row items-center justify-between w-full gap-6 py-2">
            {/* Left side - Info */}
            <div className="flex flex-col flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-[#022C43] mb-1">
                {daijaName}
              </h2>
              {daijaTitle && (
                <span className="text-xs text-gray-500 mb-2">
                  {daijaTitle.toUpperCase()}
                </span>
              )}
              {displayData.infoItems.length > 0 && (
                <div className="flex flex-col gap-1">
                  {displayData.infoItems.slice(0, 4).map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-gray-500" />
                        <span className="text-[13px] text-gray-600 leading-[18px]">
                          {item.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Right side - Circular image 100x100 */}
            <div className="w-[100px] h-[100px] flex-shrink-0">
              <div className="relative w-full h-full rounded-full overflow-hidden shadow-sm border border-gray-100 bg-gray-50">
                <Image
                  src={imageUrl}
                  alt={daijaName}
                  fill
                  sizes="100px"
                  className="object-cover"
                  onError={handleImageError}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Lecture kartica - identično mobilnoj */
          <>
            {/* Title section for lectures - sa border bottom, padding za badges */}
            {displayData.type === 'lecture' && (
              <div className="pt-9 pb-1 border-b border-[#e0e0e0] mb-1">
                <h2 className="text-lg font-bold text-[#022C43] leading-[23px] text-left uppercase line-clamp-2">
                  {displayData.title}
                  {data.lecturePart && ` (dio ${data.lecturePart}.)`}
                </h2>
              </div>
            )}

            {/* Content row - identično mobilnoj */}
            <div className="flex flex-row flex-1 mt-1 gap-6">
              {/* Left side - Information */}
              <div className="flex-1 flex flex-col justify-center min-w-0 overflow-hidden">
                {/* Main title for non-lecture types */}
                {displayData.type !== 'lecture' && (
                  <h2 className="text-lg font-semibold text-[#022C43] leading-[22px] mb-1 text-left line-clamp-2">
                    {displayData.title}
                    {data.lecturePart && ` (dio ${data.lecturePart}.)`}
                  </h2>
                )}

                {/* Info items - gap identičan mobilnoj (4px) */}
                <div className="flex flex-col gap-1">
                  {displayData.infoItems.slice(0, 6).map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index} className="flex items-center gap-2 mb-0.5">
                        <Icon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <span className="text-[13px] text-gray-600 line-clamp-1 text-left leading-[18px] pr-2">
                          {item.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right side - Image 100x130px za lecture - identično mobilnoj */}
              <div className="w-[100px] flex-shrink-0 flex justify-center items-center">
                <div className="w-[100px] h-[130px] relative overflow-hidden shadow-sm rounded-lg">
                  <Image
                    src={imageUrl}
                    alt={displayData.title}
                    fill
                    sizes="100px"
                    className="object-cover object-top"
                    onError={handleImageError}
                  />
                  {/* Cancelled overlay - dijagonalna sa -45deg rotacijom - identično mobilnoj */}
                  {isCancelled && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 rounded-lg">
                      <div
                        className="absolute bg-[#f44336] flex items-center justify-center shadow-md"
                        style={{
                          top: '50%',
                          left: '50%',
                          width: '200px',
                          height: '30px',
                          transform: 'translate(-50%, -50%) rotate(-45deg)',
                        }}
                      >
                        <span className="text-white text-xs font-bold tracking-wider text-center drop-shadow-sm">
                          OTKAZANO
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
});

EnhancedUniversalCard.displayName = 'EnhancedUniversalCard';

export default EnhancedUniversalCard;
