import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { daijeService } from '@/services';
import { generateSlug } from '@/utils';

// Dynamically import ProfilePage to avoid SSR issues
const ProfilePage = dynamic(() => import('../profile/[type]/[[...params]]'), {
  ssr: false
});

const DaijaProfilePage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [daija, setDaija] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const findDaijaBySlug = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        // Get all daije and find by slug
        const allDaije = await daijeService.getAllDaije();
        const foundDaija = allDaije.find(d => generateSlug(d.name) === slug);
        
        if (foundDaija) {
          // Mock the router query for ProfilePage
          router.query.type = 'daija';
          router.query.params = [foundDaija._id];
          setDaija(foundDaija);
          setLoading(false);
        } else {
          router.push('/404');
        }
      } catch (error) {
        console.error('Error finding daija:', error);
        router.push('/404');
      }
    };

    findDaijaBySlug();
  }, [slug, router]);

  if (loading || !daija) {
    return <div>Loading...</div>;
  }

  // ProfilePage will use the modified router.query
  return <ProfilePage />;
};

export default DaijaProfilePage;

// Force server-side rendering to avoid static generation
export async function getServerSideProps() {
  return {
    props: {
      // This ensures the page is rendered on each request
      timestamp: new Date().toISOString()
    }
  };
}