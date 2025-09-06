import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  MapPin,
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Facebook,
  Instagram,
  MessageCircle,
  FileText,
  Building,
  Navigation,
  X,
  CalendarDays,
  Loader2,
  Send,
  Users,
  Info,
  Phone,
  Mail,
  Globe,
  BookOpen,
  Award,
  Heart,
  Star,
  TrendingUp,
  Activity,
  BarChart3,
  Share2,
  Eye,
  Hash,
} from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import ContentContainer from '@/components/ContentContainer';
import ShareButton from '@/components/ShareButton';
import UniversalCard from '@/components/UniversalCard';
import CancellationReportButton from '@/components/CancellationReportButton';
import CancelledOverlay from '@/components/CancelledOverlay';
import SkeletonProfile from '@/components/SkeletonProfile';
import SkeletonGrid from '@/components/SkeletonGrid';
import { predavanjaService, daijeService, udruzenjaService } from '@/services';
import { formatDateWithDay } from '@/utils/dataHelpers';
import { getImageUrl, getDefaultLectureImage, getDefaultDaijaImage, getDefaultOrganizationImage } from '@/utils/imageUtils';
import { formatDaijaTitle, generateSlug } from '@/utils';
import { safeApiCall, normalizeToArray } from '@/utils/dataHelpers';
import { downloadICS, addToGoogleCalendar } from '@/utils/calendarUtils';
import { sortLecturesByStatus } from '@/helpers/sortingHelpers';
import { getUserData, getToken } from '@/utils/authHelpers';
import LectureFormNew from '@/components/LectureFormNew';
import UnifiedFormNew from '@/components/UnifiedFormNew';

