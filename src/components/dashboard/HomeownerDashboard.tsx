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
  city: string;
  province: string;
  rating: number;
  review_count: number;
}

interface SavedContractor {
  id: string;
  contractor_id: string;
  created_at: string;
  contractor_businesses: ContractorBusiness;
}

const HomeownerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
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
      const { data, error } = await supabase
        .from('contractor_businesses')
        .select('id, business_name, description, city, province, rating, review_count')
        .eq('status', 'approved')
        .order('rating', { ascending: false })
        .limit(6);

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
      const { data, error } = await supabase
        .from('saved_contractors')
        .select(`
          id,
          contractor_id,
          created_at,
          contractor_businesses (
            id,
            business_name,
            description,
            city,
            province,
            rating,
            review_count
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedContractors(data || []);
    } catch (error) {
      console.error('Error fetching saved contractors:', error);
    }
  };

  const removeSavedContractor = async (savedContractorId: string) => {
    try {
      const { error } = await supabase
        .from('saved_contractors')
        .delete()
        .eq('id', savedContractorId);

      if (error) throw error;

      setSavedContractors(prev => prev.filter(sc => sc.id !== savedContractorId));
      toast({
        title: "Contractor removed",
        description: "Contractor removed from your saved list",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Contractors
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">
              Verified professionals
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-xs text-muted-foreground">
              Based on 15,284 reviews
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Most Popular
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Plumbing</div>
            <p className="text-xs text-muted-foreground">
              Service category
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New This Week
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              New contractors joined
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Information sections */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Popular Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link to="/services/plumbing" className="block text-sm text-primary hover:underline">
                • Plumbing & Heating
              </Link>
              <Link to="/services/electrical" className="block text-sm text-primary hover:underline">
                • Electrical Services
              </Link>
              <Link to="/services/roofing" className="block text-sm text-primary hover:underline">
                • Roofing & Gutters
              </Link>
              <Link to="/services/flooring" className="block text-sm text-primary hover:underline">
                • Flooring Installation
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>1. Search for contractors in your area</p>
              <p>2. Read reviews and compare profiles</p>
              <p>3. Contact contractors directly</p>
              <p>4. Get quotes and hire the best fit</p>
              <p>5. Leave a review after completion</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Saved Contractors */}
      {savedContractors.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
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
              {savedContractors.map((savedContractor) => (
                <Card key={savedContractor.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{savedContractor.contractor_businesses.business_name}</CardTitle>
                        <CardDescription className="text-sm">
                          {savedContractor.contractor_businesses.city}, {savedContractor.contractor_businesses.province}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSavedContractor(savedContractor.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{savedContractor.contractor_businesses.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({savedContractor.contractor_businesses.review_count} reviews)
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {savedContractor.contractor_businesses.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Saved {new Date(savedContractor.created_at).toLocaleDateString()}
                      </span>
                      <Button size="sm" asChild>
                        <Link to={`/contractor/${savedContractor.contractor_businesses.id}`}>
                          View Profile
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
            {contractors.map((contractor) => (
              <Card key={contractor.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{contractor.business_name}</CardTitle>
                      <CardDescription className="text-sm">
                        {contractor.city}, {contractor.province}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{contractor.rating}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {contractor.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {contractor.review_count} reviews
                    </span>
                    <Button size="sm" asChild>
                      <Link to={`/contractor/${contractor.id}`}>
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomeownerDashboard;