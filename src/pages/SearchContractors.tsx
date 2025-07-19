import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, MapPin, Star, Phone, Mail, Globe, Filter, SlidersHorizontal, Award, Building2 } from 'lucide-react';
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
  logo_url?: string;
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
                    className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border-l-4 border-l-primary/20 hover:border-l-primary bg-gradient-to-br from-card to-card/80 backdrop-blur-sm"
                    onClick={() => navigate(`/contractor/${contractor.id}`)}
                  >
                    {/* Header with Logo */}
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-4">
                        {/* Logo Section */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/10 flex items-center justify-center overflow-hidden group-hover:shadow-lg transition-shadow">
                            {contractor.logo_url ? (
                              <img 
                                src={contractor.logo_url} 
                                alt={`${contractor.business_name} logo`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Building2 className="h-8 w-8 text-primary/60" />
                            )}
                          </div>
                        </div>
                        
                        {/* Header Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0 flex-1">
                              <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                {contractor.business_name}
                              </CardTitle>
                              {contractor.city && contractor.province && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                  <MapPin className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{contractor.city}, {contractor.province}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Rating Badge */}
                            {contractor.rating > 0 && (
                              <div className="flex-shrink-0 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 px-3 py-1.5 rounded-full border border-yellow-200 dark:border-yellow-800">
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                  <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                                    {contractor.rating.toFixed(1)}
                                  </span>
                                  <span className="text-xs text-yellow-600 dark:text-yellow-400">
                                    ({contractor.review_count})
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Description */}
                      {contractor.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {contractor.description}
                        </p>
                      )}

                      {/* Services */}
                      <div className="flex flex-wrap gap-1.5">
                        {contractor.contractor_services.slice(0, 3).map((cs, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            {cs.services.name}
                          </Badge>
                        ))}
                        {contractor.contractor_services.length > 3 && (
                          <Badge variant="outline" className="text-xs border-dashed">
                            +{contractor.contractor_services.length - 3} more
                          </Badge>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex justify-between items-center pt-2 border-t border-border/50">
                        {/* Experience */}
                        {contractor.years_experience > 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Award className="h-3 w-3" />
                            <span className="font-medium">{contractor.years_experience} years experience</span>
                          </div>
                        )}
                        
                        {/* Contact Icons */}
                        <div className="flex gap-2">
                          {contractor.phone && (
                            <div className="p-1.5 rounded-md bg-primary/5 hover:bg-primary/10 transition-colors">
                              <Phone className="h-3 w-3 text-primary" />
                            </div>
                          )}
                          {contractor.email && (
                            <div className="p-1.5 rounded-md bg-primary/5 hover:bg-primary/10 transition-colors">
                              <Mail className="h-3 w-3 text-primary" />
                            </div>
                          )}
                          {contractor.website && (
                            <div className="p-1.5 rounded-md bg-primary/5 hover:bg-primary/10 transition-colors">
                              <Globe className="h-3 w-3 text-primary" />
                            </div>
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