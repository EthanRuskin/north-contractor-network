import { useAuth } from '@/contexts/AuthContext';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityMetrics {
  lastActivity: Date | null;
  sessionValid: boolean;
  rateLimited: boolean;
}

export const useSecureAuth = () => {
  const auth = useAuth();
  const { toast } = useToast();
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    lastActivity: null,
    sessionValid: true,
    rateLimited: false,
  });

  // Session timeout (30 minutes of inactivity)
  const SESSION_TIMEOUT = 30 * 60 * 1000;

  const logSecurityEvent = useCallback(async (eventType: string, eventData: any = {}) => {
    try {
      // Log to console for now since security tables are being created
      console.log('Security Event:', { eventType, eventData, user: auth.user?.id });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, [auth.user?.id]);

  const validateSession = useCallback(async () => {
    if (!auth.session) {
      setSecurityMetrics(prev => ({ ...prev, sessionValid: false }));
      return false;
    }

    // Check if session is expired
    const expiresAt = new Date(auth.session.expires_at! * 1000);
    if (expiresAt < new Date()) {
      setSecurityMetrics(prev => ({ ...prev, sessionValid: false }));
      await logSecurityEvent('session_expired');
      await auth.signOut();
      toast({
        title: "Session Expired",
        description: "Please sign in again for security.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  }, [auth.session, auth.signOut, logSecurityEvent, toast]);

  const checkActivity = useCallback(() => {
    const lastActivity = securityMetrics.lastActivity;
    if (lastActivity && Date.now() - lastActivity.getTime() > SESSION_TIMEOUT) {
      logSecurityEvent('session_timeout');
      auth.signOut();
      toast({
        title: "Session Timeout",
        description: "You've been signed out due to inactivity.",
        variant: "default",
      });
    }
  }, [securityMetrics.lastActivity, auth.signOut, logSecurityEvent, toast]);

  const updateActivity = useCallback(() => {
    setSecurityMetrics(prev => ({
      ...prev,
      lastActivity: new Date(),
    }));
  }, []);

  const secureSignIn = useCallback(async (email: string, password: string) => {
    const startTime = Date.now();
    
    try {
      const result = await auth.signIn(email, password);
      
      if (result.error) {
        await logSecurityEvent('sign_in_failed', { 
          email: email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Partially hide email
          error: result.error.message 
        });
        
        // Check for rate limiting
        if (result.error.message.includes('rate limit')) {
          setSecurityMetrics(prev => ({ ...prev, rateLimited: true }));
          toast({
            title: "Too Many Attempts",
            description: "Please wait before trying again.",
            variant: "destructive",
          });
        }
        
        return result;
      }

      await logSecurityEvent('sign_in_success', { 
        email: email.replace(/(.{2}).*(@.*)/, '$1***$2'),
        login_time: new Date().toISOString()
      });
      
      updateActivity();
      return result;
    } catch (error) {
      await logSecurityEvent('sign_in_error', { error: String(error) });
      throw error;
    }
  }, [auth.signIn, logSecurityEvent, updateActivity, toast]);

  const secureSignOut = useCallback(async () => {
    await logSecurityEvent('sign_out', { 
      logout_time: new Date().toISOString()
    });
    await auth.signOut();
  }, [auth.signOut, logSecurityEvent]);

  // Monitor user activity
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => updateActivity();
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [updateActivity]);

  // Check session validity periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (auth.user) {
        validateSession();
        checkActivity();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [auth.user, validateSession, checkActivity]);

  return {
    ...auth,
    securityMetrics,
    signIn: secureSignIn,
    signOut: secureSignOut,
    validateSession,
    logSecurityEvent,
    updateActivity,
  };
};