import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { LecturesGrid } from './GridLayout';
import UniversalCard from './UniversalCard';
import { predavanjaService } from '@/services';
import { safeApiCall, normalizeToArray } from '../utils/dataHelpers';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const RelatedLectures = ({ 
  currentLectureId, 
  type, 
  organizationId, 
  daijaId, 
  organizationName,
  daijaName 
}) => {
  const [lectures, setLectures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const lecturesPerPage = 20;

  // Get the appropriate title based on profile type
  const getTitle = () => {
    switch (type) {
      case 'lecture':
        return 'Ostali dersovi';
      case 'organization':
        return 'Najavljeni dersovi';
      case 'daija':
        return 'Najavljeni dersovi';
      default:
        return 'Najavljeni dersovi';
    }
  };

  const fetchLectures = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let response;
      let allLectures = [];

      switch (type) {
        case 'lecture':
          // Get all lectures from homepage and exclude current one
          response = await safeApiCall(() => predavanjaService.getAllPredavanja(), []);
          allLectures = normalizeToArray(response);
          // Filter out current lecture
          allLectures = allLectures.filter(lecture => lecture._id !== currentLectureId);
          break;

        case 'organization':
          if (organizationId) {
            try {
              response = await safeApiCall(() => predavanjaService.getPredavanjaByOrganization(organizationId), []);
              allLectures = normalizeToArray(response);
            } catch (error) {
              console.warn('Organization lectures endpoint may not exist:', error);
              // Fallback: get all lectures and filter by organizationId
              response = await safeApiCall(() => predavanjaService.getAllPredavanja(), []);
              const allLecturesData = normalizeToArray(response);
              allLectures = allLecturesData.filter(lecture => 
                lecture.organizationId === organizationId || 
                (organizationName && lecture.organization && lecture.organization.includes(organizationName))
              );
            }
          }
          break;

        case 'daija':
          if (daijaId) {
            try {
              response = await safeApiCall(() => predavanjaService.getPredavanjaByDaija(daijaId), []);
              allLectures = normalizeToArray(response);
            } catch (error) {
              console.warn('Daija lectures endpoint may not exist:', error);
              // Fallback: get all lectures and filter by daija
              response = await safeApiCall(() => predavanjaService.getAllPredavanja(), []);
              const allLecturesData = normalizeToArray(response);
              allLectures = allLecturesData.filter(lecture => {
                const matchById = lecture.daija && (lecture.daija._id === daijaId || lecture.daija === daijaId || lecture.daijaId === daijaId);
                const matchByName = daijaName && lecture.speaker && lecture.speaker.includes(daijaName);
                return matchById || matchByName;
              });
            }
          }
          break;

        default:
          allLectures = [];
      }

      // Add type field to all lectures
      const lecturesWithType = allLectures.map(lecture => ({
        ...lecture,
        type: 'Predavanje'
      }));

      // Calculate pagination
      const totalLectures = lecturesWithType.length;
      const calculatedTotalPages = Math.ceil(totalLectures / lecturesPerPage);
      setTotalPages(calculatedTotalPages);

      // Get lectures for current page
      const startIndex = (page - 1) * lecturesPerPage;
      const endIndex = startIndex + lecturesPerPage;
      const currentPageLectures = lecturesWithType.slice(startIndex, endIndex);

      setLectures(currentPageLectures);
    } catch (error) {
      console.error('Error fetching related lectures:', error);
      setError('Greška pri dohvaćanju povezanih predavanja');
    } finally {
      setIsLoading(false);
    }
  }, [type, currentLectureId, organizationId, daijaId, organizationName, daijaName, page, lecturesPerPage]);

  useEffect(() => {
    fetchLectures();
  }, [type, currentLectureId, organizationId, daijaId, page, fetchLectures]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    // Scroll to top of related lectures section
    const element = document.getElementById('related-lectures');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Render pagination numbers
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={page === i}
            className={page === i ? 'bg-[#022C43] text-white hover:bg-[#055A87] hover:text-white' : 'cursor-pointer'}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

  // Don't render if no lectures (except for daija profiles which should always show)
  if (!isLoading && lectures.length === 0 && type !== 'daija') {
    return null;
  }

  return (
    <div id="related-lectures">
      {/* Show section with background and title for all types */}
      {(
        <div className="py-8 md:py-12 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-semibold text-[#022C43] text-center md:text-left">
                {getTitle()}
              </h2>
              {!isLoading && totalPages > 1 && (
                <p className="text-sm text-gray-600 font-medium hidden sm:block">
                  Stranica {page} od {totalPages}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Content container */}
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-[#022C43]" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Lectures Grid */}
        {!isLoading && !error && lectures.length > 0 && (
          <>
            <LecturesGrid>
              {lectures.map((lecture) => (
                <UniversalCard key={lecture._id} data={lecture} />
              ))}
            </LecturesGrid>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 pb-8">
                <Pagination>
                  <PaginationContent>
                    {page > 1 && (
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(page - 1)}
                          className="cursor-pointer"
                        />
                      </PaginationItem>
                    )}
                    {renderPaginationItems()}
                    {page < totalPages && (
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(page + 1)}
                          className="cursor-pointer"
                        />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && !error && lectures.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {type === 'lecture' 
                ? 'Nema drugih dostupnih predavanja' 
                : type === 'daija'
                ? 'Nema najavljenih predavanja'
                : 'Nema organizovanih predavanja'
              }
            </h3>
            <p className="text-sm text-gray-600">
              {type === 'lecture' 
                ? 'Trenutno je ovo jedino dostupno predavanje.' 
                : type === 'daija'
                ? 'Ovaj daija trenutno nema najavljena predavanja.'
                : 'Ova organizacija još uvijek nije organizovala predavanja.'
              }
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default RelatedLectures;