import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSupabase } from '../lib/supabase/SupabaseProvider';

type UserRank = 'starspark' | 'nebula_novice' | 'astral_apprentice' | 'comet_crafter' | 'galactic_guide' | 'cosmic_sage';

interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements: string[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  startDate: string;
  endDate: string;
  url?: string;
  achievements: string[];
}

interface Certification {
  id: string;
  name: string;
  organization: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

interface UserProfile {
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
  work_experience?: WorkExperience[];
  projects?: Project[];
  certifications?: Certification[];
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

const calculatePoints = (profile: Partial<UserProfile>): number => {
  let points = 0;
  
  // Base points for profile completion
  if (profile.bio && profile.bio.length > 0) points += 50;
  if (profile.skills && profile.skills.length > 0) points += profile.skills.length * 10;
  if (profile.learning_goals && profile.learning_goals.length > 0) points += profile.learning_goals.length * 5;
  
  // Work experience points
  if (profile.work_experience) {
    points += profile.work_experience.length * 50;
    profile.work_experience.forEach(exp => {
      if (exp.achievements && exp.achievements.length > 0) {
        points += exp.achievements.length * 10;
      }
    });
  }
  
  // Project points
  if (profile.projects) {
    points += profile.projects.length * 30;
    profile.projects.forEach(project => {
      if (project.achievements && project.achievements.length > 0) {
        points += project.achievements.length * 10;
      }
    });
  }
  
  // Certification points
  if (profile.certifications) {
    points += profile.certifications.length * 40;
  }
  
  return points;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('UserProvider rendering...');
  
  const supabase = useSupabase();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    console.log('refreshUser: Starting refresh...');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('refreshUser: session:', session ? 'exists' : 'null');
      
      if (session?.user) {
        console.log('refreshUser: Fetching profile for user:', session.user.id);
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        console.log('refreshUser: Profile fetch result:', profile ? 'found' : 'not found', error ? `Error: ${error.message}` : 'No error');
        
        if (!error && profile) {
          console.log('refreshUser: Setting user with profile data');
          setUser({
            ...profile,
            rank: calculateRank(profile.points)
          });
        } else {
          console.log('No profile found or error occurred:', error);
          setUser(null);
        }
      } else {
        console.log('refreshUser: No session, setting user to null');
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeUser = async () => {
      try {
        console.log('Initializing user...');
        setIsLoading(true);
        
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('initializeUser: session:', session ? 'exists' : 'null', 'error:', error ? error.message : 'none');
        
        if (error) {
          console.warn('Auth session error:', error);
          if (mounted) {
            setUser(null);
            setIsLoading(false);
          }
          return;
        }
        
        if (session?.user && mounted) {
          console.log('initializeUser: User session found:', session.user.id);
          try {
            console.log('initializeUser: Fetching profile for user:', session.user.id);
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            console.log('initializeUser: Profile fetch result:', profile ? 'found' : 'not found', profileError ? `Error: ${profileError.message}` : 'No error');
            
            if (!profileError && profile && mounted) {
              console.log('User profile loaded:', profile);
              setUser({
                ...profile,
                rank: calculateRank(profile.points)
              });
            } else {
              console.log('No profile found, user needs to complete setup');
              if (mounted) {
                setUser(null);
              }
            }
          } catch (profileError) {
            console.error('Error loading profile:', profileError);
            if (mounted) {
              setUser(null);
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
      console.log('User context auth state change:', event, session ? 'session exists' : 'no session');
      
      if (event === 'SIGNED_IN' && session) {
        console.log('onAuthStateChange: SIGNED_IN event detected');
        setIsLoading(true);
        try {
          console.log('onAuthStateChange: Fetching profile for user:', session.user.id);
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          console.log('onAuthStateChange: Profile fetch result:', profile ? 'found' : 'not found', error ? `Error: ${error.message}` : 'No error');
          
          if (!error && profile) {
            console.log('Profile loaded after sign in:', profile);
            setUser({
              ...profile,
              rank: calculateRank(profile.points)
            });
          } else {
            console.log('No profile found after sign in');
            setUser(null);
          }
        } catch (error) {
          console.error('Error loading profile after sign in:', error);
          setUser(null);
        }
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        console.log('onAuthStateChange: SIGNED_OUT event detected');
        setUser(null);
        setIsLoading(false);
      } else if (event === 'TOKEN_REFRESHED') {
        // Don't change loading state for token refresh
        console.log('Token refreshed, keeping current state');
      }
    });

    // Add event listener for window focus to refresh user session
    const handleFocus = () => {
      console.log('Window focused, refreshing user session');
      refreshUser();
    };
    
    window.addEventListener('focus', handleFocus);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener('focus', handleFocus);
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('signIn: Starting sign in process for email:', email);
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error('signIn: Error during sign in:', error.message);
        throw error;
      }

      console.log('signIn: Sign in successful, auth state change should trigger profile load');
      // Don't set user here, let the auth state change handler do it
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
      console.log('signUp: Starting sign up process for email:', email);
      setIsLoading(true);
      
      // First create the auth user
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { username },
          emailRedirectTo: undefined
        }
      });
      
      if (error) throw error;

      // Profile creation is handled by the database trigger
      // The trigger function handle_new_user() will create the profile automatically
      console.log('signUp: Sign up successful, profile creation handled by DB trigger');
      
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
      console.log('signOut: Starting sign out process');
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      console.log('signOut: Sign out successful');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      console.error('updateProfile: No user logged in');
      return { error: new Error('User not logged in') };
    }

    try {
      console.log('Updating profile for user:', user.id, 'with updates:', updates);
      
      // Calculate new points based on all profile data
      const updatedProfileData = { ...user, ...updates };
      const newPoints = calculatePoints(updatedProfileData);
      const newRank = calculateRank(newPoints);
      
      // Prepare update data
      const updateData = {
        ...updates,
        points: newPoints,
        updated_at: new Date().toISOString()
      };
      
      console.log('Updating profile with data:', updateData);
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      
      console.log('Supabase response:', data);

      const updatedUser = {
        ...user,
        ...updates,
        points: newPoints,
        rank: newRank
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