import ContentContainer from './ContentContainer';
import {
  Home,
  Calendar,
  User,
  Building2,
  Mail,
  Phone,
  Facebook,
  Instagram
} from 'lucide-react';
import { useRouter } from 'next/router';
import LogoCircle from './LogoCircle';

const Footer = () => {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const navigationLinks = [
    { name: 'Početna', path: '/', icon: <Home className="w-4 h-4" /> },
    { name: 'Dersovi', path: '/lectures', icon: <Calendar className="w-4 h-4" /> },
    { name: 'Daije', path: '/daije', icon: <User className="w-4 h-4" /> },
    { name: 'Udruženja', path: '/organizations', icon: <Building2 className="w-4 h-4" /> }
  ];

  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <footer className="bg-[#022C43] text-white py-12 mt-12">
      <ContentContainer>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Logo i opis */}
          <div className="md:col-span-4">
            <div className="flex items-center mb-4">
              <LogoCircle />
            </div>
            <h4 className="text-3xl font-bold mb-4">DERS</h4>
            <p className="text-xl mb-4 opacity-80">
              Digitalna platforma za promociju islamskih predavanja
            </p>
            <p className="text-lg opacity-70">
              Ova platforma promoviše isključivo stvari koje su u skladu sa razumjevanjem islama poput prvih generacija u islamu.
            </p>
          </div>

          {/* Navigacija */}
          <div className="md:col-span-3">
            <h6 className="text-lg font-semibold mb-4">Navigacija</h6>
            <div className="flex flex-col gap-2">
              {navigationLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavigation(link.path)}
                  className="flex items-center gap-2 text-base text-white opacity-80 hover:opacity-100 hover:underline transition-opacity text-left"
                >
                  {link.icon}
                  {link.name}
                </button>
              ))}
            </div>
          </div>

          {/* Informacije */}
          <div className="md:col-span-3">
            <h6 className="text-xl font-semibold mb-4">Kontakt</h6>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="text-lg opacity-80">info@ders.ba</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span className="text-lg opacity-80">062 092 827</span>
              </div>
            </div>
          </div>

          {/* Linkovi */}
          <div className="md:col-span-2">
            <h6 className="text-lg font-semibold mb-4">Pratite nas</h6>
            <div className="flex gap-2">
              <a
                href="https://www.facebook.com/profile.php?id=61561889404089"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="https://www.instagram.com/ders_ba/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Divider i Copyright */}
        <div className="border-t border-white/20 my-8"></div>
        
        <div className="flex flex-wrap justify-between items-center gap-4">
          <p className="text-sm opacity-70">
            © {currentYear} DERS. Sva prava zadržana.
          </p>
          <div className="flex gap-6 items-center">
            <button
              onClick={() => handleNavigation('/privacy-policy')}
              className="text-sm text-white opacity-70 hover:opacity-100 hover:underline transition-opacity"
            >
              Politika privatnosti
            </button>
            <p className="text-sm opacity-70">
              Napravljeno da koristi muslimanima.
            </p>
            <p className="text-sm opacity-50">
              v1.2.0
            </p>
          </div>
        </div>
      </ContentContainer>
    </footer>
  );
};

export default Footer;