import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../../hooks/useToast';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, user, isLoading } = useUser();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/profile');
    }
  }, [user, isLoading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await signUp(formData.email, formData.password, formData.username);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Account Created!',
        description: 'Welcome to AeonWise! Complete your profile to get started.',
      });
    } catch (error: any) {
      console.error('Error creating account:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <div className="cosmos-card p-8">
          <div className="text-center mb-8">
            <Sparkles className="h-12 w-12 text-cosmic-gold-400 mx-auto mb-4" />
            <h1 className="text-3xl font-display mb-2">Join AeonWise</h1>
            <p className="text-gray-400">
              Create your account and start your learning journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-200 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`pl-10 w-full bg-cosmic-black/50 border ${
                    errors.fullName ? 'border-error-500' : 'border-cosmic-purple-700/50'
                  } rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500`}
                  placeholder="Enter your full name"
                  disabled={loading}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-sm text-error-500">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-200 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className={`pl-10 w-full bg-cosmic-black/50 border ${
                    errors.username ? 'border-error-500' : 'border-cosmic-purple-700/50'
                  } rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500`}
                  placeholder="Choose your username"
                  disabled={loading}
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-error-500">{errors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-10 w-full bg-cosmic-black/50 border ${
                    errors.email ? 'border-error-500' : 'border-cosmic-purple-700/50'
                  } rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500`}
                  placeholder="Enter your email address"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-error-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 w-full bg-cosmic-black/50 border ${
                    errors.password ? 'border-error-500' : 'border-cosmic-purple-700/50'
                  } rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500`}
                  placeholder="Create a secure password"
                  disabled={loading}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-error-500">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`pl-10 w-full bg-cosmic-black/50 border ${
                    errors.confirmPassword ? 'border-error-500' : 'border-cosmic-purple-700/50'
                  } rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500`}
                  placeholder="Confirm your password"
                  disabled={loading}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-error-500">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <a
                href="/auth/signin"
                className="text-cosmic-purple-400 hover:text-cosmic-purple-300 transition-colors"
              >
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;