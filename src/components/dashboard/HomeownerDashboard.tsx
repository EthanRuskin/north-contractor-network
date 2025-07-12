import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Star, Phone, Mail, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Service {
  id: string;
  name: string;
}

interface ContractorBusiness {
  id: string;
  business_name: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  city: string;
  province: string;
  years_experience: number;
  rating: number;
  review_count: number;
  contractor_services: {
    services: {
      name: string;
    };
  }[];
}

const HomeownerDashboard = () => {
  const { toast } = useToast();
  const [contractors, setContractors] = useState<ContractorBusiness[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  useEffect(() => {
    fetchServicesAndContractors();
  }, []);

  const fetchServicesAndContractors = async () => {
    try {
      // Fetch services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .order('name');

      setServices(servicesData || []);

      // Fetch approved contractors with their services
      const { data: contractorsData, error } = await supabase
        .from('contractor_businesses')
        .select(`
          *,
          contractor_services (
            services (
              name
            )
          )
        `)
        .eq('status', 'approved')
        .order('rating', { ascending: false });

      if (error) throw error;
      setContractors(contractorsData || []);
    } catch (error: any) {
      toast({
        title: "Error loading contractors",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredContractors = contractors.filter(contractor => {
    const matchesSearch = contractor.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contractor.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesService = !selectedService || 
                          contractor.contractor_services.some(cs => 
                            cs.services.name === services.find(s => s.id === selectedService)?.name
                          );
    
    const matchesCity = !selectedCity || 
                       contractor.city?.toLowerCase().includes(selectedCity.toLowerCase());

    return matchesSearch && matchesService && matchesCity;
  });

  const uniqueCities = Array.from(new Set(contractors.map(c => c.city).filter(Boolean)));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Find Contractors</h2>
        <p className="text-muted-foreground">Discover trusted contractors in your area</p>
      </div>

      {/* Search and Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Contractors
          </CardTitle>
          <CardDescription>
            Filter contractors by service type, location, or search by name
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Input
                placeholder="Search by business name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Services</SelectItem>
                  {services.map(service => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Cities</SelectItem>
                  {uniqueCities.map(city => (
                    <SelectItem key={city} value={city || ''}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">
            {filteredContractors.length} Contractors Found
          </h3>
        </div>

        {filteredContractors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No contractors found matching your criteria. Try adjusting your search filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredContractors.map(contractor => (
              <Card key={contractor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{contractor.business_name}</CardTitle>
                      {contractor.city && contractor.province && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          {contractor.city}, {contractor.province}
                        </div>
                      )}
                    </div>
                    {contractor.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{contractor.rating.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">
                          ({contractor.review_count})
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contractor.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {contractor.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1">
                    {contractor.contractor_services.slice(0, 3).map((cs, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {cs.services.name}
                      </Badge>
                    ))}
                    {contractor.contractor_services.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{contractor.contractor_services.length - 3} more
                      </Badge>
                    )}
                  </div>

                  {contractor.years_experience > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {contractor.years_experience} years of experience
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {contractor.phone && (
                      <Button size="sm" variant="outline" className="gap-1 text-xs">
                        <Phone className="h-3 w-3" />
                        Call
                      </Button>
                    )}
                    {contractor.email && (
                      <Button size="sm" variant="outline" className="gap-1 text-xs">
                        <Mail className="h-3 w-3" />
                        Email
                      </Button>
                    )}
                    {contractor.website && (
                      <Button size="sm" variant="outline" className="gap-1 text-xs">
                        <Globe className="h-3 w-3" />
                        Website
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeownerDashboard;