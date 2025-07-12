import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Star, MessageSquare } from 'lucide-react';
import BusinessSetupForm from './BusinessSetupForm';
import { useToast } from '@/hooks/use-toast';

interface Business {
  id: string;
  business_name: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  years_experience: number;
  license_number: string;
  status: string;
  rating: number;
  review_count: number;
  created_at: string;
}

const ContractorDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [business, setBusiness] = useState<Business | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusiness();
  }, [user]);

  const fetchBusiness = async () => {
    try {
      const { data, error } = await supabase
        .from('contractor_businesses')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      setBusiness(data);
      
      if (!data) {
        setShowForm(true);
      }
    } catch (error) {
      console.error('Error fetching business:', error);
      toast({
        title: "Error loading business",
        description: "Could not load your business information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showForm || !business) {
    return (
      <BusinessSetupForm 
        business={business}
        onComplete={() => {
          setShowForm(false);
          fetchBusiness();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Contractor Dashboard</h2>
          <p className="text-muted-foreground">Manage your business profile and services</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Edit className="h-4 w-4" />
          Edit Business
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Business Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(business.status)}>
              {business.status.charAt(0).toUpperCase() + business.status.slice(1)}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              {business.status === 'pending' && 'Your business is under review'}
              {business.status === 'approved' && 'Your business is live'}
              {business.status === 'rejected' && 'Please update your information'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{business.rating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Based on {business.review_count} reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{business.review_count}</div>
            <p className="text-xs text-muted-foreground">
              Customer feedback
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Listed Since</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(business.created_at).getFullYear()}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(business.created_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{business.business_name}</CardTitle>
          <CardDescription>{business.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Quick Actions</h4>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                <Button variant="outline" className="justify-start gap-2">
                  <Plus className="h-4 w-4" />
                  Add Photos
                </Button>
                <Button variant="outline" className="justify-start gap-2">
                  <Edit className="h-4 w-4" />
                  Update Services
                </Button>
                <Button variant="outline" className="justify-start gap-2">
                  <MessageSquare className="h-4 w-4" />
                  View Reviews
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractorDashboard;