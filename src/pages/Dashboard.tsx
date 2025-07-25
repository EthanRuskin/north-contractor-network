import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import ContractorDashboard from '@/components/dashboard/ContractorDashboard';
import HomeownerDashboard from '@/components/dashboard/HomeownerDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Edit, Search, Users, Home } from 'lucide-react';
import Header from '@/components/Header';
interface Profile {
  user_type: string;
  full_name: string;
}
interface ContractorBusiness {
  id: string;
}
const Dashboard = () => {
  const {
    user,
    signOut,
    loading: authLoading
  } = useAuth();
  const navigate = useNavigate();
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
      const {
        data,
        error
      } = await supabase.from('profiles').select('user_type, full_name').eq('user_id', user?.id).single();
      if (error) throw error;
      setProfile(data);

      // If contractor, fetch business ID
      if (data?.user_type === 'contractor') {
        const {
          data: businessData
        } = await supabase.from('contractor_businesses').select('id').eq('user_id', user?.id).single();
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
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>;
  }
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  const handleSignOut = async () => {
    await signOut();
  };
  return <div className="min-h-screen bg-background">
      <Header />
      
      {/* Homeowner Welcome */}
      {profile?.user_type === 'homeowner'}

      <main className="container mx-auto px-4 py-8">
        {profile?.user_type === 'contractor' ? <ContractorDashboard /> : <HomeownerDashboard />}
      </main>
    </div>;
};
export default Dashboard;