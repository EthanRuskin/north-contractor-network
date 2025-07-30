import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeInput } from '@/hooks/useInputValidation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: { full_name: string; user_type: string }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: { full_name: string; user_type: string }) => {
    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const sanitizedFullName = sanitizeInput(userData.full_name);
    const sanitizedUserType = userData.user_type; // This should be validated from a whitelist

    // Validate user type
    if (!['homeowner', 'contractor'].includes(sanitizedUserType)) {
      return { error: { message: 'Invalid user type' } };
    }

    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email: sanitizedEmail,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: sanitizedFullName,
          user_type: sanitizedUserType
        }
      }
    });
    
    if (!error && data.user) {
      // Update user profile with sanitized data
      const [firstName, ...lastNameParts] = sanitizedFullName.split(' ');
      await supabase
        .from('profiles')
        .update({ 
          user_type: sanitizedUserType,
          first_name: firstName || '',
          last_name: lastNameParts.join(' ') || ''
        })
        .eq('id', data.user.id);
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    // Sanitize email input
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    
    const { error } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};