import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Star, Search, Filter, Building2, Phone, Mail, Globe } from 'lucide-react';
import SearchHeader from '@/components/SearchHeader';
import GoogleVerificationBadge from '@/components/GoogleVerificationBadge';

interface Service {
  id: number;
  name: string;
  description: string;
}

interface ContractorBusiness {
  id: string;
  business_name: string;
  description: string;
  service_area: string;
  founded_year: number;
  verified: boolean;
}

const SearchContractors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [contractors, setContractors] = useState<ContractorBusiness[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedService, setSelectedService] = useState(searchParams.get('service') || 'all');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'all');

  useEffect(() => {
    fetchData();
  }, [searchTerm, selectedService, selectedCity]);

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedService !== 'all') params.set('service', selectedService);
    if (selectedCity !== 'all') params.set('city', selectedCity);
    setSearchParams(params, { replace: true });
  }, [searchTerm, selectedService, selectedCity, setSearchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .order('name');
      setServices(servicesData || []);

      // Fetch contractors with basic filtering
      let query = supabase
        .from('contractor_profiles')
        .select(`
          id,
          business_name,
          description,
          service_area,
          founded_year,
          verified
        `)
        .eq('verified', true);

      if (searchTerm) {
        query = query.or(`business_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (selectedCity !== 'all') {
        query = query.ilike('service_area', `%${selectedCity}%`);
      }

      const { data: contractorsData } = await query
        .order('created_at', { ascending: false })
        .limit(50);

      setContractors(contractorsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="min-h-screen bg-background">
      <SearchHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find Contractors
            </CardTitle>
            <CardDescription>
              Search for verified contractors in your area
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Input
                    placeholder="Search contractors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id.toString()}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="City" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      <SelectItem value="Toronto">Toronto</SelectItem>
                      <SelectItem value="Vancouver">Vancouver</SelectItem>
                      <SelectItem value="Calgary">Calgary</SelectItem>
                      <SelectItem value="Ottawa">Ottawa</SelectItem>
                      <SelectItem value="Montreal">Montreal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                Search Results ({contractors.length})
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                Active filters: {[searchTerm, selectedService !== 'all' && 'Service', selectedCity !== 'all' && 'City'].filter(Boolean).join(', ') || 'None'}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {contractors.map((contractor) => (
                <Card key={contractor.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="" alt={contractor.business_name} />
                          <AvatarFallback>
                            <Building2 className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{contractor.business_name}</CardTitle>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {contractor.service_area || 'Service area available'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <GoogleVerificationBadge 
                        isVerified={contractor.verified}
                        verificationDate=""
                        size="sm"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {contractor.description || 'Professional contractor services available.'}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {contractor.founded_year && (
                          <Badge variant="secondary">
                            Since {contractor.founded_year}
                          </Badge>
                        )}
                      </div>
                      <Button asChild size="sm">
                        <Link to={`/contractor/${contractor.id}`}>
                          View Profile
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {contractors.length === 0 && !loading && (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No contractors found</h3>
                    <p>Try adjusting your search criteria or location.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchContractors;