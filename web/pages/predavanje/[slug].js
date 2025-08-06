import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { predavanjaService } from '@/services';
import { generateSlug } from '@/utils';

// Dynamically import ProfilePage to avoid SSR issues
const ProfilePage = dynamic(() => import('../profile/[type]/[[...params]]'), {
  ssr: false
});

const PredavanjeProfilePage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const findLectureBySlug = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        // Get all lectures and find by slug
        const allLectures = await predavanjaService.getAllPredavanja(1, 100, 'all');
        const foundLecture = allLectures.find(l => generateSlug(l.title) === slug);
        
        if (foundLecture) {
          // Mock the router query for ProfilePage
          router.query.type = 'lecture';
          router.query.params = [foundLecture._id];
          setLecture(foundLecture);
          setLoading(false);
        } else {
          router.push('/404');
        }
      } catch (error) {
        console.error('Error finding lecture:', error);
        router.push('/404');
      }
    };

    findLectureBySlug();
  }, [slug]);

  if (loading || !lecture) {
    return <div>Loading...</div>;
  }

  // ProfilePage will use the modified router.query
  return <ProfilePage />;
};

export default PredavanjeProfilePage;