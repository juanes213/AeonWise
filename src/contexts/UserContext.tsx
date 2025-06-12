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
  console.log('UserProvider rendering...');
  
  const supabase = useSupabase();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        console.log('Initializing user...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('Auth session error:', error);
          if (mounted) {
            setUser(null);
            setIsLoading(false);
          }
          return;
        }
        
        if (session?.user && mounted) {
          console.log('User session found:', session.user.id);
          
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (!profileError && profile && mounted) {
              console.log('User profile loaded:', profile);
              setUser({
                ...profile,
                rank: calculateRank(profile.points)
              });
            } else {
              console.log('No profile found, creating basic user object');
              // Create a basic user object to prevent infinite loading
              if (mounted) {
                setUser({
                  id: session.user.id,
                  email: session.user.email || '',
                  username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || '',
                  points: 0,
                  rank: 'starspark',
                  skills: [],
                  learning_goals: [],
                  bio: '',
                  created_at: new Date().toISOString()
                });
              }
            }
          } catch (profileError) {
            console.error('Error loading profile:', profileError);
            // Still create a basic user to prevent infinite loading
            if (mounted) {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || '',
                points: 0,
                rank: 'starspark',
                skills: [],
                learning_goals: [],
                bio: '',
                created_at: new Date().toISOString()
              });
            }
          }
        } else {
          console.log('No user session');
          if (mounted) {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          console.log('Setting loading to false');
          setIsLoading(false);
        }
      }
    };

    initializeUser();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('User context auth state change:', event);

      try {
        if (event === 'SIGNED_IN' && session) {
          setIsLoading(true);
          
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (!error && profile) {
            console.log('Profile loaded after sign in:', profile);
            setUser({
              ...profile,
              rank: calculateRank(profile.points)
            });
          } else {
            console.log('No profile found after sign in, creating basic user object');
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || '',
              points: 0,
              rank: 'starspark',
              skills: [],
              learning_goals: [],
              bio: '',
              created_at: new Date().toISOString()
            });
          }
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Don't set loading for token refresh, just update user if needed
          await refreshUser();
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
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
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        throw error;
      }

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (!profileError && profile) {
          setUser({
            ...profile,
            rank: calculateRank(profile.points)
          });
        } else {
          // Create basic user object if no profile
          setUser({
            id: data.user.id,
            email: data.user.email || '',
            username: data.user.user_metadata?.username || data.user.email?.split('@')[0] || '',
            points: 0,
            rank: 'starspark',
            skills: [],
            learning_goals: [],
            bio: '',
            created_at: new Date().toISOString()
          });
        }
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
          data: { username },
          emailRedirectTo: undefined
        }
      });
      
      if (error) throw error;

      return { error: null };
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
      console.log('Updating profile for user:', user.id, 'with updates:', updates);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      const updatedUser = {
        ...user,
        ...updates,
        rank: calculateRank(updates.points !== undefined ? updates.points : user.points)
      };
      
      console.log('Profile updated successfully, new user state:', updatedUser);
      setUser(updatedUser);
      
      return { error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error };
    }
  };

  console.log('UserProvider state - user:', user?.username || 'none', 'loading:', isLoading);

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