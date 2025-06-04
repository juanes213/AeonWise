import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { AuthForm } from '../../components/auth/AuthForm';

const SignUpPage: React.FC = () => {
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
            <h1 className="text-3xl font-display mb-2">Create Account</h1>
            <p className="text-gray-400">
              Join our community of learners and mentors
            </p>
          </div>

          <AuthForm mode="signup" />

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link
                to="/auth/signin"
                className="text-cosmic-purple-400 hover:text-cosmic-purple-300 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;