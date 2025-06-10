import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.warn('Auth session error:', error);
          if (mounted) {
            setUser(null);
            setInitialized(true);
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          setUser(session?.user ?? null);
          setInitialized(true);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setUser(null);
          setInitialized(true);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state change:', event, session?.user?.id);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null);
        setLoading(false);

        if (session?.user) {
          // Check if profile exists, if not create it
          const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .single();

          if (!existingProfile && !fetchError) {
            // Profile doesn't exist, create it
            const { error: insertError } = await supabase.from('profiles').insert({
              id: session.user.id,
              email: session.user.email,
              username: session.user.user_metadata?.username ?? session.user.email?.split('@')[0] ?? ''
            });

            if (insertError) {
              console.error('Profile creation error:', insertError);
            } else {
              console.log('Profile created successfully');
            }
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // First try to sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (error) {
        // If email not confirmed, automatically confirm it and try again
        if (error.message === 'Email not confirmed') {
          // Update the user's email confirmation status
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            data?.user?.id || '',
            { email_confirm: true }
          );
          
          if (!updateError) {
            // Try signing in again
            const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({ 
              email, 
              password 
            });
            
            if (retryError) throw retryError;
            setUser(retryData.user);
            return { error: null };
          }
        }
        throw error;
      }
      
      setUser(data.user);
      return { error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setLoading(true);
      
      // Sign up with Supabase Auth (email confirmation disabled)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
          emailRedirectTo: undefined // Disable email confirmation
        }
      });

      if (error) throw error;

      // If user is immediately available (email confirmation disabled), set user
      if (data.user && !data.user.email_confirmed_at) {
        // Manually confirm the user since email confirmation is disabled
        await supabase.auth.admin.updateUserById(data.user.id, {
          email_confirm: true
        });
      }

      setUser(data.user);
      return { error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!initialized) return null;

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};