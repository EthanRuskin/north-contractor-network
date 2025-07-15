import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Star, Users, TrendingUp, ArrowRight } from 'lucide-react';
import HomeownerWelcome from '../onboarding/HomeownerWelcome';
import { useAuth } from '@/contexts/AuthContext';

interface ContractorBusiness {
  id: string;
  business_name: string;
  description: string;
  city: string;
  province: string;
  rating: number;
  review_count: number;
}

const HomeownerDashboard = () => {
  const { user } = useAuth();
  const [contractors, setContractors] = useState<ContractorBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    checkFirstTimeUser();
    fetchContractors();
  }, [user]);

  const checkFirstTimeUser = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      // Check if user was created recently (within last 5 minutes)
      const createdAt = new Date(data.created_at);
      const now = new Date();
      const timeDiff = now.getTime() - createdAt.getTime();
      const minutesDiff = timeDiff / (1000 * 60);
      
      if (minutesDiff <= 5) {
        setIsFirstTime(true);
        setShowWelcome(true);
      }
    } catch (error) {
      console.error('Error checking first time user:', error);
    }
  };

  const fetchContractors = async () => {
    try {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showWelcome && isFirstTime) {
    return (
      <HomeownerWelcome 
        onComplete={() => setShowWelcome(false)}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Find Contractors</h2>
          <p className="text-muted-foreground">Discover trusted professionals for your home projects</p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/search">
            <Search className="h-4 w-4" />
            Advanced Search
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contractors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contractors.length}</div>
            <p className="text-xs text-muted-foreground">
              Available in your area
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contractors.length > 0 
                ? (contractors.reduce((acc, c) => acc + c.rating, 0) / contractors.length).toFixed(1)
                : '0'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Quality professionals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
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
            <CardTitle className="text-sm font-medium">New This Week</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Recently joined
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Find what you need quickly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <Link to="/search">
                <Search className="h-4 w-4" />
                Search All Contractors
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <Link to="/services/plumbing">
                Find Plumbers
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <Link to="/services/electrical">
                Find Electricians
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <Link to="/services/roofing">
                Find Roofers
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Rated Contractors</CardTitle>
                <CardDescription>Highly recommended professionals</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/search" className="gap-1">
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contractors.slice(0, 3).map((contractor) => (
                <div key={contractor.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <Link 
                      to={`/contractor/${contractor.id}`}
                      className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {contractor.business_name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {contractor.city}, {contractor.province}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{contractor.rating}</span>
                    <span className="text-sm text-muted-foreground">
                      ({contractor.review_count})
                    </span>
                  </div>
                </div>
              ))}
              {contractors.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No contractors available yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomeownerDashboard;