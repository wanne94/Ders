import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { udruzenjaService } from '@/services';
import { generateSlug } from '@/utils';
import LoadingState from '@/components/LoadingState';

// Dynamically import ProfilePage to avoid SSR issues
const ProfilePage = dynamic(() => import('../profile/[type]/[[...params]]'), {
  ssr: false
});

const UdruzenjeProfilePage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const findOrganizationBySlug = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        // Get all organizations and find by slug
        const allOrganizations = await udruzenjaService.getAllUdruzenja();
        const foundOrg = allOrganizations.find(o => generateSlug(o.name) === slug);
        
        if (foundOrg) {
          // Mock the router query for ProfilePage
          router.query.type = 'organization';
          router.query.params = [foundOrg._id];
          setOrganization(foundOrg);
          setLoading(false);
        } else {
          router.push('/404');
        }
      } catch (error) {
        console.error('Error finding organization:', error);
        router.push('/404');
      }
    };

    findOrganizationBySlug();
  }, [slug, router]);

  if (loading || !organization) {
    return <LoadingState />;
  }

  // ProfilePage will use the modified router.query
  return <ProfilePage />;
};

export default UdruzenjeProfilePage;

// Force server-side rendering to avoid static generation
export async function getServerSideProps() {
  return {
    props: {
      // This ensures the page is rendered on each request
      timestamp: new Date().toISOString()
    }
  };
}
