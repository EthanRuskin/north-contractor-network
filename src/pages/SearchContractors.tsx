import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, MapPin, Star, Phone, Mail, Globe, Filter, SlidersHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

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

const SearchContractors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [contractors, setContractors] = useState<ContractorBusiness[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedService, setSelectedService] = useState(searchParams.get('service') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  const [selectedProvince, setSelectedProvince] = useState(searchParams.get('province') || '');
  const [minRating, setMinRating] = useState([parseFloat(searchParams.get('minRating') || '0')]);
  const [minExperience, setMinExperience] = useState([parseInt(searchParams.get('minExperience') || '0')]);
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'rating');

  useEffect(() => {
    fetchServicesAndContractors();
  }, []);

  useEffect(() => {
    updateSearchParams();
  }, [searchTerm, selectedService, selectedCity, selectedProvince, minRating, minExperience, sortBy]);

  const updateSearchParams = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedService) params.set('service', selectedService);
    if (selectedCity) params.set('city', selectedCity);
    if (selectedProvince) params.set('province', selectedProvince);
    if (minRating[0] > 0) params.set('minRating', minRating[0].toString());
    if (minExperience[0] > 0) params.set('minExperience', minExperience[0].toString());
    if (sortBy !== 'rating') params.set('sortBy', sortBy);
    setSearchParams(params);
  };

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
        .eq('status', 'approved');

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

  const filteredAndSortedContractors = contractors
    .filter(contractor => {
      const matchesSearch = contractor.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contractor.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesService = !selectedService || selectedService === 'all' || 
                            contractor.contractor_services.some(cs => 
                              cs.services.name === services.find(s => s.id === selectedService)?.name
                            );
      
      const matchesCity = !selectedCity || selectedCity === 'all' || 
                         contractor.city?.toLowerCase().includes(selectedCity.toLowerCase());
      
      const matchesProvince = !selectedProvince || selectedProvince === 'all' || 
                             contractor.province?.toLowerCase().includes(selectedProvince.toLowerCase());

      const matchesRating = contractor.rating >= minRating[0];
      const matchesExperience = contractor.years_experience >= minExperience[0];

      return matchesSearch && matchesService && matchesCity && matchesProvince && matchesRating && matchesExperience;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.business_name.localeCompare(b.business_name);
        case 'rating':
          return b.rating - a.rating;
        case 'experience':
          return b.years_experience - a.years_experience;
        case 'reviews':
          return b.review_count - a.review_count;
        default:
          return b.rating - a.rating;
      }
    });

  const uniqueCities = Array.from(new Set(contractors.map(c => c.city).filter(Boolean)));
  const uniqueProvinces = Array.from(new Set(contractors.map(c => c.province).filter(Boolean)));

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedService('all');
    setSelectedCity('all');
    setSelectedProvince('all');
    setMinRating([0]);
    setMinExperience([0]);
    setSortBy('rating');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Find Contractors</h1>
          <p className="text-muted-foreground">Discover trusted contractors in your area</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <Input
                    placeholder="Business name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Service */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Service</label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Services" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      {services.map(service => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">City</label>
                    <Select value={selectedCity} onValueChange={setSelectedCity}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Cities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cities</SelectItem>
                        {uniqueCities.map(city => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Province</label>
                    <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Provinces" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Provinces</SelectItem>
                        {uniqueProvinces.map(province => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Rating */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Minimum Rating: {minRating[0].toFixed(1)}★
                  </label>
                  <Slider
                    value={minRating}
                    onValueChange={setMinRating}
                    max={5}
                    min={0}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Minimum Experience: {minExperience[0]} years
                  </label>
                  <Slider
                    value={minExperience}
                    onValueChange={setMinExperience}
                    max={30}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Sort */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Highest Rating</SelectItem>
                      <SelectItem value="reviews">Most Reviews</SelectItem>
                      <SelectItem value="experience">Most Experience</SelectItem>
                      <SelectItem value="name">Name A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {filteredAndSortedContractors.length} Contractors Found
              </h2>
            </div>

            {filteredAndSortedContractors.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No contractors found matching your criteria. Try adjusting your filters.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredAndSortedContractors.map(contractor => (
                  <Card 
                    key={contractor.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/contractor/${contractor.id}`)}
                  >
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

                      <div className="flex justify-between items-center">
                        {contractor.years_experience > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {contractor.years_experience} years experience
                          </p>
                        )}
                        <div className="flex gap-2">
                          {contractor.phone && (
                            <Phone className="h-4 w-4 text-muted-foreground" />
                          )}
                          {contractor.email && (
                            <Mail className="h-4 w-4 text-muted-foreground" />
                          )}
                          {contractor.website && (
                            <Globe className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchContractors;