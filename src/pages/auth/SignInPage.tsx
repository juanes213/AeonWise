import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { AuthForm } from '../../components/auth/AuthForm';

const SignInPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="cosmos-card p-8">
          <div className="text-center mb-8">
            <Sparkles className="h-12 w-12 text-cosmic-gold-400 mx-auto mb-4" />
            <h1 className="text-3xl font-display mb-2">Welcome to AeonWise</h1>
            <p className="text-gray-400">
              Sign in to continue your cosmic learning journey
            </p>
          </div>

          <AuthForm mode="signin" />

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/auth/signup"
                className="text-cosmic-purple-400 hover:text-cosmic-purple-300 transition-colors"
              >
                Create your cosmic profile
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignInPage;