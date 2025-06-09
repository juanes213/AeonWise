import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSupabase } from '../lib/supabase/SupabaseProvider';

export type UserRank = 'starspark' | 'nebula_novice' | 'astral_apprentice' | 'comet_crafter' | 'galactic_guide' | 'cosmic_sage';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  points: number;
  rank: UserRank;
  skills: string[];
  learning_goals: string[];
  bio: string;
  avatar_url?: string;
  created_at: string;
}

interface UserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

const calculateRank = (points: number): UserRank => {
  if (points >= 1601) return 'cosmic_sage';
  if (points >= 1201) return 'galactic_guide';
  if (points >= 801) return 'comet_crafter';
  if (points >= 501) return 'astral_apprentice';
  if (points >= 251) return 'nebula_novice';
  return 'starspark';
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabase = useSupabase();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (!error && profile) {
          setUser({
            ...profile,
            rank: calculateRank(profile.points)
          });
        }
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (!error && profile && mounted) {
            setUser({
              ...profile,
              rank: calculateRank(profile.points)
            });
          }
        }
      } catch (error) {
        console.error('Error initializing user:', error);
      } finally {
        if (mounted) {
          setInitialized(true);
          setIsLoading(false);
        }
      }
    };

    initializeUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('User context auth state change:', event);

      if (event === 'SIGNED_IN' && session) {
        setIsLoading(true);
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (!error && profile) {
            setUser({
              ...profile,
              rank: calculateRank(profile.points)
            });
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        } finally {
          setIsLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Refresh user data when token is refreshed
        await refreshUser();
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) throw profileError;
        
        setUser({
          ...profile,
          rank: calculateRank(profile.points)
        });
      }

      return { error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { username }
        }
      });
      
      if (error) throw error;

      if (data.user) {
        const newProfile = {
          id: data.user.id,
          email,
          username,
          points: 0,
          skills: [],
          learning_goals: [],
          bio: '',
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([newProfile]);
        
        if (profileError) throw profileError;

        setUser({
          ...newProfile,
          rank: 'starspark',
          created_at: new Date().toISOString()
        });

        return { error: null };
      }

      throw new Error('No user data returned');
    } catch (error) {
      console.error('Error signing up:', error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error('User not logged in') };
    }

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) throw error;

      const updatedUser = {
        ...user,
        ...updates,
        rank: calculateRank(updates.points !== undefined ? updates.points : user.points)
      };
      
      setUser(updatedUser);
      
      return { error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render children until user context is initialized
  if (!initialized) {
    return null;
  }

  return (
    <UserContext.Provider value={{ 
      user, 
      isLoading, 
      signIn, 
      signUp, 
      signOut,
      updateProfile,
      refreshUser
    }}>
      {children}
    </UserContext.Provider>
  );
};