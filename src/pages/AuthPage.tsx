import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../hooks/useToast';

const AuthPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, signIn, signUp, isLoading } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [isSignUp, setIsSignUp] = useState(() => {
    // Check if the URL has a signup parameter
    const params = new URLSearchParams(location.search);
    return params.get('signup') === 'true';
  });
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (user && !isLoading) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (isSignUp && !formData.username) {
      newErrors.username = 'Username is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (isSignUp) {
        const { error } = await signUp(formData.email, formData.password, formData.username);
        if (error) {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Success',
            description: 'Account created successfully! You can now sign in.',
          });
          setIsSignUp(false);
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Success',
            description: 'Signed in successfully!',
          });
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setErrors({});
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-cosmic-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        className="w-full max-w-md"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="cosmos-card p-8">
          <div className="text-center mb-6">
            <Sparkles className="h-8 w-8 text-cosmic-gold-400 mx-auto mb-4" />
            <h1 className="text-2xl font-display">
              {isSignUp ? t('auth.newAccount') : t('auth.welcomeBack')}
            </h1>
            <p className="text-white/70 mt-2">
              {isSignUp 
                ? 'Join our community of knowledge seekers and mentors' 
                : 'Continue your journey of wisdom and learning'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div>
                <label htmlFor="username\" className="block text-sm font-medium text-white/90 mb-1">
                  {t('auth.username')}
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full bg-cosmic-black/50 border ${
                    errors.username ? 'border-error-500' : 'border-cosmic-purple-700/50'
                  } rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500`}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-error-500">{errors.username}</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-1">
                {t('auth.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full bg-cosmic-black/50 border ${
                  errors.email ? 'border-error-500' : 'border-cosmic-purple-700/50'
                } rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-1">
                {t('auth.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full bg-cosmic-black/50 border ${
                  errors.password ? 'border-error-500' : 'border-cosmic-purple-700/50'
                } rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-error-500">{errors.password}</p>
              )}
            </div>

            {!isSignUp && (
              <div className="text-right">
                <a href="#" className="text-sm text-cosmic-purple-400 hover:text-cosmic-purple-300">
                  {t('auth.forgotPassword')}
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full flex justify-center items-center"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : null}
              {isSignUp ? t('auth.signUp') : t('auth.signIn')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/70">
              {isSignUp ? t('auth.alreadyHaveAccount') : t('auth.dontHaveAccount')}
              <button
                type="button"
                onClick={toggleAuthMode}
                className="ml-2 text-cosmic-gold-400 hover:text-cosmic-gold-300 focus:outline-none"
              >
                {isSignUp ? t('auth.signIn') : t('auth.signUp')}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;