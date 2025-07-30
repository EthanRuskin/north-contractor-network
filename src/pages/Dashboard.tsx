import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import ContractorDashboard from '@/components/dashboard/ContractorDashboard';
import HomeownerDashboard from '@/components/dashboard/HomeownerDashboard';

interface Profile {
  user_type: string;
  first_name: string;
  last_name: string;
}

interface ContractorBusiness {
  id: string;
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [contractorBusiness, setContractorBusiness] = useState<ContractorBusiness | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type, first_name, last_name')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      setProfile(data);

      // If contractor, fetch business ID
      if (data?.user_type === 'contractor') {
        const { data: businessData } = await supabase
          .from('contractor_profiles')
          .select('id')
          .eq('id', user?.id)
          .single();
        
        if (businessData) {
          setContractorBusiness(businessData);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Error loading profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {profile.user_type === 'contractor' ? (
          <ContractorDashboard />
        ) : (
          <HomeownerDashboard />
        )}
      </div>
    </div>
  );
};

export default Dashboard;