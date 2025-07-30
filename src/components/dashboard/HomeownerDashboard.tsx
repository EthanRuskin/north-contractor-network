import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Star, Users, TrendingUp, ArrowRight, MessageSquare, Heart, Trash2, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
interface ContractorBusiness {
  id: string;
  business_name: string;
  description: string;
  service_area: string;
  founded_year: number;
  verified: boolean;
}

interface SavedContractor {
  id: string;
  contractor_id: string;
  created_at: string;
  contractor_profiles: ContractorBusiness;
}
const HomeownerDashboard = () => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [contractors, setContractors] = useState<ContractorBusiness[]>([]);
  const [savedContractors, setSavedContractors] = useState<SavedContractor[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchContractors();
    if (user) {
      fetchSavedContractors();
    }
  }, [user]);
  const fetchContractors = async () => {
    try {
      setLoading(true);
      const {
        data,
        error
      } = await supabase.from('contractor_profiles').select('id, business_name, description, service_area, founded_year, verified').eq('verified', true).order('created_at', {
        ascending: false
      }).limit(6);
      if (error) throw error;
      setContractors(data || []);
    } catch (error) {
      console.error('Error fetching contractors:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchSavedContractors = async () => {
    if (!user) return;
    try {
      const {
        data,
        error
      } = await supabase.from('saved_contractors').select(`
          id,
          contractor_id,
          created_at,
          contractor_profiles (
            id,
            business_name,
            description,
            service_area,
            founded_year,
            verified
          )
        `).eq('client_id', user.id).order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setSavedContractors(data || []);
    } catch (error) {
      console.error('Error fetching saved contractors:', error);
    }
  };
  const removeSavedContractor = async (savedContractorId: string) => {
    try {
      const {
        error
      } = await supabase.from('saved_contractors').delete().eq('id', savedContractorId);
      if (error) throw error;
      setSavedContractors(prev => prev.filter(sc => sc.id !== savedContractorId));
      toast({
        title: "Contractor removed",
        description: "Contractor removed from your saved list"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  if (loading) {
    return <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }
  return <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex justify-between items-start">
        <div className="text-center flex-1">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to Northern Contractor Network
          </h1>
          <p className="text-xl text-muted-foreground">
            Find trusted contractors for your home improvement projects
          </p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link to="/account-settings">
            <Settings className="h-4 w-4" />
            Account Settings
          </Link>
        </Button>
      </div>

      {/* How it works cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="text-center">
            <Search className="h-12 w-12 text-primary mx-auto mb-2" />
            <CardTitle>Find Contractors</CardTitle>
            <CardDescription>
              Search by service type, location, or specific needs
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Star className="h-12 w-12 text-primary mx-auto mb-2" />
            <CardTitle>Read Reviews</CardTitle>
            <CardDescription>
              See what other homeowners say about their experience
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <MessageSquare className="h-12 w-12 text-primary mx-auto mb-2" />
            <CardTitle>Connect Directly</CardTitle>
            <CardDescription>
              Contact contractors and get quotes for your project
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-primary/20">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-foreground">Ready to Start Your Project?</h3>
            <p className="text-muted-foreground">
              Browse our network of verified contractors and find the perfect match for your needs.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link to="/search">
                  Browse Contractors <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      

      {/* Information sections */}
      

      {/* Saved Contractors */}
      {savedContractors.length > 0 && <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" style={{
                color: '#A4161A'
              }} />
                  Saved Contractors ({savedContractors.length})
                </CardTitle>
                <CardDescription>
                  Contractors you've saved for easy access
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {savedContractors.map(savedContractor => <Card key={savedContractor.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{savedContractor.contractor_profiles.business_name}</CardTitle>
                        <CardDescription className="text-sm">
                          {savedContractor.contractor_profiles.service_area}
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeSavedContractor(savedContractor.id)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {savedContractor.contractor_profiles.verified && (
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-primary font-medium">✓ Verified</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {savedContractor.contractor_profiles.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Saved {new Date(savedContractor.created_at).toLocaleDateString()}
                      </span>
                      <Button size="sm" asChild>
                        <Link to={`/contractor/${savedContractor.contractor_profiles.id}`}>
                          View Profile
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>)}
            </div>
          </CardContent>
        </Card>}

      {/* Top Rated Contractors */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Top Rated Contractors</CardTitle>
              <CardDescription>
                Highly rated professionals in your area
              </CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link to="/search" className="gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contractors.map(contractor => <Card key={contractor.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{contractor.business_name}</CardTitle>
                      <CardDescription className="text-sm">
                        {contractor.service_area}
                      </CardDescription>
                    </div>
                    {contractor.verified && (
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-primary font-medium">✓ Verified</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {contractor.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {contractor.founded_year ? `Since ${contractor.founded_year}` : 'Professional Service'}
                    </span>
                    <Button size="sm" asChild>
                      <Link to={`/contractor/${contractor.id}`}>
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default HomeownerDashboard;