import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { USER_ROLES, hasPermission } from '@ders-ba/shared';
import { Button } from './ui/button';
import {
  Sheet,
  SheetContent, SheetHeader,
  SheetTitle,
  SheetTrigger
} from './ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  BookOpen,
  Plus,
  LogIn,
  LogOut,
  LayoutDashboard,
  Menu, Building2,
  User,
  Lightbulb,
  UserCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import LogoCircle from './LogoCircle.jsx';
import LectureFormNew from './LectureFormNew.jsx';
import UnifiedFormNew from './UnifiedFormNew.jsx';
import SuggestionForm from './SuggestionForm.jsx';
import { menuItems, adminMenuItems } from '@/config/menuItems';
import { clearAllData, getToken, getUserData } from '@/utils/authHelpers';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLectureModalOpen, setIsLectureModalOpen] = useState(false);
  const [isDaijaModalOpen, setIsDaijaModalOpen] = useState(false);
  const [isOrganizationModalOpen, setIsOrganizationModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [suggestionFormOpen, setSuggestionFormOpen] = useState(false);
  const [showNavigation, setShowNavigation] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [mobileAddExpanded, setMobileAddExpanded] = useState(false);

  // Scroll handler za skrivanje/prikazivanje navigacije
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        setShowNavigation(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowNavigation(false);
      } else if (currentScrollY < lastScrollY) {
        setShowNavigation(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  useEffect(() => {
    const token = getToken();
    const userData = getUserData();
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(userData);
    }
  }, []);

  const handleLogout = () => {
    clearAllData();
    setIsLoggedIn(false);
    setUser(null);
    router.push('/');
  };

  const handleAddLectureClick = () => {
    if (isLoggedIn) {
      setIsLectureModalOpen(true);
    } else {
      setAuthPromptOpen(true);
    }
  };

  const handleAddDaijaClick = () => {
    if (isLoggedIn) {
      setIsDaijaModalOpen(true);
    } else {
      setAuthPromptOpen(true);
    }
  };

  const handleAddOrganizationClick = () => {
    if (isLoggedIn) {
      setIsOrganizationModalOpen(true);
    } else {
      setAuthPromptOpen(true);
    }
  };

  const handleAuthPromptClose = () => {
    setAuthPromptOpen(false);
  };

  const handleGoToAuth = (mode = 'login') => {
    setAuthPromptOpen(false);
    router.push('/auth');
  };

  const handleSuggestionClick = () => {
    setSuggestionFormOpen(true);
  };

  const navigateToRoute = (path) => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    router.push(path);
    setDrawerOpen(false);
    
    // Reset navigation lock after a short delay
    setTimeout(() => {
      setIsNavigating(false);
    }, 500);
  };

  const isAdmin = hasPermission(user?.role, 'manage_content');

  const baseMenuItems = [
    ...menuItems,
    {
      label: 'Prijedlozi i ideje',
      path: '#',
      icon: <Lightbulb className="h-5 w-5" />,
      onClick: handleSuggestionClick
    }
  ];

  const mobileMenuItems = baseMenuItems;

  const mobileAddItems = [
    {
      label: 'Dodaj predavanje',
      icon: <BookOpen className="h-4 w-4" />,
      onClick: () => {
        handleAddLectureClick();
        setMobileAddExpanded(false);
      }
    },
    {
      label: 'Dodaj daiju',
      icon: <User className="h-4 w-4" />,
      onClick: () => {
        handleAddDaijaClick();
        setMobileAddExpanded(false);
      }
    },
    {
      label: 'Dodaj udruženje',
      icon: <Building2 className="h-4 w-4" />,
      onClick: () => {
        handleAddOrganizationClick();
        setMobileAddExpanded(false);
      }
    }
  ];

  return (
    <>
      {/* Navigation Bar */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-[#022C43] text-white shadow-lg transition-transform duration-300",
        !showNavigation && "-translate-y-full"
      )}>
        <div className="w-full mx-auto" style={{ maxWidth: '1900px' }}>
          <div className="flex items-center justify-between h-16 px-2 sm:px-3 md:px-4">
            {/* Logo */}
            <div 
              className="flex items-center cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigateToRoute('/');
              }}
            >
              <LogoCircle />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center flex-1 justify-between">
              {/* Main Menu Items - levo */}
              <div className="flex items-center space-x-2">
                {menuItems.map((item) => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigateToRoute(item.path);
                    }}
                    disabled={isNavigating}
                    className="flex items-center gap-2 text-white hover:bg-white/10 hover:text-white"
                  >
                    {item.icon}
                    {item.label}
                  </Button>
                ))}
              </div>

              {/* Right side items */}
              <div className="flex items-center space-x-4">
                {/* Admin Dashboard */}
                {isAdmin && (
                  <Button
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigateToRoute('/dashboard');
                    }}
                    disabled={isNavigating}
                    className="flex items-center gap-2 text-white hover:bg-white/10 hover:text-white"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                )}

                {/* Add Dropdown */}
                {isLoggedIn && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" className="flex items-center gap-2 bg-white text-[#022C43] hover:bg-gray-100">
                        <Plus className="h-4 w-4" />
                        Dodaj
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={handleAddLectureClick}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Dodaj predavanje
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleAddDaijaClick}>
                        <User className="mr-2 h-4 w-4" />
                        Dodaj daiju
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleAddOrganizationClick}>
                        <Building2 className="mr-2 h-4 w-4" />
                        Dodaj udruženje
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Suggestion Button */}
                <Button
                  onClick={handleSuggestionClick}
                  className="bg-white text-[#022C43] hover:bg-gray-100 font-medium"
                  size="icon"
                  title="Prijedlozi"
                >
                  <Lightbulb className="h-5 w-5" />
                </Button>

                {/* User Account */}
                {isLoggedIn ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex items-center gap-2 text-white hover:bg-white/10 hover:text-white">
                        <UserCircle className="h-5 w-5" />
                        {user?.username || user?.email}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push('/profile')}>
                        <UserCircle className="mr-2 h-4 w-4" />
                        Profil
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Odjavi se
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button 
                    onClick={() => router.push('/auth')}
                    className="flex items-center gap-2 bg-white text-[#022C43] hover:bg-gray-100"
                  >
                    <LogIn className="h-4 w-4" />
                    Prijavi se
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle>Meni</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col space-y-2">
                  {mobileMenuItems.map((item, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="justify-start"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (item.onClick) {
                          item.onClick();
                        } else {
                          navigateToRoute(item.path);
                        }
                      }}
                      disabled={isNavigating}
                    >
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                    </Button>
                  ))}
                  
                  {/* Add Dropdown for Mobile */}
                  {isLoggedIn && (
                    <div className="mt-2">
                      <Button
                        variant="ghost"
                        className="justify-start w-full hover:bg-gray-100 font-semibold"
                        onClick={() => setMobileAddExpanded(!mobileAddExpanded)}
                      >
                        <Plus className="h-5 w-5" />
                        <span className="ml-2 flex-1 text-left">Dodaj</span>
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-transform",
                          mobileAddExpanded && "rotate-180"
                        )} />
                      </Button>
                      
                      {mobileAddExpanded && (
                        <div className="ml-4 mt-1 space-y-1">
                          {mobileAddItems.map((addItem, idx) => (
                            <Button
                              key={idx}
                              variant="ghost"
                              size="sm"
                              className="justify-start w-full pl-4 text-gray-700 hover:bg-gray-100"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addItem.onClick();
                              }}
                            >
                              {addItem.icon}
                              <span className="ml-2">{addItem.label}</span>
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Admin Panel - with divider */}
                  {isAdmin && (
                    <>
                      <div className="border-t my-2" />
                      <Button
                        variant="ghost"
                        className="justify-start w-full"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigateToRoute('/dashboard');
                        }}
                        disabled={isNavigating}
                      >
                        <LayoutDashboard className="h-5 w-5" />
                        <span className="ml-2">Admin Panel</span>
                      </Button>
                    </>
                  )}
                  
                  <div className="border-t pt-4 mt-4">
                    {isLoggedIn ? (
                      <>
                        <div className="px-2 py-2 text-sm text-gray-600">
                          {user?.username || user?.email}
                        </div>
                        <Button
                          variant="ghost"
                          className="justify-start w-full"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-5 w-5" />
                          <span className="ml-2">Odjavi se</span>
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="default"
                        className="justify-start w-full"
                        onClick={() => {
                          setDrawerOpen(false);
                          router.push('/auth');
                        }}
                      >
                        <LogIn className="h-5 w-5" />
                        <span className="ml-2">Prijavi se</span>
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navigation */}
      <div className="h-4" />

      {/* Auth Prompt Dialog */}
      <Dialog open={authPromptOpen} onOpenChange={setAuthPromptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prijava potrebna</DialogTitle>
            <DialogDescription>
              Morate biti prijavljeni da biste dodali novi sadržaj. Želite li se prijaviti sada?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleAuthPromptClose}>
              Otkaži
            </Button>
            <Button onClick={() => handleGoToAuth()}>
              Prijavi se
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Forms */}
      {isLectureModalOpen && (
        <LectureFormNew
          open={isLectureModalOpen}
          onClose={() => setIsLectureModalOpen(false)}
          onSuccess={() => {
            setIsLectureModalOpen(false);
            router.push('/');
          }}
        />
      )}

      {isDaijaModalOpen && (
        <UnifiedFormNew
          type="daija"
          open={isDaijaModalOpen}
          onClose={() => setIsDaijaModalOpen(false)}
          onSuccess={() => {
            setIsDaijaModalOpen(false);
            router.push('/daije');
          }}
        />
      )}

      {isOrganizationModalOpen && (
        <UnifiedFormNew
          type="organization"
          open={isOrganizationModalOpen}
          onClose={() => setIsOrganizationModalOpen(false)}
          onSuccess={() => {
            setIsOrganizationModalOpen(false);
            router.push('/organizations');
          }}
        />
      )}

      {suggestionFormOpen && (
        <SuggestionForm
          open={suggestionFormOpen}
          onClose={() => setSuggestionFormOpen(false)}
        />
      )}
    </>
  );
};

export default Navigation;