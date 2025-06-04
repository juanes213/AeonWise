import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSupabase } from '../lib/supabase/SupabaseProvider';

export type UserRank = 'novice' | 'apprentice' | 'journeyman' | 'expert' | 'master';

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
  if (points >= 801) return 'master';
  if (points >= 601) return 'expert';
  if (points >= 401) return 'journeyman';
  if (points >= 201) return 'apprentice';
  return 'novice';
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabase = useSupabase();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active session and get user
    const getInitialSession = async () => {
      try {
        setIsLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profile) {
            setUser({
              ...profile,
              rank: calculateRank(profile.points)
            });
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profile) {
            setUser({
              ...profile,
              rank: calculateRank(profile.points)
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { username }
        }
      });
      
      if (!error) {
        // Create initial profile with default values
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              email,
              username,
              points: 0,
              skills: [],
              learning_goals: [],
              bio: '',
            }
          ]);
        
        return { error: profileError };
      }
      
      return { error };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error('User not logged in') };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (!error) {
        setUser({
          ...user,
          ...updates,
          rank: calculateRank(updates.points !== undefined ? updates.points : user.points)
        });
      }
      
      return { error };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error };
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      isLoading, 
      signIn, 
      signUp, 
      signOut,
      updateProfile
    }}>
      {children}
    </UserContext.Provider>
  );
};