import { useState } from 'react';
import LectureFormNew from '../src/components/LectureFormNew';
import UnifiedFormNew from '../src/components/UnifiedFormNew';
import { Button } from '../src/components/ui/button';

export default function TestFormPage() {
  const [openLecture, setOpenLecture] = useState(false);
  const [openDaija, setOpenDaija] = useState(false);
  const [openOrganization, setOpenOrganization] = useState(false);

  // Sample data for testing
  const sampleDaije = [
    { _id: '1', name: 'Dr. Ahmed', title: 'prof' },
    { _id: '2', name: 'Hafiz Mustafa', title: 'hafiz' }
  ];
  
  const sampleOrganizations = [
    { _id: '1', name: 'Islamska zajednica', address: 'Ulica 1', city: 'Sarajevo' },
    { _id: '2', name: 'Udruženje Merhamet', address: 'Ulica 2', city: 'Mostar' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Formi sa shadcn/ui</h1>
        
        <div className="grid gap-4">
          {/* Lecture Form */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Forma za predavanje</h2>
            <p className="text-gray-600 mb-4">
              Testiranje forme za dodavanje/uređivanje predavanja
            </p>
            <Button onClick={() => setOpenLecture(true)}>
              Otvori formu za predavanje
            </Button>
          </div>

          {/* Daija Form */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Forma za daiju</h2>
            <p className="text-gray-600 mb-4">
              Testiranje forme za dodavanje/uređivanje daije
            </p>
            <Button onClick={() => setOpenDaija(true)}>
              Otvori formu za daiju
            </Button>
          </div>

          {/* Organization Form */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Forma za udruženje</h2>
            <p className="text-gray-600 mb-4">
              Testiranje forme za dodavanje/uređivanje udruženja
            </p>
            <Button onClick={() => setOpenOrganization(true)}>
              Otvori formu za udruženje
            </Button>
          </div>
        </div>

        {/* Lecture Form Dialog */}
        <LectureFormNew
          open={openLecture}
          onClose={() => setOpenLecture(false)}
          onSuccess={(data) => {
            console.log('Lecture Success:', data);
            setOpenLecture(false);
          }}
        />

        {/* Daija Form Dialog */}
        <UnifiedFormNew
          open={openDaija}
          onClose={() => setOpenDaija(false)}
          onSuccess={(data) => {
            console.log('Daija Success:', data);
            setOpenDaija(false);
          }}
          type="daija"
          daije={sampleDaije}
          organizations={sampleOrganizations}
        />

        {/* Organization Form Dialog */}
        <UnifiedFormNew
          open={openOrganization}
          onClose={() => setOpenOrganization(false)}
          onSuccess={(data) => {
            console.log('Organization Success:', data);
            setOpenOrganization(false);
          }}
          type="organization"
          daije={sampleDaije}
          organizations={sampleOrganizations}
        />
      </div>
    </div>
  );
}