import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Star, MessageSquare, TrendingUp, Zap, Target, ExternalLink, Settings } from 'lucide-react';
import BusinessSetupForm from './BusinessSetupForm';
import ContractorOnboarding from '../onboarding/ContractorOnboarding';
import ProjectsManager from './ProjectsManager';
import GoogleVerificationSetup from './GoogleVerificationSetup';
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
  google_business_verified: boolean;
  google_place_id: string;
  google_verification_date: string;
  google_business_url: string;
}

const ContractorDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [business, setBusiness] = useState<Business | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
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
        setShowOnboarding(true);
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

  if (showOnboarding && !business) {
    return (
      <ContractorOnboarding 
        onComplete={() => {
          setShowOnboarding(false);
          fetchBusiness();
        }}
      />
    );
  }

  if (showForm) {
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

  // If business is still null after loading, redirect to onboarding
  if (!business) {
    return (
      <ContractorOnboarding 
        onComplete={() => {
          setShowOnboarding(false);
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
        <div className="flex gap-2">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/account-settings">
              <Settings className="h-4 w-4" />
              Account Settings
            </Link>
          </Button>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Business
          </Button>
        </div>
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

      {/* Google Verification */}
      <GoogleVerificationSetup 
        business={business}
        onVerificationComplete={fetchBusiness}
      />

      {/* Projects Manager */}
      <ProjectsManager contractorId={business.id} />

      {/* Business Scaling Section */}
      <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl text-foreground">Ready to Scale Your Business?</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Take your contracting business to the next level with proven marketing strategies
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-primary/10 rounded">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Lead Generation</h4>
                <p className="text-xs text-muted-foreground">Get consistent, high-quality leads every month</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-primary/10 rounded">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Digital Marketing</h4>
                <p className="text-xs text-muted-foreground">Professional website, SEO, and social media management</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-primary/10 rounded">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Business Growth</h4>
                <p className="text-xs text-muted-foreground">Scale your operations and increase revenue</p>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-foreground mb-1">
                  🚀 <strong>Advertised Solutions</strong> - Your Marketing Partner
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  We specialize in helping contractors like you grow their business with proven marketing strategies. 
                  Get more leads, build your brand, and increase your revenue.
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    Free Consultation
                  </Badge>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    Proven Results
                  </Badge>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    Contractor Specialists
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <Button 
                  className="gap-2 whitespace-nowrap" 
                  onClick={() => window.open('https://advertisedsolutions.com', '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  Get Free Consultation
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open('mailto:ethan@advertisedsolutions.com?subject=Contractor Marketing Consultation', '_blank')}
                >
                  Contact Us
                </Button>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Join <strong>100+</strong> contractors who have successfully scaled their business with our help
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractorDashboard;