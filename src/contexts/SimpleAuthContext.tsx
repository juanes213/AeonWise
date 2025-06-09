import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSupabase } from '../lib/supabase/SupabaseProvider';

interface User {
  id: string;
  username: string;
  created_at: string;
}

interface Profile {
  id: string;
  username: string;
  email: string;
  points: number;
  skills: string[];
  learning_goals: string[];
  bio: string;
  simple_user_id: string;
}

interface SimpleAuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signUp: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signOut: () => void;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

export const useSimpleAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
};

export const SimpleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabase = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('simple_auth_user');
    const storedProfile = localStorage.getItem('simple_auth_profile');
    
    if (storedUser && storedProfile) {
      try {
        setUser(JSON.parse(storedUser));
        setProfile(JSON.parse(storedProfile));
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        localStorage.removeItem('simple_auth_user');
        localStorage.removeItem('simple_auth_profile');
      }
    }
    
    setIsLoading(false);
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.rpc('authenticate_user', {
        username_input: username,
        password_input: password
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        setUser(data.user);
        setProfile(data.profile);
        
        // Store in localStorage
        localStorage.setItem('simple_auth_user', JSON.stringify(data.user));
        localStorage.setItem('simple_auth_profile', JSON.stringify(data.profile));
        
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { success: false, message: error.message || 'Sign in failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Check if username already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is what we want
        throw checkError;
      }

      if (existingProfile) {
        return { success: false, message: 'Username is already taken. Please choose a different username.' };
      }
      
      const { data, error } = await supabase.rpc('register_user', {
        username_input: username,
        password_input: password
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        setUser(data.user);
        setProfile(data.profile);
        
        // Store in localStorage
        localStorage.setItem('simple_auth_user', JSON.stringify(data.user));
        localStorage.setItem('simple_auth_profile', JSON.stringify(data.profile));
        
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Handle specific database constraint errors
      if (error.code === '23505' && error.message.includes('profiles_username_key')) {
        return { success: false, message: 'Username is already taken. Please choose a different username.' };
      }
      
      return { success: false, message: error.message || 'Sign up failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('simple_auth_user');
    localStorage.removeItem('simple_auth_profile');
  };

  return (
    <SimpleAuthContext.Provider value={{
      user,
      profile,
      isLoading,
      signIn,
      signUp,
      signOut
    }}>
      {children}
    </SimpleAuthContext.Provider>
  );
};