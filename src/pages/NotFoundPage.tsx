import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Sparkles } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="cosmos-card p-8 max-w-md w-full text-center">
        <Sparkles className="h-16 w-16 text-cosmic-gold-400 mx-auto mb-6" />
        <h1 className="text-3xl font-display mb-4">404</h1>
        <h2 className="text-xl font-display mb-6 magic-text">
          The cosmic page you seek is in another dimension
        </h2>
        <p className="text-white/70 mb-8">
          The astral path you've taken leads to uncharted space. Let us guide you back to the known universe.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center">
          <Home className="h-4 w-4 mr-2" />
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;