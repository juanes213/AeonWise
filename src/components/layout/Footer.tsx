import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Twitter, Github } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-cosmic-black/90 backdrop-blur-sm border-t border-cosmic-purple-700/30 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-display text-xl tracking-wider bg-gradient-to-r from-cosmic-purple-400 to-cosmic-gold-400 bg-clip-text text-transparent">
                {t('common.appName')}
              </span>
            </Link>
            <p className="mt-4 text-white/80 text-sm">
              Unleash Your Wisdom, Connect the Cosmos with AeonWise. Experience AI-powered learning through personalized courses, mentorship, and skill-sharing.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-display mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-white/70 hover:text-cosmic-gold-400 transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/skill-swap" className="text-white/70 hover:text-cosmic-gold-400 transition-colors">
                  {t('nav.skillSwap')}
                </Link>
              </li>
              <li>
                <Link to="/mentorship" className="text-white/70 hover:text-cosmic-gold-400 transition-colors">
                  {t('nav.mentorship')}
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-white/70 hover:text-cosmic-gold-400 transition-colors">
                  {t('nav.courses')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-display mb-4 text-white">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-white/70 hover:text-cosmic-gold-400 transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-white/70 hover:text-cosmic-gold-400 transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/70 hover:text-cosmic-gold-400 transition-colors">
                  {t('footer.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-display mb-4 text-white">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-white/70 hover:text-cosmic-gold-400 transition-colors">
                <Mail className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-cosmic-gold-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-cosmic-gold-400 transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
            <div className="mt-6">
              <p className="text-sm text-white/60">
                Join our cosmic community and embark on an AI-powered learning journey.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-sm text-white/60">
            &copy; {currentYear} AeonWise. {t('footer.rights')}.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;