const ProfilePage = () => {
  const router = useRouter();
  const { type, params } = router.query;
  
  // Extract ID from params array (params[0] is ID, params[1] is optional slug)
  const id = params?.[0];
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  
  // Related lectures state
  const [relatedLectures, setRelatedLectures] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [relatedError, setRelatedError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const lecturesPerPage = 10;
  
  // Other upcoming lectures state (for display below hero)
  const [upcomingLectures, setUpcomingLectures] = useState([]);
  const [upcomingLoading, setUpcomingLoading] = useState(true);
  
  // Calendar dropdown state
  const [calendarAnchorEl, setCalendarAnchorEl] = useState(null);
  const calendarOpen = Boolean(calendarAnchorEl);
  
  // Auth and admin state
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const userData = getUserData();
    console.log('ProfilePage - User data:', userData);
    if (userData) {
      setUser(userData);
      const adminStatus = userData.role === 'admin' || userData.role === 'super_admin' || userData.role === 'superadmin';
      setIsAdmin(adminStatus);
      console.log('ProfilePage - Is admin:', adminStatus, 'Role:', userData.role);
    }
  }, []);

  useEffect(() => {
    if (!type || !id) return;
    
    // Prevent multiple fetches
    let isMounted = true;
    
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        let data;
        if (type === 'lecture') {
          data = await predavanjaService.getPredavanjeById(id);
          console.log('Fetched lecture data:', data);
          console.log('Speaker info:', {
            speaker: data.speaker,
            daijaName: data.daijaName,
            daijaTitle: data.daijaTitle,
            daija: data.daija,
            daijaIds: data.daijaIds
          });
        } else if (type === 'daija') {
          data = await daijeService.getDaijaById(id);
        } else if (type === 'organization') {
          data = await udruzenjaService.getUdruzenjeById(id);
        } else {
          throw new Error('Nepoznat tip profila');
        }

        if (isMounted) {
          setProfile(data);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching profile:', err);
          setError(err.response?.data?.message || 'Greška pri učitavanju profila');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();
    
    return () => {
      isMounted = false;
    };
  }, [type, id]);

  // Fetch related lectures for organizations and daijes
  useEffect(() => {
    // Skip if not the right type or still loading
    if (!type || !id || type === 'lecture') return;
    if (loading || !profile) return; // Wait for profile to finish loading
    
    const fetchRelatedLectures = async () => {
      try {
        setRelatedLoading(true);
        setRelatedError(null);
        
        let lectures = [];
        if (type === 'organization') {
          lectures = await safeApiCall(
            () => predavanjaService.getPredavanjaByOrganization(id),  // Wrap in arrow function
            []
          );
        } else if (type === 'daija') {
          lectures = await safeApiCall(
            () => predavanjaService.getPredavanjaBySpeaker(id),  // Wrap in arrow function
            []
          );
        }
        
        // Normalize to array
        lectures = normalizeToArray(lectures);
        
        // Filter only approved lectures (not cancelled)
        const approvedLectures = lectures.filter(lecture => {
          // Check if lecture is approved
          if (lecture.status !== 'approved') return false;
          
          // Check if lecture is not cancelled
          if (lecture.isCancelled || lecture.status === 'cancelled') return false;
          
          return true;
        });
        
        // Sort by date (descending - newest first)
        approvedLectures.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setRelatedLectures(approvedLectures);
        setTotalPages(Math.ceil(approvedLectures.length / lecturesPerPage));
      } catch (err) {
        console.error('Error fetching related lectures:', err);
        setRelatedError('Greška pri učitavanju povezanih predavanja');
      } finally {
        setRelatedLoading(false);
      }
    };
    
    fetchRelatedLectures();
  }, [type, id, loading]); // Added loading to dependencies
  
  // Fetch upcoming lectures for all profile types
  useEffect(() => {
    // Wait for profile to finish loading
    if (loading) return;
    if (!profile && type === 'lecture') return;
    
    const fetchUpcomingLectures = async () => {
      try {
        setUpcomingLoading(true);
        
        // Get all lectures - same as home page
        const allLectures = await predavanjaService.getAllPredavanja(1, 100, 'all');
        
        // Normalize lectures - handle both array and object responses
        let normalized = [];
        if (Array.isArray(allLectures)) {
          normalized = allLectures;
        } else if (allLectures && allLectures.data) {
          normalized = Array.isArray(allLectures.data) ? allLectures.data : [];
        } else if (allLectures && typeof allLectures === 'object') {
          normalized = Object.values(allLectures);
        }
        
        // Filter only approved lectures and exclude based on profile type
        const approvedLectures = normalized.filter(lecture => {
          // Must be approved
          if (lecture.status !== 'approved') return false;
          
          // If we're viewing a lecture profile, exclude the current lecture
          if (type === 'lecture' && profile && lecture._id === profile._id) {
            return false;
          }
          
          // If we're viewing a daija profile, exclude lectures by this daija
          if (type === 'daija' && profile) {
            // Check if lecture is by this daija
            if (lecture.daijaName === profile.name || 
                lecture.speaker === profile.name ||
                (lecture.daija && typeof lecture.daija === 'object' && lecture.daija._id === profile._id) ||
                lecture.daija === profile._id) {
              return false;
            }
          }
          
          // If we're viewing an organization profile, exclude lectures by this organization
          if (type === 'organization' && profile) {
            // Check if lecture is by this organization
            if (lecture.organizationName === profile.name ||
                (lecture.organization && typeof lecture.organization === 'object' && lecture.organization._id === profile._id) ||
                (lecture.organizationId && typeof lecture.organizationId === 'object' && lecture.organizationId._id === profile._id) ||
                lecture.organization === profile._id ||
                lecture.organizationId === profile._id) {
              return false;
            }
          }
          
          return true;
        });
        
        // Sort using the same logic as home page (U toku -> Uskoro -> Prošlo)
        const sorted = sortLecturesByStatus(approvedLectures);
        
        // Take first 10 for display
        const forDisplay = sorted.slice(0, 10);
        
        setUpcomingLectures(forDisplay);
      } catch (err) {
        console.error('Error fetching upcoming lectures:', err);
        setUpcomingLectures([]); // Set empty array on error
      } finally {
        setUpcomingLoading(false);
      }
    };
    
    fetchUpcomingLectures();
  }, [type, id, loading]); // Added loading to dependencies

  const getTitle = () => {
    if (!profile) return '';
    
    if (type === 'daija') {
      return formatDaijaTitle(profile.name, profile.title);
    } else if (type === 'lecture') {
      return profile.title || 'Predavanje';
    } else if (type === 'organization') {
      return profile.name || 'Organizacija';
    }
    return '';
  };

  const getDefaultImage = () => {
    if (type === 'daija') return getDefaultDaijaImage();
    if (type === 'organization') return getDefaultOrganizationImage();
    return getDefaultLectureImage();
  };

  // Get back button path based on profile type
  const getBackPath = () => {
    if (type === 'daija') return '/daije';
    if (type === 'organization') return '/udruzenja';
    return '/';
  };

  const getBackText = () => {
    if (type === 'daija') return 'Nazad na daije';
    if (type === 'organization') return 'Nazad na udruženja';
    return 'Nazad na predavanja';
  };

  // Calendar functions
  const handleCalendarClick = (event) => {
    setCalendarAnchorEl(event.currentTarget);
  };

  const handleCalendarClose = () => {
    setCalendarAnchorEl(null);
  };

  const handleAddToCalendar = (method) => {
    handleCalendarClose();
    
    if (method === 'google') {
      addToGoogleCalendar(profile);
    } else if (method === 'ics') {
      downloadICS(profile);
    }
  };

  // Paginated lectures for display
  const getPaginatedLectures = () => {
    const startIndex = (page - 1) * lecturesPerPage;
    const endIndex = startIndex + lecturesPerPage;
    return relatedLectures.slice(startIndex, endIndex);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    // Scroll to top of related lectures section
    const element = document.getElementById('related-lectures');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Function to open directions
  const openDirections = () => {
    const address = [profile.address, profile.city].filter(Boolean).join(', ');
    const encoded = encodeURIComponent(address);
    
    // Check if on mobile to open in app
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      if (isIOS) {
        window.open(`maps://maps.google.com/maps?daddr=${encoded}`, '_blank');
        setTimeout(() => {
          window.open(`https://maps.google.com/maps?daddr=${encoded}`, '_blank');
        }, 500);
      } else {
        window.open(`https://maps.google.com/maps?daddr=${encoded}`, '_blank');
      }
    } else {
      window.open(`https://maps.google.com/maps?daddr=${encoded}`, '_blank');
    }
  };

  // Admin functions
  const handleEdit = async (formData) => {
    try {
      let response;
      if (type === 'lecture') {
        response = await predavanjaService.updatePredavanje(profile._id, formData || editForm);
        if (response.success) {
          setProfile(response.lecture);
        }
      } else if (type === 'daija') {
        response = await daijeService.updateDaija(profile._id, formData || editForm);
        if (response.success) {
          setProfile(response.daija);
        }
      } else if (type === 'organization') {
        response = await udruzenjaService.updateUdruzenje(profile._id, formData || editForm);
        if (response.success) {
          setProfile(response.organization);
        }
      }
      
      if (response?.success) {
        setShowEditModal(false);
        alert(`${type === 'lecture' ? 'Predavanje' : type === 'daija' ? 'Daija' : 'Organizacija'} je uspješno ažurirano`);
        // Refresh the page data
        window.location.reload();
      }
    } catch (error) {
      alert(`Greška pri ažuriranju ${type === 'lecture' ? 'predavanja' : type === 'daija' ? 'daije' : 'organizacije'}`);
    }
  };
  
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      // Check if user is authenticated before attempting delete
      const currentUser = getUserData();
      const token = getToken();
      if (!currentUser || !token) {
        alert('Morate biti prijavljeni da biste obrisali ovaj sadržaj');
        router.push('/login');
        return;
      }
      
      let response;
      
      if (type === 'lecture') {
        response = await predavanjaService.deletePredavanje(profile._id);
      } else if (type === 'daija') {
        response = await daijeService.deleteDaija(profile._id);
      } else if (type === 'organization') {
        response = await udruzenjaService.deleteUdruzenje(profile._id);
      }
      
      if (response?.success || response?.message) {
        alert(`${type === 'lecture' ? 'Predavanje' : type === 'daija' ? 'Daija' : 'Organizacija'} je uspješno obrisano`);
        setShowDeleteDialog(false);
        // Redirect to list page
        router.push(`/${type === 'lecture' ? 'lectures' : type === 'daija' ? 'daije' : 'organizations'}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        alert('Vaša sesija je istekla. Molimo prijavite se ponovo.');
        router.push('/login');
      } else if (error.response?.status === 403) {
        alert('Nemate dozvolu za brisanje ovog sadržaja');
      } else {
        alert(`Greška pri brisanju ${type === 'lecture' ? 'predavanja' : type === 'daija' ? 'daije' : 'organizacije'}: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <SkeletonProfile type={type} />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <ContentContainer>
          <div className="py-4">
            <Alert className="mb-4" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button 
              onClick={() => router.push(getBackPath())}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {getBackText()}
            </Button>
          </div>
        </ContentContainer>
      </PageLayout>
    );
  }

  if (!profile) {
    return (
      <PageLayout>
        <ContentContainer>
          <div className="py-4">
            <Alert className="mb-4">
              <AlertDescription>Profil nije pronađen</AlertDescription>
            </Alert>
            <Button 
              onClick={() => router.push(getBackPath())}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {getBackText()}
            </Button>
          </div>
        </ContentContainer>
      </PageLayout>
    );
  }

  // Generate dynamic title for SEO
  const getPageTitle = () => {
    if (!profile) return 'Profil - Ders';
    
    if (type === 'daija') {
      const name = profile.name || 'Daija';
      const title = profile.title || '';
      const bio = profile.bio ? ' - Biografija' : '';
      return `${name}${title ? ', ' + title : ''}${bio}`;
    } else if (type === 'lecture') {
      return `${profile.title || 'Predavanje'} - Ders`;
    } else if (type === 'organization') {
      return `${profile.name || 'Organizacija'} - Ders`;
    }
    return 'Profil - Ders';
  };

  const getPageDescription = () => {
    if (!profile) return '';
    
    if (type === 'daija') {
      return profile.bio || `Profil daije ${profile.name}. Pronađite predavanja i informacije.`;
    } else if (type === 'lecture') {
      // Create detailed description for lectures
      const formattedDate = formatDateWithDay(profile.date);
      
      let description = `📚 ${profile.title}`;
      description += ` | 📅 ${formattedDate} u ${profile.time}`;
      description += ` | 📍 ${profile.address}, ${profile.city}`;
      
      if (profile.daijaName) {
        description += ` | 👤 Predavač: ${profile.daijaTitle ? `${profile.daijaTitle} ` : ''}${profile.daijaName}`;
      }
      
      if (profile.organizationName) {
        description += ` | 🕌 ${profile.organizationName}`;
      }
      
      return description;
    } else if (type === 'organization') {
      let description = profile.description || `${profile.name} - Islamska organizacija`;
      if (profile.address || profile.city) {
        description += ` | 📍 ${[profile.address, profile.city].filter(Boolean).join(', ')}`;
      }
      if (profile.phone) {
        description += ` | ☎️ ${profile.phone}`;
      }
      return description;
    }
    return '';
  };

  // Get canonical URL for profile
  const getCanonicalUrl = () => {
    if (!profile) return 'https://ders.ba';
    
    // For daija profiles, use short URL
    if (type === 'daija' && profile?.name) {
      const slug = generateSlug(profile.name);
      return `https://ders.ba/daija/${slug}`;
    }
    
    // For lecture profiles, use short URL
    if (type === 'lecture' && profile?.title) {
      const slug = generateSlug(profile.title);
      return `https://ders.ba/predavanje/${slug}`;
    }
    
    return `https://ders.ba/profile/${type}/${id}`;
  };

  // Get days until lecture
  const getDaysUntilLecture = () => {
    if (!profile.date) return null;
    const lectureDate = new Date(profile.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lectureDate.setHours(0, 0, 0, 0);
    const diffTime = lectureDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntil = type === 'lecture' ? getDaysUntilLecture() : null;

  return (
    <>
      <Head>
        <title>{getPageTitle()}</title>
        <meta name="description" content={getPageDescription()} />
        <link rel="canonical" href={getCanonicalUrl()} />
        {profile && (
          <>
            {/* Open Graph tags for better social sharing */}
            <meta property="og:title" content={getPageTitle()} />
            <meta property="og:description" content={getPageDescription()} />
            <meta property="og:url" content={getCanonicalUrl()} />
            <meta property="og:type" content={type === 'lecture' ? 'event' : 'profile'} />
            <meta property="og:site_name" content="Ders.ba - Islamska predavanja" />
            <meta property="og:image" content={profile.image ? getImageUrl(profile.image) : getImageUrl(getDefaultImage())} />
            <meta property="og:image:secure_url" content={profile.image ? getImageUrl(profile.image) : getImageUrl(getDefaultImage())} />
            <meta property="og:image:type" content="image/jpeg" />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            
            {/* Additional Open Graph tags for lectures */}
            {type === 'lecture' && (
              <>
                <meta property="og:image:alt" content={`${profile.title} - Predavanje`} />
                <meta property="event:start_time" content={new Date(profile.date).toISOString()} />
                {profile.address && <meta property="og:locality" content={profile.city} />}
                {profile.organizationName && <meta property="og:see_also" content={profile.organizationName} />}
              </>
            )}
            
            {/* Twitter Card tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={getPageTitle()} />
            <meta name="twitter:description" content={getPageDescription()} />
            <meta name="twitter:image" content={profile.image ? getImageUrl(profile.image) : getImageUrl(getDefaultImage())} />
            
            {/* Additional meta tags for rich snippets */}
            {type === 'lecture' && (
              <>
                <meta itemProp="name" content={profile.title} />
                <meta itemProp="description" content={getPageDescription()} />
                <meta itemProp="startDate" content={new Date(profile.date).toISOString()} />
                <meta itemProp="endDate" content={new Date(profile.date).toISOString()} />
                <meta itemProp="location" content={`${profile.address}, ${profile.city}`} />
                {profile.daijaName && <meta itemProp="performer" content={profile.daijaName} />}
                {profile.organizationName && <meta itemProp="organizer" content={profile.organizationName} />}
              </>
            )}
          </>
        )}
      </Head>
      <PageLayout>
        <ContentContainer>
          <div className="py-2">
            {/* Back Button */}
            <div className="mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(getBackPath())}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {getBackText()}
              </Button>
            </div>

            {/* Hero Section with Enhanced Layout */}
            <div className="bg-gradient-to-br from-[#022C43] to-[#055A87] text-white rounded-2xl overflow-hidden mb-4 relative">
              {/* Decorative Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
              </div>
              
              <ContentContainer>
                <div className="relative z-10 py-8">
                  {/* Main Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column - Image and Quick Info */}
                    <div className="lg:col-span-4">
                      {/* Profile Image */}
                      <div
                        onClick={() => setImageModalOpen(true)}
                        className={`
                          relative w-full ${type === 'lecture' ? 'h-full min-h-[400px]' : 'aspect-square'} max-w-sm mx-auto lg:max-w-none
                          ${type === 'daija' ? 'rounded-full' : 'rounded-2xl'}
                          overflow-hidden border-4 border-white/20 shadow-2xl
                          transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-3xl
                          group
                        `}
                      >
                        <img
                          src={getImageUrl(profile.image) || getDefaultImage()}
                          alt={profile.title || profile.name}
                          className={`w-full ${type === 'lecture' ? 'h-full object-contain bg-black/5' : 'h-full object-cover'}`}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getDefaultImage();
                          }}
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Eye className="h-12 w-12 text-white" />
                        </div>
                        {/* Cancellation Overlay for lectures */}
                        {type === 'lecture' && (
                          <CancelledOverlay 
                            show={profile.isCancelled || profile.status === 'cancelled'}
                            text="OTKAZANO"
                            variant="diagonal"
                          />
                        )}
                      </div>

                    </div>

                    {/* Middle and Right Column - Main Info */}
                    <div className="lg:col-span-8">
                      {/* Title and Statistics Row */}
                      <div className="mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          {/* Title and Badges */}
                          <div className="flex-1">
                            <h1 className={`
                              font-${type === 'lecture' ? 'bold' : 'medium'} 
                              text-3xl md:text-5xl tracking-tight mb-3
                              ${type === 'lecture' ? 'uppercase' : ''}
                            `}>
                              {getTitle()}
                            </h1>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-2">
                          {type === 'lecture' && profile.isSeminar && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold px-4 py-1.5 shadow-lg">
                              <CalendarDays className="h-4 w-4 mr-1" />
                              SEMINAR
                            </Badge>
                          )}
                          {type === 'lecture' && profile.isWeeklyLecture && !profile.isSeminar && (
                            <Badge className="bg-blue-500/20 text-blue-100 border-blue-400/30 px-3 py-1">
                              <CalendarDays className="h-3 w-3 mr-1" />
                              Sedmično predavanje
                            </Badge>
                          )}
                          {type === 'daija' && profile.title && (
                            <Badge className="bg-purple-500/20 text-purple-100 border-purple-400/30 px-3 py-1">
                              <Award className="h-3 w-3 mr-1" />
                              {profile.title}
                            </Badge>
                          )}
                          {type === 'organization' && (
                            <Badge className="bg-green-500/20 text-green-100 border-green-400/30 px-3 py-1">
                              <Users className="h-3 w-3 mr-1" />
                              Islamsko udruženje
                            </Badge>
                          )}
                            </div>
                          </div>

                          {/* Statistics Cards - For daija and organization profiles */}
                          {type !== 'lecture' && (
                            <div className="flex gap-3">
                              {/* Number of lectures */}
                              {relatedLectures.length > 0 && (
                                <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                                  <CardContent className="p-4 text-center">
                                    {type === 'organization' ? (
                                      <Activity className="h-6 w-6 mx-auto mb-2 text-blue-300" />
                                    ) : (
                                      <BookOpen className="h-6 w-6 mx-auto mb-2 text-purple-300" />
                                    )}
                                    <div className="text-2xl font-bold">{relatedLectures.length}</div>
                                    <div className="text-xs opacity-80">Predavanja</div>
                                  </CardContent>
                                </Card>
                              )}

                              {/* Views if available */}
                              {profile.views && (
                                <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                                  <CardContent className="p-4 text-center">
                                    <Eye className="h-6 w-6 mx-auto mb-2 text-yellow-300" />
                                    <div className="text-2xl font-bold">{profile.views || 0}</div>
                                    <div className="text-xs opacity-80">Pregleda</div>
                                  </CardContent>
                                </Card>
                              )}

                              {/* Rating if available */}
                              {profile.rating && (
                                <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                                  <CardContent className="p-4 text-center">
                                    <Star className="h-6 w-6 mx-auto mb-2 text-yellow-300" />
                                    <div className="text-2xl font-bold">{profile.rating}</div>
                                    <div className="text-xs opacity-80">Ocjena</div>
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Cancellation Notice */}
                      {type === 'lecture' && (profile.isCancelled || profile.status === 'cancelled') && (
                        <Alert className="mb-6 bg-red-500/20 border-red-500/50 text-white">
                          <X className="h-5 w-5" />
                          <AlertDescription className="ml-2">
                            <strong>PREDAVANJE JE OTKAZANO</strong>
                            {profile.cancellationReason && (
                              <span className="block mt-1">Razlog: {profile.cancellationReason}</span>
                            )}
                            {profile.cancelledAt && (
                              <span className="block text-sm opacity-80 mt-1">
                                Otkazano: {formatDate(profile.cancelledAt)}
                              </span>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Information Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* Date & Time Card */}
                        {type === 'lecture' && (profile.date || profile.time) && (
                          <Card className="bg-white/10 backdrop-blur-md border-white/20">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-white text-sm font-medium flex items-center gap-2">
                                <CalendarDays className="h-4 w-4" />
                                Termin
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="text-white space-y-2">
                              {profile.isSeminar && profile.endDate ? (
                                <>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 opacity-70" />
                                    <span className="text-lg font-medium">
                                      {formatDateWithDay(profile.date)} - {formatDateWithDay(profile.endDate)}
                                    </span>
                                  </div>
                                  {profile.seminarSessions && profile.seminarSessions.length > 0 && (
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 opacity-70" />
                                      <span className="text-lg font-medium">{profile.seminarSessions.length} sesija</span>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <>
                                  {profile.date && (
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 opacity-70" />
                                      <span className="text-lg font-medium">{formatDateWithDay(profile.date)}</span>
                                    </div>
                                  )}
                                  {profile.time && (
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 opacity-70" />
                                      <span className="text-lg font-medium">{profile.time}</span>
                                    </div>
                                  )}
                                </>
                              )}
                            </CardContent>
                          </Card>
                        )}

                        {/* Location Card */}
                        {(profile.address || profile.city) && (
                          <Card className="bg-white/10 backdrop-blur-md border-white/20">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-white text-sm font-medium flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Lokacija
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="text-white">
                              <div className="text-lg font-medium">
                                {profile.address && <div>{profile.address}</div>}
                                {profile.city && <div className="text-base opacity-90">{profile.city}</div>}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Speaker Card */}
                        {type === 'lecture' && (profile.speaker || profile.daijaName || profile.daija || profile.daijaIds) && (
                          <Card className="bg-white/10 backdrop-blur-md border-white/20">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-white text-sm font-medium flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {profile.daijaIds && profile.daijaIds.length > 1 ? 'Predavači' : 'Predavač'}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="text-white">
                              {/* Multiple daijas */}
                              {profile.daijaIds && profile.daijaIds.length > 0 && typeof profile.daijaIds[0] === 'object' ? (
                                <div className="space-y-2">
                                  {profile.daijaIds.map((daija, index) => (
                                    <div key={daija._id || index}>
                                      {daija._id ? (
                                        <Link href={`/profile/daija/${daija._id}`}>
                                          <div className="text-lg font-medium hover:underline cursor-pointer transition-all hover:text-blue-200">
                                            {formatDaijaTitle(daija.name, daija.title)}
                                          </div>
                                        </Link>
                                      ) : (
                                        <div className="text-lg font-medium">
                                          {formatDaijaTitle(daija.name, daija.title)}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : profile.daija && typeof profile.daija === 'object' && profile.daija._id ? (
                                <Link href={`/profile/daija/${profile.daija._id}`}>
                                  <div className="text-lg font-medium hover:underline cursor-pointer transition-all hover:text-blue-200">
                                    {formatDaijaTitle(profile.daija.name, profile.daija.title)}
                                  </div>
                                </Link>
                              ) : (
                                <div className="text-lg font-medium">
                                  {profile.daijaTitle && profile.daijaName 
                                    ? `${profile.daijaTitle} ${profile.daijaName}`
                                    : profile.daijaName || profile.speaker || ''}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}

                        {/* Organization Card */}
                        {type === 'lecture' && (profile.organization || profile.organizationName || profile.organizationId) && (
                          <Card className="bg-white/10 backdrop-blur-md border-white/20">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-white text-sm font-medium flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                Organizator
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="text-white">
                              {((profile.organizationId && typeof profile.organizationId === 'object' && profile.organizationId._id) ||
                                (profile.organization && typeof profile.organization === 'object' && profile.organization._id)) ? (
                                <Link href={`/profile/organization/${
                                  profile.organizationId?._id || profile.organization?._id
                                }`}>
                                  <div className="text-lg font-medium hover:underline cursor-pointer transition-all hover:text-blue-200">
                                    {profile.organizationId?.name || profile.organization?.name}
                                  </div>
                                </Link>
                              ) : (
                                <div className="text-lg font-medium">
                                  {profile.organizationName || profile.organization || ''}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}

                        {/* Contact Card for Organizations */}
                        {type === 'organization' && (profile.phone || profile.email || profile.website) && (
                          <Card className="bg-white/10 backdrop-blur-md border-white/20">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-white text-sm font-medium flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                Kontakt
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="text-white space-y-2">
                              {profile.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 opacity-70" />
                                  <span>{profile.phone}</span>
                                </div>
                              )}
                              {profile.email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 opacity-70" />
                                  <span>{profile.email}</span>
                                </div>
                              )}
                              {profile.website && (
                                <div className="flex items-center gap-2">
                                  <Globe className="h-4 w-4 opacity-70" />
                                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    {profile.website.replace(/^https?:\/\//, '')}
                                  </a>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </div>

                      {/* Description */}
                      {(profile.description || profile.biography) && (
                        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
                          <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                              <FileText className="h-5 w-5" />
                              {type === 'organization' ? 'O udruženju' : type === 'daija' ? 'Biografija' : 'Opis predavanja'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                              {profile.description || profile.biography}
                            </p>
                          </CardContent>
                        </Card>
                      )}

                      {/* Share Section */}
                      <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-white text-sm font-medium flex items-center gap-2">
                            <Share2 className="h-4 w-4" />
                            Podijeli da se i drugi okoriste
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ShareButton profileData={profile} type={type} />
                        </CardContent>
                      </Card>

                      {/* Social Media Links */}
                      {type === 'organization' && (profile.facebook || profile.instagram || profile.telegram || profile.viber) && (
                        <div className="mb-6">
                          <h3 className="text-white/80 text-sm font-medium mb-3">Društvene mreže</h3>
                          <div className="flex flex-wrap gap-2">
                            {profile.facebook && (
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="border-white/30 text-white bg-white/10 backdrop-blur-md hover:bg-white/20 hover:border-white/50"
                              >
                                <a href={profile.facebook} target="_blank" rel="noopener noreferrer">
                                  <Facebook className="mr-2 h-4 w-4" />
                                  Facebook
                                </a>
                              </Button>
                            )}
                            {profile.instagram && (
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="border-white/30 text-white bg-white/10 backdrop-blur-md hover:bg-white/20 hover:border-white/50"
                              >
                                <a href={profile.instagram} target="_blank" rel="noopener noreferrer">
                                  <Instagram className="mr-2 h-4 w-4" />
                                  Instagram
                                </a>
                              </Button>
                            )}
                            {profile.telegram && (
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="border-white/30 text-white bg-white/10 backdrop-blur-md hover:bg-white/20 hover:border-white/50"
                              >
                                <a href={profile.telegram} target="_blank" rel="noopener noreferrer">
                                  <Send className="mr-2 h-4 w-4" />
                                  Telegram
                                </a>
                              </Button>
                            )}
                            {profile.viber && (
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="border-white/30 text-white bg-white/10 backdrop-blur-md hover:bg-white/20 hover:border-white/50"
                              >
                                <a href={profile.viber} target="_blank" rel="noopener noreferrer">
                                  <MessageCircle className="mr-2 h-4 w-4" />
                                  Viber
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 items-stretch">
                        {/* Navigation Button */}
                        {(profile.address || profile.city) && (
                          <Button
                            onClick={openDirections}
                            className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border-white/30 h-10"
                          >
                            <Navigation className="mr-2 h-4 w-4" />
                            Navigacija
                          </Button>
                        )}
                        
                        {/* Add to Calendar Button */}
                        {type === 'lecture' && profile.date && !(profile.isCancelled || profile.status === 'cancelled') && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border-white/30 h-10"
                              >
                                <CalendarDays className="mr-2 h-4 w-4" />
                                Dodaj u kalendar
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleAddToCalendar('google')}>
                                Google Calendar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAddToCalendar('ics')}>
                                Preuzmi ICS fajl
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        
                        {/* Report Cancellation Button - wrapped for consistent height */}
                        {type === 'lecture' && (
                          <div className="flex items-center">
                            <CancellationReportButton lecture={profile} />
                          </div>
                        )}
                        
                        {/* Vertical Divider */}
                        {isAdmin && (
                          <div className="flex items-center">
                            <div className="h-8 w-px bg-white/30 mx-2"></div>
                          </div>
                        )}
                        
                        {/* Admin Actions - same row, no wrapper */}
                        {isAdmin && (
                          <>
                            <Button
                              onClick={() => {
                                setEditForm(profile);
                                setShowEditModal(true);
                              }}
                              className="bg-blue-500/30 backdrop-blur-md hover:bg-blue-500/40 text-white border border-blue-400/60 h-10 transition-all hover:scale-105 shadow-lg shadow-blue-500/20"
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Izmijeni
                            </Button>
                            
                            <Button
                              onClick={() => setShowDeleteDialog(true)}
                              className="bg-red-500/30 backdrop-blur-md hover:bg-red-500/40 text-white border border-red-400/60 h-10 transition-all hover:scale-105 shadow-lg shadow-red-500/20"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Obriši
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </ContentContainer>
            </div>

            {/* Seminar Sessions Section */}
            {type === 'lecture' && profile.isSeminar && profile.seminarSessions && profile.seminarSessions.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <CalendarDays className="h-6 w-6 text-amber-500" />
                  Raspored sesija seminara
                  {profile.seminarTheme && (
                    <span className="text-lg font-normal text-gray-600 ml-2">- {profile.seminarTheme}</span>
                  )}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.seminarSessions
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map((session, index) => (
                      <Card key={index} className="border-l-4 border-amber-400 hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg font-bold">
                              Sesija {index + 1}
                            </CardTitle>
                            <Badge className="bg-amber-100 text-amber-800">
                              {formatDateWithDay(session.date)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {session.title && (
                            <h4 className="font-semibold text-gray-800">{session.title}</h4>
                          )}
                          
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{session.time}</span>
                            {session.duration && session.duration !== 60 && (
                              <span className="text-sm">({session.duration} min)</span>
                            )}
                          </div>
                          
                          {session.speakerIds && session.speakerIds.length > 0 && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <User className="h-4 w-4" />
                              <span>{session.speakerIds.length} predavač(a)</span>
                            </div>
                          )}
                          
                          {session.customSpeakers && session.customSpeakers.length > 0 && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <User className="h-4 w-4" />
                              <span>{session.customSpeakers.join(', ')}</span>
                            </div>
                          )}
                          
                          {session.description && (
                            <p className="text-sm text-gray-600 pt-2 border-t">
                              {session.description}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}

            {/* Daija's Upcoming Lectures Section */}
            {type === 'daija' && (
              <div id="daija-lectures" className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Najavljeni dersovi ovog daije</h2>
                
                {relatedLoading ? (
                  <SkeletonGrid />
                ) : relatedLectures.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {/* Show upcoming lectures for this daija */}
                      {relatedLectures
                        .slice(0, 10)
                        .map((lecture) => (
                          <UniversalCard
                            key={lecture._id}
                            data={{
                              ...lecture,
                              type: 'Predavanje'
                            }}
                          />
                        ))}
                    </div>
                    
                    {/* Show more button if there are more than 10 lectures */}
                    {relatedLectures.length > 10 && (
                      <div className="mt-6 text-center">
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/daija/${generateSlug(profile.name)}`)}
                          className="hover:scale-105 transition-transform"
                        >
                          Prikaži sve dersove ovog daije
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <Card className="p-8 text-center border-dashed">
                    <CardContent>
                      <CalendarDays className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500">Trenutno nema najavljenih dersova ovog daije</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Organization's Upcoming Lectures Section */}
            {type === 'organization' && (
              <div id="organization-lectures" className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Najavljeni dersovi ovog udruženja</h2>
                
                {relatedLoading ? (
                  <SkeletonGrid />
                ) : relatedLectures.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {/* Show upcoming lectures for this organization */}
                      {relatedLectures
                        .slice(0, 10)
                        .map((lecture) => (
                          <UniversalCard
                            key={lecture._id}
                            data={{
                              ...lecture,
                              type: 'Predavanje'
                            }}
                          />
                        ))}
                    </div>
                    
                    {/* Show more button if there are more than 10 lectures */}
                    {relatedLectures.length > 10 && (
                      <div className="mt-6 text-center">
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/udruzenje/${generateSlug(profile.name)}`)}
                          className="hover:scale-105 transition-transform"
                        >
                          Prikaži sve dersove ovog udruženja
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <Card className="p-8 text-center border-dashed">
                    <CardContent>
                      <CalendarDays className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500">Trenutno nema najavljenih dersova ovog udruženja</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Other Upcoming Lectures Section - Always show */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Ostali najavljeni dersovi</h2>
              
              {upcomingLoading ? (
                // Show skeleton loaders while loading
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <Skeleton key={index} className="h-64 rounded-lg" />
                  ))}
                </div>
              ) : upcomingLectures.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {upcomingLectures.map((lecture) => (
                      <UniversalCard
                        key={lecture._id}
                        data={{
                          ...lecture,
                          type: 'Predavanje'
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Show More Button if there are 10 lectures */}
                  {upcomingLectures.length >= 10 && (
                    <div className="mt-6 text-center">
                      <Button
                        variant="outline"
                        onClick={() => router.push('/')}
                        className="hover:scale-105 transition-transform"
                      >
                        Prikaži sve dersove
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                // Show message when no lectures available
                <Card className="p-8 text-center border-dashed">
                  <CardContent>
                    <CalendarDays className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">Trenutno nema najavljenih dersova</p>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/')}
                      className="mt-4"
                    >
                      Vrati se na početnu
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Additional Information Section */}
            {type === 'lecture' && (profile.topics || profile.requirements || profile.targetAudience) && (
              <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {profile.topics && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Hash className="h-5 w-5 text-blue-500" />
                        Teme
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profile.topics.split(',').map((topic, index) => (
                          <Badge key={index} variant="secondary">
                            {topic.trim()}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {profile.requirements && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Info className="h-5 w-5 text-green-500" />
                        Zahtjevi
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{profile.requirements}</p>
                    </CardContent>
                  </Card>
                )}

                {profile.targetAudience && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Users className="h-5 w-5 text-purple-500" />
                        Ciljna grupa
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{profile.targetAudience}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

          </div>
        </ContentContainer>

        {/* Image Modal */}
        <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{getTitle()}</DialogTitle>
            </DialogHeader>
            <div className="relative">
              <img
                src={getImageUrl(profile.image) || getDefaultImage()}
                alt={profile.title || profile.name}
                className="w-full h-auto rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getDefaultImage();
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Edit Modal with unified forms */}
        {type === 'lecture' && (
          <LectureFormNew 
            open={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSuccess={async (updatedLecture) => {
              console.log('Lecture updated successfully:', updatedLecture);
              setShowEditModal(false);
              
              // Update the profile with the new data
              if (updatedLecture) {
                setProfile(updatedLecture);
                
                // If title changed, redirect to new URL
                if (updatedLecture.title !== profile.title) {
                  const newSlug = generateSlug(updatedLecture.title);
                  router.push(`/predavanje/${newSlug}`);
                } else {
                  // Otherwise just refresh
                  setTimeout(() => {
                    window.location.reload();
                  }, 500);
                }
              }
            }}
            lecture={profile}
          />
        )}
        
        {(type === 'daija' || type === 'organization') && showEditModal && (
          <UnifiedFormNew
            open={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSuccess={async () => {
              setShowEditModal(false);
              window.location.reload();
            }}
            type={type}
            initialData={profile}
          />
        )}
        
        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && (
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Potvrda brisanja</DialogTitle>
              </DialogHeader>
              
              <div className="py-4">
                <p className="text-sm text-gray-600">
                  Da li ste sigurni da želite obrisati {type === 'lecture' ? 'predavanje' : type === 'daija' ? 'daiju' : 'organizaciju'} 
                  &quot;{type === 'daija' || type === 'organization' ? profile?.name : profile?.title}&quot;?
                </p>
                <p className="text-sm text-red-600 mt-2">
                  Ova akcija ne može biti poništena!
                </p>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
                  Otkaži
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Brisanje...
                    </>
                  ) : (
                    'Obriši'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </PageLayout>
    </>
  );
};

export default ProfilePage;

// Force server-side rendering to avoid static generation
export async function getServerSideProps() {
  return {
    props: {
      // This ensures the page is rendered on each request
      timestamp: new Date().toISOString()
    }
  };
}