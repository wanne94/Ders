import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, Building2, Clock, Calendar, User, Briefcase, GraduationCap, BookOpen } from 'lucide-react';
import { formatDateWithDay, generateLectureSlug, generateDaijaSlug, generateOrganizationSlug, calculateLectureStatus } from '../utils/dataHelpers';
import CancelledOverlay from './CancelledOverlay';
import { getImageUrl, getImageFallbackUrl, getDefaultLectureImage, getDefaultDaijaImage, getDefaultOrganizationImage } from '@/utils/imageUtils';
import { formatDaijaTitle, generateSlug } from '../utils';
import { logLectureView, logDaijaProfileView, logOrganizationView } from '@/services/analytics';

const UniversalCard = React.memo(({ data }) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [attemptedOptimized, setAttemptedOptimized] = useState(false);

  const handleImageError = useCallback(() => {
    if (!attemptedOptimized) {
      setAttemptedOptimized(true);
    } else {
      setImageError(true);
    }
  }, [attemptedOptimized]);

  if (!data) {
    return null;
  }

  const getDisplayData = () => {
    
    const entityType = data.type?.toLowerCase() || 'unknown';
    
    // Debug log for On je Allah lecture
    if (data.title === 'On je Allah' && data.time === '20:15') {
      console.log('🔍 On je Allah lecture data:', {
        title: data.title,
        organization: data.organization,
        organizationId: data.organizationId,
        hasOrg: !!(data.organization || data.organizationId?.name)
      });
    }
    
    switch (entityType) {
      case 'predavanje':
        // Use new status calculation utility
        const statusInfo = data.statusInfo || calculateLectureStatus(data);
        const isPastLecture = statusInfo.status === 'past';
        
        return {
          type: 'lecture',
          title: data.title?.toUpperCase() || '',
          image: data.image || getDefaultLectureImage(),
          imageStyle: 'rounded-lg',
          isPastLecture,
          statusInfo,
          infoItems: [
            // Handle multiple daijas
            data.daijaIds && data.daijaIds.length > 1 
              ? { icon: User, text: `${data.daijaIds.length} Predavača` }
              : data.daija && typeof data.daija === 'object' 
                ? { icon: User, text: formatDaijaTitle(data.daija.name, data.daija.title) }
                : data.speaker ? { icon: User, text: data.speaker }
                : null,
            (data.organization || data.organizationId?.name || (data.organizationId === "684775e477bc84a3b3d79703" ? "OU Palma" : null)) && { 
              icon: Briefcase, 
              text: data.organization || data.organizationId?.name || (data.organizationId === "684775e477bc84a3b3d79703" ? "OU Palma" : null) 
            },
            data.isSeminar && data.date && data.endDate ? 
              { icon: Calendar, text: `${formatDateWithDay(data.date)} - ${formatDateWithDay(data.endDate)}` } :
              data.date && { icon: Calendar, text: formatDateWithDay(data.date) },
            data.isSeminar && data.seminarSessions ? 
              { icon: Clock, text: `${data.seminarSessions.length} sesija` } :
              data.time && { icon: Clock, text: data.time },
            data.address && { icon: MapPin, text: data.address },
            data.city && { icon: Building2, text: data.city }
          ].filter(Boolean),
          onClick: () => {
            console.log('🔍 Lecture card clicked!', data.title);
            console.log('Data:', data);
            console.log('Router available:', !!router);
            
            try {
              const slug = generateSlug(data.title);
              console.log('Generated slug:', slug);
              console.log('Will navigate to:', `/predavanje/${slug}`);
              
              logLectureView(data._id, data.title, data.organization?._id, data.daija?._id);
              console.log('Analytics logged');
              
              router.push(`/predavanje/${slug}`);
              console.log('Router.push called successfully');
              
            } catch (error) {
              console.error('❌ Error in lecture onClick:', error);
            }
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
            data.city && { icon: MapPin, text: data.city },
            data.lectureCount !== undefined && { 
              icon: BookOpen, 
              text: `Broj predavanja: ${data.lectureCount || 0}`,           
            }
          ].filter(Boolean),
          onClick: () => {
            console.log('🔍 Daija card clicked!', data.name);
            console.log('Data:', data);
            console.log('Router available:', !!router);
            
            try {
              const slug = generateSlug(data.name);
              console.log('Generated slug:', slug);
              console.log('Will navigate to:', `/daija/${slug}`);
              
              logDaijaProfileView(data._id, data.name);
              console.log('Analytics logged');
              
              router.push(`/daija/${slug}`);
              console.log('Router.push called successfully');
              
            } catch (error) {
              console.error('❌ Error in daija onClick:', error);
            }
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
            console.log('🔍 Organization card clicked!', data.name);
            console.log('Data:', data);
            console.log('Router available:', !!router);
            
            try {
              const slug = generateSlug(data.name);
              console.log('Generated slug:', slug);
              console.log('Will navigate to:', `/udruzenje/${slug}`);
              
              logOrganizationView(data._id, data.name);
              console.log('Analytics logged');
              
              router.push(`/udruzenje/${slug}`);
              console.log('Router.push called successfully');
              
            } catch (error) {
              console.error('❌ Error in organization onClick:', error);
            }
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
    (attemptedOptimized ? getImageFallbackUrl(displayData.image) : getImageUrl(displayData.image));

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
      {/* Seminar badge - left side */}
      {displayData.type === 'lecture' && data.isSeminar && (
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-amber-50 text-amber-600 font-medium text-xs px-2 py-0.5 border border-amber-200 pointer-events-none">
            Seminar
          </Badge>
        </div>
      )}
      
      {/* Weekly lecture badge - left side */}
      {displayData.type === 'lecture' && data.isWeeklyLecture && !data.isSeminar && (
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-blue-50 text-blue-600 font-medium text-xs px-2 py-0.5 border border-blue-200 pointer-events-none">
            Sedmično
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
            {/* Title prefix (for daija titles) */}
            {displayData.titlePrefix && (
              <p className="text-xs text-gray-600 mb-1">
                {displayData.titlePrefix}
              </p>
            )}

            {/* Main title for non-lecture types */}
            {displayData.type !== 'lecture' && (
              <h2 className="text-base font-semibold mb-1.5 text-left text-gray-900 truncate">
                {displayData.title}
                {data.lecturePart && ` (dio ${data.lecturePart}.)`}
              </h2>
            )}

            {/* Info items */}
            <div className="flex flex-col gap-0.5">
              {displayData.infoItems.slice(0, 6).map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-[15px] text-gray-600 line-clamp-1 text-left leading-tight">
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
              {/* Cancelled overlay on image only for lectures */}
              {displayData.type === 'lecture' && (data.cancelled || data.isCancelled || displayData.statusInfo?.status === 'cancelled') && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-red-500 text-white font-extrabold text-xs tracking-wider uppercase py-1.5 px-10 rotate-[-30deg] shadow-lg transform-gpu">
                      OTKAZANO
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

UniversalCard.displayName = 'UniversalCard';

// Optimize memo comparison
export default React.memo(UniversalCard, (prevProps, nextProps) => {
  // Deep comparison for critical fields only
  const prevData = prevProps.data;
  const nextData = nextProps.data;
  
  if (!prevData && !nextData) return true;
  if (!prevData || !nextData) return false;
  
  // Compare only fields that affect rendering
  return (
    prevData._id === nextData._id &&
    prevData.title === nextData.title &&
    prevData.type === nextData.type &&
    prevData.isCancelled === nextData.isCancelled &&
    prevData.image === nextData.image &&
    prevData.date === nextData.date &&
    prevData.time === nextData.time
  );
});