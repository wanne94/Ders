import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import {
  School,
  Building2,
  User,
  CheckCircle,
  Bell,
  Bookmark,
  Calendar,
  UserPlus,
  Star,
  Facebook,
  Instagram
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PageLayout from '@/components/PageLayout';
import ContentContainer from '@/components/ContentContainer';
import { OrganizationsGrid, DaijeGrid, LecturesGrid } from '@/components/GridLayout';
import UniversalCard from '@/components/UniversalCard';
import SkeletonGrid from '@/components/SkeletonGrid';
import LecturesSection from '@/components/LecturesSection';
import SimplifiedStatistics from '@/components/SimplifiedStatistics';
import { predavanjaService, daijeService, udruzenjaService } from '@/services';
import { deviceUtils, storage } from '@/utils';
import { sortLecturesByStatus } from '@/helpers/sortingHelpers';
import { logNavigation, logSocialShare } from '@/services/analytics';
import { usePerformanceTracking, measureAsyncOperation } from '@/hooks/usePerformanceTracking';

// HeroSection Component
const HeroSection = () => {
  return (
    <div className="w-screen relative left-[50%] -ml-[50vw] -mt-16 pt-24 pb-20 bg-gradient-to-br from-[#022C43] to-[#055A87] text-white text-center">
      <ContentContainer>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Islamska predavanja - Ders.ba
        </h1>
        <div className="w-1/5 h-px bg-white/50 mx-auto my-4" />
        <h2 className="text-xl md:text-2xl mb-8 opacity-90">
          Digitalna platforma za promociju islamskih predavanja
        </h2>

        {/* Download App Section */}
        <div className="mt-12">
          <h3 className="text-lg opacity-90 mb-6 font-normal">
            Preuzmi DERS mobilnu aplikaciju
          </h3>

          <div className="flex gap-2 justify-center flex-wrap items-start">
            {/* Google Play Button */}
            <a
              href="https://play.google.com/store/apps/details?id=com.daije.mobile"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="relative w-40 md:w-44 h-12 md:h-14 rounded-lg overflow-hidden shadow-lg cursor-pointer flex items-center justify-center">
                <Image
                  src="/google-play-badge.png"
                  alt="Download on Google Play"
                  width={180}
                  height={54}
                  className="w-full h-full object-cover"
                />
              </div>
            </a>

            {/* App Store Button */}
            <a
              href="https://apps.apple.com/id/app/ders-ba/id6748257017"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="relative w-40 md:w-44 h-12 md:h-14 rounded-lg overflow-hidden shadow-lg cursor-pointer flex items-center justify-center">
                <Image
                  src="/app shore download.png"
                  alt="Download on App Store"
                  width={180}
                  height={54}
                  className="w-full h-full object-cover"
                />
              </div>
            </a>
          </div>
        </div>
      </ContentContainer>
    </div>
  );
};

// QuickActions Component
const QuickActions = () => {
  const router = useRouter();

  const quickActions = [
    {
      title: 'Dersovi',
      description: 'Pregledajte sva dostupna predavanja',
      icon: School,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-600',
      hoverBg: 'hover:bg-green-100',
      path: '/lectures'
    },
    {
      title: 'Udruženja',
      description: 'Istražite udruženja i njihove aktivnosti',
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-600',
      hoverBg: 'hover:bg-blue-100',
      path: '/organizations'
    },
    {
      title: 'Daije',
      description: 'Upoznajte naše daije',
      icon: User,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-600',
      hoverBg: 'hover:bg-amber-100',
      path: '/daije'
    }
  ];

  return (
    <ContentContainer>
      <div className="text-center mt-8 mb-8">
        <h2 className="text-3xl font-semibold mb-4">Navigacija</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 justify-center mb-4 max-w-5xl mx-auto">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card
                key={index}
                className="h-full flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                onClick={() => router.push(action.path)}
              >
                <CardContent className="flex-grow text-center p-6">
                  <div className={`${action.color} mb-4 flex justify-center`}>
                    <Icon size={40} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{action.title}</h3>
                  <p className="text-gray-600">{action.description}</p>
                </CardContent>
                <CardFooter className="justify-center pb-4">
                  <Button
                    variant="outline"
                    className={`${action.borderColor} ${action.color} ${action.hoverBg}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(action.path);
                    }}
                  >
                    Otvori
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </ContentContainer>
  );
};

// Benefits Section Component
const BenefitsSection = () => {
  const router = useRouter();

  const benefits = [
    {
      icon: CheckCircle,
      title: 'Dodavanje sadržaja',
      description: 'Registrirani korisnici mogu objavljivati nova predavanja, kao i predlagati daije i udruženja za dodavanje na platformu.'
    },
    {
      icon: Star,
      title: 'Doprinos znanju i sticanje sevapa',
      description: 'Svako korisno predavanje koje podijeliš može nekome koristiti – a za to ti se piše nagrada kod Allaha. "Ko uputi na dobro, ima nagradu kao i onaj koji to dobro čini." (Muslim)'
    },
    {
      icon: Bookmark,
      title: 'Predlaganje izmjena postojećih informacija',
      description: 'Ako primijetiš netačne ili zastarjele podatke, možeš predložiti izmjene koje će biti pregledane od strane admin tima.'
    },
    {
      icon: Calendar,
      title: 'Mogućnost da postaneš dio admin tima',
      description: 'Registracijom imaš priliku da, kada se ukaže potreba, postaneš dio tima koji aktivno uređuje i razvija platformu.'
    }
  ];

  return (
    <div className="w-[calc(100vw)] py-16 bg-gradient-to-br from-[#022C43] to-[#055A87] text-white mt-12 mb-2 mx-[calc(-50vw+50%)] relative">
      <ContentContainer className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Zašto se registrovati?
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto leading-relaxed">
            Registracija vam omogućava pristup ekskluzivnim funkcijama koje će poboljšati vaše iskustvo na našoj platformi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-12 max-w-full overflow-hidden">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="flex items-start p-6 bg-white/10 rounded-2xl backdrop-blur-lg border border-white/20 transition-all duration-300 hover:bg-white/15 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="bg-white/20 rounded-full p-4 mr-6 flex items-center justify-center min-w-[60px] h-[60px]">
                  <Icon size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {benefit.title}
                  </h3>
                  <p className="opacity-90 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <h3 className="text-2xl mb-8 font-medium">
            Pridružite se našoj zajednici danas!
          </h3>
          <div className="flex gap-2 justify-center flex-wrap">
            <Button
              size="lg"
              className="bg-[#dc004e] hover:bg-[#b8003d] text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
              onClick={() => router.push('/auth')}
            >
              Registrujte se
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white text-white bg-transparent hover:bg-white/10 px-8 py-6 text-lg font-semibold rounded-xl"
              onClick={() => router.push('/auth')}
            >
              Prijavite se
            </Button>
          </div>
        </div>
      </ContentContainer>
    </div>
  );
};

// ActiveOrganizations Component
const ActiveOrganizations = ({ organizations, lectures, isLoading }) => {
  const router = useRouter();
  const [displayOrganizations, setDisplayOrganizations] = useState([]);

  useEffect(() => {
    if (organizations && lectures) {
      const approvedOrgs = (organizations || []).filter(org => {
        if (org.status !== 'approved') return false;

        if (typeof org.lectureCount === 'number') {
          return org.lectureCount > 0;
        }

        const hasPredavanje = lectures.some(lecture => {
          if (lecture.status !== 'approved') return false;
          if (!lecture.organization) return false;

          if (typeof lecture.organization === 'string') {
            return lecture.organization === org.name;
          }

          if (typeof lecture.organization === 'object') {
            return lecture.organization._id === org._id ||
                   lecture.organization.name === org.name;
          }

          return false;
        });

        return hasPredavanje;
      });

      const shuffled = [...approvedOrgs].sort(() => Math.random() - 0.5);
      const sortedOrganizations = shuffled.slice(0, 10);
      setDisplayOrganizations(sortedOrganizations || []);
    }
  }, [organizations, lectures]);

  const handleViewAllOrganizations = () => {
    router.push('/organizations');
  };

  const approvedOrganizations = (displayOrganizations || []).filter(item => item.status === 'approved');

  return (
    <ContentContainer>
      <div className="mt-0 text-center">
        <h2 className="text-3xl font-semibold mb-2">Udruženja</h2>
        <p className="mb-4">
          Upoznaj 10 nasumično odabranih udruženja koja su imala najavljeno predavanje.
        </p>

        {isLoading ? (
          <SkeletonGrid count={6} type="organization" />
        ) : approvedOrganizations.length === 0 ? (
          <p className="text-gray-600">
            Trenutno nema dostupnih udruženja.
          </p>
        ) : (
          <>
            <OrganizationsGrid
              gap={3}
              className="w-full max-w-full overflow-hidden"
            >
              {approvedOrganizations.map((organization) => (
                <UniversalCard
                  key={organization._id}
                  data={{ ...organization, type: 'Udruženje' }}
                />
              ))}
            </OrganizationsGrid>

            <div className="mt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={handleViewAllOrganizations}
                className="px-8 py-6 rounded-lg text-base"
              >
                Prikaži sva udruženja
              </Button>
            </div>
          </>
        )}
      </div>
    </ContentContainer>
  );
};

// Social Media Section Component
const SocialMediaSection = () => {
  return (
    <ContentContainer>
      <div className="mt-4 mb-4 text-center">
        <h2 className="text-3xl font-semibold mb-4">
          Pratite nas na društvenim mrežama
        </h2>
        <p className="text-lg mb-8 opacity-80 max-w-xs mx-auto leading-relaxed font-light">
          Budi u toku s najnovijim predavanjima, događajima i korisnim sadržajem.
        </p>

        <div className="flex justify-center gap-3 flex-wrap">
          {/* Facebook */}
          <div className="text-center">
            <a
              href="https://www.facebook.com/profile.php?id=61561889404089"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => logSocialShare('social_media', 'ders_page', 'facebook')}
              className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-[#1877F2] text-white rounded-full transition-all duration-300 hover:bg-[#166FE5] hover:-translate-y-1 hover:shadow-xl"
            >
              <Facebook size={40} />
            </a>
            <h3 className="text-lg font-semibold mb-1">Facebook</h3>
            <p className="text-gray-600 text-sm">Zaprati nas na Facebooku</p>
          </div>

          {/* Instagram */}
          <div className="text-center">
            <a
              href="https://www.instagram.com/ders_ba/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => logSocialShare('social_media', 'ders_page', 'instagram')}
              className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-gradient-to-br from-[#F56040] via-[#E1306C] via-[#C13584] via-[#833AB4] to-[#5851DB] text-white rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <Instagram size={40} />
            </a>
            <h3 className="text-lg font-semibold mb-1">Instagram</h3>
            <p className="text-gray-600 text-sm">Zaprati nas na Instagramu</p>
          </div>
        </div>
      </div>
    </ContentContainer>
  );
};

// ActiveDaije Component
const ActiveDaije = ({ daije, lectures, isLoading }) => {
  const router = useRouter();
  const [displayDaije, setDisplayDaije] = useState([]);

  useEffect(() => {
    if (daije && lectures) {
      const approvedDaije = (daije || []).filter(daija => {
        if (daija.status !== 'approved') return false;

        if (typeof daija.lectureCount === 'number') {
          return daija.lectureCount > 0;
        }

        const hasPredavanje = lectures.some(lecture =>
          lecture.status === 'approved' &&
          lecture.daija &&
          (lecture.daija._id === daija._id || lecture.daija === daija._id)
        );

        return hasPredavanje;
      });

      const shuffled = [...approvedDaije].sort(() => Math.random() - 0.5);
      const randomDaije = shuffled.slice(0, 10);
      setDisplayDaije(randomDaije || []);
    }
  }, [daije, lectures]);

  const handleViewAllDaije = () => {
    router.push('/daije');
  };

  const approvedDaije = displayDaije;

  return (
    <ContentContainer>
      <div className="mt-2 text-center">
        <h2 className="text-3xl font-semibold mb-2">Daije</h2>
        <p className="mb-4">
          Upoznaj 10 nasumično odabranih daija koji su imali najavljeno predavanje.
        </p>

        {isLoading ? (
          <SkeletonGrid count={6} type="daija" />
        ) : approvedDaije.length === 0 ? (
          <p className="text-gray-600">
            Trenutno nema dostupnih daija.
          </p>
        ) : (
          <>
            <DaijeGrid
              gap={3}
              className="w-full max-w-full overflow-hidden"
            >
              {approvedDaije.map((daija) => (
                <UniversalCard
                  key={daija._id}
                  data={{ ...daija, type: 'Daija' }}
                />
              ))}
            </DaijeGrid>
            <div className="mt-8 mb-0">
              <Button
                variant="outline"
                size="lg"
                onClick={handleViewAllDaije}
                className="px-8 py-6 rounded-lg text-base"
              >
                Prikaži sve daije
              </Button>
            </div>
          </>
        )}
      </div>
    </ContentContainer>
  );
};

// Filter function for approved items
const filterApproved = (items) => (items || []).filter(item =>
  item.status === 'approved'
);

// Main Home Component
export default function Home() {
  const [lectures, setLectures] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [daije, setDaije] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);
  const router = useRouter();

  usePerformanceTracking('home_page_render');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const allLectures = await measureAsyncOperation('fetch_lectures', async () => {
          return await predavanjaService.getAllPredavanja(1, 100, 'all');
        });

        console.log('🔍 Fetched lectures from API:', allLectures?.length || 0);
        console.log('🔍 First lecture:', allLectures?.[0]);

        const cancelledLectures = allLectures.filter(l => l.status === 'cancelled' || l.isCancelled);
        const diskriminacija = allLectures.find(l => l.title && l.title.includes('Diskriminacija žena'));
        const weeklyLectures = allLectures.filter(l => l.isWeeklyLecture);

        const lecturesData = (allLectures || []).map(lecture => ({
          ...lecture,
          type: 'Predavanje',
          daija: lecture.daija || null,
          organization: lecture.organization || null
        }));

        lecturesData.forEach(lecture => {
          // Structure validation without logging
        });

        console.log('🔍 Processed lectures:', lecturesData?.length || 0);
        setLectures(lecturesData);

        const organizationsData = await measureAsyncOperation('fetch_organizations', async () => {
          return await udruzenjaService.getAllUdruzenja();
        });
        setOrganizations(organizationsData || []);

        const daijeData = await measureAsyncOperation('fetch_daije', async () => {
          return await daijeService.getAllDaije();
        });
        setDaije(daijeData || []);

      } catch (err) {
        console.error('Greška pri dohvaćanju podataka:', err);
        setError('Greška pri učitavanju podataka');
        setLectures([]);
        setOrganizations([]);
        setDaije([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('registrationSuccess') === 'true') {
        setShowRegistrationSuccess(true);
        localStorage.removeItem('registrationSuccess');
      }
    }
  }, []);

  const approvedOrganizations = (organizations || []).filter(item => item.status === 'approved');
  const approvedDaije = (daije || []).filter(item => item.status === 'approved');
  const approvedLectures = (lectures || []).filter(item => item.status === 'approved');

  return (
    <PageLayout
      disableGutters
      containerSx={{
        px: 0,
        textAlign: 'center',
        alignItems: 'center'
      }}
    >
      <Head>
        <title>Islamska predavanja - Ders.ba</title>
        <meta name="description" content="Pronađite najnovija predavanja, pratite omiljene daije i organizacije na jednom mjestu." />
        <link rel="canonical" href="https://ders.ba" />
      </Head>

      {/* Poruka o uspješnoj registraciji/prijavi */}
      {showRegistrationSuccess && (
        <Alert className="mb-8 w-full max-w-2xl mx-auto">
          <AlertDescription>
            Uspješno ste registrovani i prijavljeni u sistem.
          </AlertDescription>
        </Alert>
      )}

      {/* Hero Section */}
      <div className="w-full">
        <HeroSection />
      </div>

      {error && (
        <Alert variant="destructive" className="mb-8 w-full max-w-2xl">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 10 Lectures */}
      <div className="w-full mb-8">
        <ContentContainer>
          <LecturesSection
            lectures={lectures}
            isLoading={isLoading}
            limit={10}
            subtitle="Posljednjih 10 najavljenih dersova"
            showViewAllButton={true}
          />
        </ContentContainer>
      </div>

      {/* Benefits Section */}
      <BenefitsSection />

      {/* Active Daije */}
      <div className="w-full mb-8">
        <ActiveDaije daije={daije} lectures={lectures} isLoading={isLoading} />
      </div>

      {/* Social Media Section */}
      <div className="w-full mb-8">
        <SocialMediaSection />
      </div>

      {/* Active Organizations */}
      <div className="w-full mb-8">
        <ActiveOrganizations organizations={organizations} lectures={lectures} isLoading={isLoading} />
      </div>

      {/* Lecture Statistics */}
      <div className="w-full mb-8">
        <SimplifiedStatistics />
      </div>
    </PageLayout>
  );
}

// Force server-side rendering to ensure fresh content on every request
export async function getServerSideProps() {
  return {
    props: {
      timestamp: new Date().toISOString()
    }
  };
}