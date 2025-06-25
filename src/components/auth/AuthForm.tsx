import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Lock, Mail } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../../hooks/useToast';

interface AuthFormProps {
  mode: 'signin';
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { signIn, user, isLoading } = useUser();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/profile');
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(formData.email, formData.password);
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Welcome back!',
        description: 'Successfully signed in to your cosmic journey',
      });

      setFormData({
        email: '',
        password: '',
      });
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred during authentication',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-200">
          Email
        </label>
        <div className="mt-1 relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="pl-10 w-full bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
            placeholder="Enter your email"
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-200">
          Password
        </label>
        <div className="mt-1 relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            id="password"
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="pl-10 w-full bg-cosmic-black/50 border border-cosmic-purple-700/50 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cosmic-purple-500"
            placeholder="Enter your password"
            disabled={loading}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary flex items-center justify-center"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  );
};