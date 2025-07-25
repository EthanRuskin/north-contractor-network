import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Search, MapPin, Star, Phone, Mail, Globe, Filter, SlidersHorizontal, Award, Building2, ChevronLeft, ChevronRight, Send, Navigation, Target, Clock, CheckSquare } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useToast } from '@/hooks/use-toast';
import SearchHeader from '@/components/SearchHeader';
import CallToAction from '@/components/CallToAction';
import Footer from '@/components/Footer';
import canadaMapSubtle from '@/assets/canada-map-subtle.png';
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
  gallery_images?: string[];
  service_ids?: string[];
  service_names?: string[];
  base_ranking_score?: number;
  search_ranking_score?: number;
  latitude?: number;
  longitude?: number;
  distance_km?: number;
}
interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
}
const SearchContractors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const autocompleteRef = useRef<HTMLInputElement>(null);
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

  // Location-based search state
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationQuery, setLocationQuery] = useState('');
  const [radius, setRadius] = useState([parseInt(searchParams.get('radius') || '30')]);
  const [isUsingLocation, setIsUsingLocation] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  // New filter states
  const [showOpenOnly, setShowOpenOnly] = useState(searchParams.get('openOnly') === 'true');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
    searchParams.get('features')?.split(',').filter(Boolean) || []
  );
  useEffect(() => {
    fetchServicesAndContractors();
  }, []);
  useEffect(() => {
    updateSearchParams();
  }, [searchTerm, selectedService, selectedCity, selectedProvince, minRating, minExperience, sortBy, radius, showOpenOnly, selectedFeatures]);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    const initAutocomplete = async () => {
      if (!autocompleteRef.current) return;
      try {
        // Get Google Maps API key from edge function
        const {
          data: keyData
        } = await supabase.functions.invoke('get-google-maps-key');
        const apiKey = keyData?.apiKey;
        if (!apiKey) {
          console.warn('Google Maps API key not available');
          return;
        }

        // Load Google Maps API if not already loaded
        if (!window.google) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
          script.async = true;
          script.defer = true;
          script.onload = setupAutocomplete;
          document.head.appendChild(script);
        } else {
          setupAutocomplete();
        }
      } catch (error) {
        console.error('Failed to load Google Maps API:', error);
      }
    };
    const setupAutocomplete = () => {
      if (!window.google || !autocompleteRef.current) return;
      const autocomplete = new window.google.maps.places.Autocomplete(autocompleteRef.current, {
        types: ['geocode'],
        componentRestrictions: {
          country: 'ca'
        } // Restrict to Canada
      });
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          const location: UserLocation = {
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
            address: place.formatted_address
          };
          setUserLocation(location);
          setLocationQuery(place.formatted_address || '');
          setIsUsingLocation(true);
        }
      });
    };
    initAutocomplete();
  }, []);
  const updateSearchParams = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedService) params.set('service', selectedService);
    if (selectedCity) params.set('city', selectedCity);
    if (selectedProvince) params.set('province', selectedProvince);
    if (minRating[0] > 0) params.set('minRating', minRating[0].toString());
    if (minExperience[0] > 0) params.set('minExperience', minExperience[0].toString());
    if (sortBy !== 'rating') params.set('sortBy', sortBy);
    if (radius[0] !== 30) params.set('radius', radius[0].toString());
    if (showOpenOnly) params.set('openOnly', 'true');
    if (selectedFeatures.length > 0) params.set('features', selectedFeatures.join(','));
    setSearchParams(params);
  };

  // Get user's current location
  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const location: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setUserLocation(location);
        setIsUsingLocation(true);
        setLocationQuery('Current Location');
        setGettingLocation(false);

        // Reverse geocode to get address
        if (window.google) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({
            location: {
              lat: location.latitude,
              lng: location.longitude
            }
          }, (results, status) => {
            if (status === 'OK' && results[0]) {
              setLocationQuery(results[0].formatted_address);
              setUserLocation(prev => prev ? {
                ...prev,
                address: results[0].formatted_address
              } : null);
            }
          });
        }
      }, error => {
        setGettingLocation(false);
        toast({
          title: "Location Error",
          description: "Unable to get your current location. Please enter an address manually.",
          variant: "destructive"
        });
      });
    } else {
      setGettingLocation(false);
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation. Please enter an address manually.",
        variant: "destructive"
      });
    }
  };
  useEffect(() => {
    fetchServicesAndContractors();
  }, []);
  const handleSearch = () => {
    if (searchTerm.trim()) {
      searchContractors();
    } else {
      fetchServicesAndContractors();
    }
  };
  const searchContractors = async () => {
    setLoading(true);
    try {
      // Fetch services first
      const {
        data: servicesData
      } = await supabase.from('services').select('*').order('name');
      setServices(servicesData || []);

      // Use location-based search if user location is available
      if (isUsingLocation && userLocation) {
        const {
          data: searchResults,
          error
        } = await supabase.rpc('search_contractors_with_location', {
          search_query: searchTerm || null,
          service_filter: selectedService && selectedService !== 'all' ? selectedService : null,
          city_filter: !isUsingLocation && selectedCity && selectedCity !== 'all' ? selectedCity : null,
          province_filter: !isUsingLocation && selectedProvince && selectedProvince !== 'all' ? selectedProvince : null,
          min_rating_filter: minRating[0],
          min_experience_filter: minExperience[0],
          user_latitude: userLocation.latitude,
          user_longitude: userLocation.longitude,
          radius_km: radius[0]
        });
        if (error) {
          console.warn('Location-based search failed:', error.message);
          await fallbackSearch();
          return;
        }
        setContractors(searchResults || []);
      } else {
        await fallbackSearch();
      }
    } catch (error: any) {
      console.warn('Search failed, using fallback:', error.message);
      await fetchServicesAndContractors();
    } finally {
      setLoading(false);
    }
  };
  const fallbackSearch = async () => {
    const {
      data: searchResults,
      error
    } = await supabase.rpc('search_contractors_with_ranking', {
      search_query: searchTerm || null,
      service_filter: selectedService && selectedService !== 'all' ? selectedService : null,
      city_filter: selectedCity && selectedCity !== 'all' ? selectedCity : null,
      province_filter: selectedProvince && selectedProvince !== 'all' ? selectedProvince : null,
      min_rating_filter: minRating[0],
      min_experience_filter: minExperience[0]
    });
    if (error) {
      console.warn('Fallback search failed:', error.message);
      await fetchServicesAndContractors();
      return;
    }
    setContractors(searchResults || []);
  };
  const fetchServicesAndContractors = async () => {
    try {
      // Fetch services
      const {
        data: servicesData
      } = await supabase.from('services').select('*').order('name');
      setServices(servicesData || []);

      // Use the secure search function instead of the removed view
      const {
        data: contractorsData,
        error
      } = await supabase.rpc('search_contractors_with_ranking', {
        search_query: null,
        service_filter: null,
        city_filter: null,
        province_filter: null,
        min_rating_filter: 0,
        min_experience_filter: 0
      });
      if (error) throw error;
      setContractors(contractorsData || []);
    } catch (error: any) {
      toast({
        title: "Error loading contractors",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const filteredAndSortedContractors = contractors.filter(contractor => {
    const matchesSearch = !searchTerm || contractor.business_name.toLowerCase().includes(searchTerm.toLowerCase()) || contractor.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = !selectedService || selectedService === 'all' || contractor.service_names?.some(serviceName => serviceName === services.find(s => s.id === selectedService)?.name);
    const matchesCity = !selectedCity || selectedCity === 'all' || contractor.city?.toLowerCase().includes(selectedCity.toLowerCase());
    const matchesProvince = !selectedProvince || selectedProvince === 'all' || contractor.province?.toLowerCase().includes(selectedProvince.toLowerCase());
    const matchesRating = contractor.rating >= minRating[0];
    const matchesExperience = contractor.years_experience >= minExperience[0];
    return matchesSearch && matchesService && matchesCity && matchesProvince && matchesRating && matchesExperience;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'relevance':
        // Sort by search ranking score when available, fallback to base ranking
        const scoreA = a.search_ranking_score || a.base_ranking_score || 0;
        const scoreB = b.search_ranking_score || b.base_ranking_score || 0;
        return scoreB - scoreA;
      case 'name':
        return a.business_name.localeCompare(b.business_name);
      case 'rating':
        return b.rating - a.rating;
      case 'experience':
        return b.years_experience - a.years_experience;
      case 'reviews':
        return b.review_count - a.review_count;
      default:
        return (b.search_ranking_score || b.base_ranking_score || 0) - (a.search_ranking_score || a.base_ranking_score || 0);
    }
  });
  const uniqueCities = Array.from(new Set(contractors.map(c => c.city).filter(Boolean)));
  const uniqueProvinces = Array.from(new Set(contractors.map(c => c.province).filter(Boolean)));
  // Available features/amenities
  const availableFeatures = [
    'Licensed & Insured',
    'Emergency Services',
    'Free Estimates',
    'Warranty Provided',
    'Eco-Friendly',
    'Senior Discount',
    'Military Discount',
    '24/7 Available'
  ];

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedService('all');
    setSelectedCity('all');
    setSelectedProvince('all');
    setMinRating([0]);
    setMinExperience([0]);
    setSortBy('rating');
    setRadius([30]);
    setUserLocation(null);
    setLocationQuery('');
    setIsUsingLocation(false);
    setShowOpenOnly(false);
    setSelectedFeatures([]);
  };
  if (loading) {
    return <div className="min-h-screen bg-background">
        <SearchHeader />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background relative">
      {/* Canadian Map Background */}
      <div className="fixed inset-0 opacity-5 bg-no-repeat bg-center bg-contain pointer-events-none z-0" style={{
      backgroundImage: `url(${canadaMapSubtle})`,
      backgroundSize: '80%'
    }}></div>
      
      <div className="relative z-10">
        <SearchHeader searchTerm={searchTerm} locationQuery={locationQuery} onSearchChange={setSearchTerm} onLocationChange={setLocationQuery} onSearch={handleSearch} autocompleteRef={autocompleteRef} />
        
        <div className="container mx-auto px-4 py-8">

          <div className="grid gap-6 lg:gap-8 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 order-1">
            <Card className="lg:sticky lg:top-4">
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
                

                {/* Service */}
                

                {/* Location */}
                <div className="space-y-4">
                  

                  {/* Fallback city/province selectors */}
                  {!isUsingLocation && <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">City</label>
                        <Select value={selectedCity} onValueChange={setSelectedCity}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Cities" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Cities</SelectItem>
                            {uniqueCities.map(city => <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>)}
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
                            {uniqueProvinces.map(province => <SelectItem key={province} value={province}>
                                {province}
                              </SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </>}
                </div>

                {/* Rating */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Minimum Rating: {minRating[0].toFixed(1)}★
                  </label>
                  <Slider value={minRating} onValueChange={setMinRating} max={5} min={0} step={0.5} className="w-full" />
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Minimum Experience: {minExperience[0]} years
                  </label>
                  <Slider value={minExperience} onValueChange={setMinExperience} max={30} min={0} step={1} className="w-full" />
                </div>

                {/* Open/Closed Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Business Hours
                  </label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="open-only"
                      checked={showOpenOnly}
                      onCheckedChange={setShowOpenOnly}
                    />
                    <label htmlFor="open-only" className="text-sm">
                      Show only open businesses
                    </label>
                  </div>
                </div>

                {/* Features Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Features & Services
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {availableFeatures.map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <Checkbox
                          id={feature}
                          checked={selectedFeatures.includes(feature)}
                          onCheckedChange={() => toggleFeature(feature)}
                        />
                        <label
                          htmlFor={feature}
                          className="text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {feature}
                        </label>
                      </div>
                    ))}
                  </div>
                  {selectedFeatures.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedFeatures.map((feature) => (
                        <Badge
                          key={feature}
                          variant="secondary"
                          className="text-xs cursor-pointer"
                          onClick={() => toggleFeature(feature)}
                        >
                          {feature} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sort */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {searchTerm && <SelectItem value="relevance">🎯 Best Match</SelectItem>}
                      <SelectItem value="rating">⭐ Highest Rating</SelectItem>
                      <SelectItem value="reviews">💬 Most Reviews</SelectItem>
                      <SelectItem value="experience">🏆 Most Experience</SelectItem>
                      <SelectItem value="name">📝 Name A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 order-2">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-2">
              <h2 className="text-lg sm:text-xl font-semibold">
                {filteredAndSortedContractors.length} Contractors Found
              </h2>
            </div>

            {filteredAndSortedContractors.length === 0 ? <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No contractors found matching your criteria. Try adjusting your filters.
                  </p>
                </CardContent>
              </Card> : <div className="grid gap-4 sm:grid-cols-1">
                {filteredAndSortedContractors.map(contractor => <Card key={contractor.id} className="group hover:shadow-xl hover:scale-[1.01] transition-all duration-300 cursor-pointer border-l-4 border-l-primary/20 hover:border-l-primary bg-gradient-to-br from-card to-card/80 backdrop-blur-sm" onClick={() => navigate(`/contractor/${contractor.id}`)}>
                    {/* Mobile-First Layout */}
                    <div className="flex flex-col sm:flex-row h-full">
                      {/* Main Content */}
                      <div className="flex-1 flex flex-col">
                        {/* Header */}
                        <CardHeader className="pb-3">
                          <div className="flex items-start gap-3">
                            {/* Logo Section */}
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/10 flex items-center justify-center overflow-hidden group-hover:shadow-lg transition-shadow">
                                {contractor.logo_url ? <img src={contractor.logo_url} alt={`${contractor.business_name} logo`} className="w-full h-full object-cover" /> : <Building2 className="h-6 w-6 text-primary/60" />}
                              </div>
                            </div>
                            
                            {/* Header Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0 flex-1">
                                  <CardTitle className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                                    {contractor.business_name}
                                  </CardTitle>
                                   {contractor.city && contractor.province && <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                       <MapPin className="h-3 w-3 flex-shrink-0" />
                                       <span className="truncate">
                                         {contractor.city}, {contractor.province}
                                         {contractor.distance_km && <span className="ml-1 text-primary font-medium">
                                             • {contractor.distance_km.toFixed(1)} km away
                                           </span>}
                                       </span>
                                     </div>}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-3 flex-1">
                          {/* Description */}
                          {contractor.description && <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {contractor.description}
                            </p>}

                          {/* Services */}
                          <div className="flex flex-wrap gap-1">
                            {contractor.service_names?.slice(0, 2).map((serviceName, index) => <Badge key={index} variant="secondary" className="text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                                {serviceName}
                              </Badge>)}
                            {contractor.service_names && contractor.service_names.length > 2 && <Badge variant="outline" className="text-xs border-dashed">
                                +{contractor.service_names.length - 2} more
                              </Badge>}
                          </div>

                          {/* Footer */}
                          <div className="flex justify-between items-center pt-2 border-t border-border/50">
                            <div className="flex items-center gap-3">
                              {/* Experience */}
                              {contractor.years_experience > 0 && <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Award className="h-3 w-3" />
                                  <span className="font-medium">{contractor.years_experience}y exp</span>
                                </div>}
                              
                              {/* Rating Badge - moved here under experience */}
                              {contractor.rating > 0 && <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 px-2 py-1 rounded-full border border-yellow-200 dark:border-yellow-800">
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                    <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">
                                      {contractor.rating.toFixed(1)}
                                    </span>
                                    <span className="text-xs text-yellow-600 dark:text-yellow-400">
                                      ({contractor.review_count})
                                    </span>
                                  </div>
                                </div>}
                            </div>
                            
                            {/* Contact Icons */}
                            <div className="flex gap-2">
                              {contractor.phone && <div className="p-1.5 rounded-md bg-primary/5 hover:bg-primary/10 transition-colors">
                                  <Phone className="h-3 w-3 text-primary" />
                                </div>}
                              {contractor.email && <div className="p-1.5 rounded-md bg-primary/5 hover:bg-primary/10 transition-colors">
                                  <Mail className="h-3 w-3 text-primary" />
                                </div>}
                              {contractor.website && <div className="p-1.5 rounded-md bg-primary/5 hover:bg-primary/10 transition-colors">
                                  <Globe className="h-3 w-3 text-primary" />
                                </div>}
                            </div>
                          </div>
                        </CardContent>
                      </div>

                      {/* Image Gallery Section - Hide on mobile, show on larger screens */}
                      <div className="hidden sm:flex w-48 flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex-1 p-3">
                          {contractor.gallery_images && contractor.gallery_images.length > 0 ? <Carousel className="w-full h-full">
                              <CarouselContent>
                                {contractor.gallery_images.map((image, index) => <CarouselItem key={index}>
                                    <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                                      <img src={image} alt={`${contractor.business_name} gallery ${index + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                  </CarouselItem>)}
                              </CarouselContent>
                              {contractor.gallery_images.length > 1 && <>
                                  <CarouselPrevious className="absolute left-1 top-1/2 -translate-y-1/2 h-6 w-6 bg-background/80 hover:bg-background border-border" />
                                  <CarouselNext className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 bg-background/80 hover:bg-background border-border" />
                                </>}
                            </Carousel> : <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                              <div className="text-center text-muted-foreground">
                                <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-xs">No images</p>
                              </div>
                            </div>}
                        </div>
                        
                        {/* Send Message Button */}
                        {contractor.email && <div className="p-3 pt-0">
                            <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => window.open(`mailto:${contractor.email}?subject=Inquiry about ${contractor.business_name} services`, '_blank')}>
                              <Send className="h-3 w-3 mr-1" />
                              Message
                            </Button>
                          </div>}
                      </div>

                      {/* Mobile Image Gallery - Show on mobile only */}
                      <div className="sm:hidden" onClick={e => e.stopPropagation()}>
                        <CardContent className="pt-0 pb-3">
                          <h4 className="text-sm font-medium text-foreground mb-2">Portfolio Images</h4>
                          {contractor.gallery_images && contractor.gallery_images.length > 0 ? <div className="grid grid-cols-2 gap-2">
                              {contractor.gallery_images.slice(0, 4).map((image, index) => <img key={index} src={image} alt={`${contractor.business_name} work ${index + 1}`} className="w-full h-20 object-cover rounded-md" />)}
                            </div> : <p className="text-muted-foreground text-sm italic">No images</p>}
                          
                          {/* Mobile Message Button */}
                          {contractor.email && <Button variant="outline" size="sm" className="w-full mt-3 text-sm" onClick={() => window.open(`mailto:${contractor.email}?subject=Inquiry about ${contractor.business_name} services`, '_blank')}>
                              <Send className="h-4 w-4 mr-2" />
                              Send Message
                            </Button>}
                        </CardContent>
                      </div>
                    </div>
                  </Card>)}
              </div>}
          </div>
        </div>
        </div>
        
        {/* CTA Section */}
        <CallToAction />
        
        {/* Footer */}
        <Footer />
      </div>
    </div>;
};
export default SearchContractors;