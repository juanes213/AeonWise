import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe, Trophy } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { cn } from '../../lib/utils';

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useUser();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/skill-swap', label: t('nav.skillSwap') },
    { to: '/mentorship', label: t('nav.mentorship') },
    { to: '/courses', label: t('nav.courses') },
    { to: '/ranking', label: 'Ranking', icon: Trophy },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav 
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled 
          ? 'bg-cosmic-black/80 backdrop-blur shadow-lg py-2' 
          : 'bg-transparent py-4'
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-display text-2xl tracking-wider bg-gradient-to-r from-cosmic-purple-400 to-cosmic-gold-400 bg-clip-text text-transparent">
              {t('common.appName')}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'font-display text-sm uppercase tracking-wider transition-colors flex items-center',
                  isActive(link.to) 
                    ? 'text-cosmic-gold-400' 
                    : 'text-white/80 hover:text-cosmic-gold-400'
                )}
              >
                {link.icon && <link.icon className="h-4 w-4 mr-1" />}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth and Language Controls */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="p-2 text-white/80 hover:text-cosmic-gold-400 transition-colors"
              aria-label="Toggle language"
            >
              <Globe className="h-5 w-5" />
            </button>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/profile" 
                  className={cn(
                    'font-display text-sm uppercase tracking-wider transition-colors',
                    isActive('/profile') 
                      ? 'text-cosmic-gold-400' 
                      : 'text-white/80 hover:text-cosmic-gold-400'
                  )}
                >
                  {t('nav.profile')}
                </Link>
                <button 
                  onClick={() => signOut()} 
                  className="btn-secondary"
                >
                  {t('nav.signOut')}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/auth/signin" className="btn-secondary">
                  {t('nav.signIn')}
                </Link>
                <Link to="/auth/signup" className="btn-primary">
                  {t('nav.signUp')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-cosmic-black/90 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'font-display text-sm uppercase tracking-wider py-2 flex items-center',
                  isActive(link.to) 
                    ? 'text-cosmic-gold-400' 
                    : 'text-white/80'
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.icon && <link.icon className="h-4 w-4 mr-2" />}
                {link.label}
              </Link>
            ))}
            
            <div className="pt-4 border-t border-white/10 flex flex-col space-y-4">
              <button
                onClick={() => {
                  toggleLanguage();
                  setIsMenuOpen(false);
                }}
                className="flex items-center space-x-2 text-white/80 py-2"
              >
                <Globe className="h-5 w-5" />
                <span className="font-display text-sm uppercase tracking-wider">
                  {i18n.language === 'en' ? 'Español' : 'English'}
                </span>
              </button>

              {user ? (
                <>
                  <Link 
                    to="/profile" 
                    className={cn(
                      'font-display text-sm uppercase tracking-wider py-2',
                      isActive('/profile') 
                        ? 'text-cosmic-gold-400' 
                        : 'text-white/80'
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.profile')}
                  </Link>
                  <button 
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }} 
                    className="btn-secondary w-full mt-2"
                  >
                    {t('nav.signOut')}
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/auth/signin" 
                    className="btn-secondary w-full text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.signIn')}
                  </Link>
                  <Link 
                    to="/auth/signup" 
                    className="btn-primary w-full text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.signUp')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;