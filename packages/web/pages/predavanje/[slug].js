import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { predavanjaService } from '@/services';
import { generateSlug } from '@/utils';
import LoadingState from '@/components/LoadingState';

const PredavanjeProfilePage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [lectureId, setLectureId] = useState(null);
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
          // Instead of modifying router.query, just redirect to the proper profile page
          setLectureId(foundLecture._id);
          // Redirect to the proper profile URL
          router.push(`/profile/lecture/${foundLecture._id}/${slug}`);
        } else {
          router.push('/404');
        }
      } catch (error) {
        console.error('Error finding lecture:', error);
        router.push('/404');
      }
    };

    findLectureBySlug();
  }, [slug, router]);

  if (loading) {
    return <LoadingState />;
  }

  // This will not be shown as we redirect
  return null;
};

export default PredavanjeProfilePage;

// Force server-side rendering to avoid static generation
export async function getServerSideProps() {
  return {
    props: {
      // This ensures the page is rendered on each request
      timestamp: new Date().toISOString()
    }
  };
}
