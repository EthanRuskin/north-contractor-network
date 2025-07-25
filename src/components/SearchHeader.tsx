import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, X, User, MapPin, ChevronDown } from "lucide-react";
import { useGooglePlaces } from "@/hooks/useGooglePlaces";
import { supabase } from "@/integrations/supabase/client";
interface SearchHeaderProps {
  searchTerm?: string;
  locationQuery?: string;
  onSearchChange?: (value: string) => void;
  onLocationChange?: (value: string) => void;
  onSearch?: () => void;
  autocompleteRef?: React.RefObject<HTMLInputElement>;
}
const SearchHeader = ({
  searchTerm = "",
  locationQuery = "",
  onSearchChange,
  onLocationChange,
  onSearch,
  autocompleteRef
}: SearchHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    user,
    signOut
  } = useAuth();
  const navigate = useNavigate();

  // Common Canadian cities for quick selection
  const commonCities = [
    "Toronto, ON",
    "Vancouver, BC", 
    "Montreal, QC",
    "Calgary, AB",
    "Ottawa, ON",
    "Edmonton, AB",
    "Mississauga, ON",
    "Winnipeg, MB"
  ];

  // Google Places integration
  const googlePlacesRef = useGooglePlaces({
    onPlaceSelect: (place) => {
      if (place.formatted_address && onLocationChange) {
        onLocationChange(place.formatted_address);
      }
    },
    country: 'ca', // Restrict to Canada
    types: ['geocode']
  });

  // Use the external ref if provided, otherwise use our internal ref
  const locationInputRef = autocompleteRef || googlePlacesRef;

  // Handle geolocation
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Reverse geocode to get address
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${await getGoogleMapsKey()}`
            );
            const data = await response.json();
            if (data.results && data.results[0]) {
              const address = data.results[0].formatted_address;
              onLocationChange?.(address);
            }
          } catch (error) {
            console.error('Error reverse geocoding:', error);
            onLocationChange?.(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
          setShowLocationDropdown(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enter manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const getGoogleMapsKey = async () => {
    try {
      const { data } = await supabase.functions.invoke('get-google-maps-key');
      return data?.apiKey || '';
    } catch {
      return '';
    }
  };

  const handleCitySelect = (city: string) => {
    onLocationChange?.(city);
    setShowLocationDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = () => {
    if (onSearch) {
      onSearch();
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  return <header className="bg-primary shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-[17px] py-[21px]">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img src="/lovable-uploads/4eac4151-bd18-49d2-8c36-86fdd4488e08.png" alt="Northern Contractor Network" className="h-8 sm:h-10 w-auto max-w-[200px] object-contain" />
          </Link>
          
          {/* Search Inputs - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4">
            <div className="flex w-full bg-white rounded-lg overflow-hidden shadow-sm">
              <Input placeholder="What service do you need?" value={searchTerm} onChange={e => onSearchChange?.(e.target.value)} onKeyDown={handleKeyDown} className="border-0 focus:ring-0 focus:outline-none h-12 text-base rounded-none flex-1" />
              <div className="w-px bg-border"></div>
              <div className="relative flex-1" ref={dropdownRef}>
                <div className="relative">
                  <Input 
                    ref={locationInputRef} 
                    placeholder="Where? (City, Province)" 
                    value={locationQuery} 
                    onChange={e => onLocationChange?.(e.target.value)} 
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowLocationDropdown(true)}
                    className="border-0 focus:ring-0 focus:outline-none h-12 text-base rounded-none pr-8" 
                  />
                  <Button
                    type="button"
                    onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                    className="absolute right-0 top-0 h-12 w-8 p-0 border-0 bg-transparent hover:bg-gray-100 text-gray-500"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                
                {showLocationDropdown && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    <div className="py-2">
                      <button
                        onClick={handleUseCurrentLocation}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm"
                      >
                        <MapPin className="h-4 w-4 text-blue-500" />
                        Use my current location
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      {commonCities.map((city) => (
                        <button
                          key={city}
                          onClick={() => handleCitySelect(city)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Button onClick={handleSearch} size="sm" className="h-12 px-6 rounded-none bg-primary-dark hover:bg-primary text-white">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* User Menu */}
          <nav className="hidden lg:flex items-center space-x-4">
            {user ? <div className="flex items-center gap-2">
                <Button onClick={() => navigate('/dashboard')} variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <User className="h-4 w-4 mr-1" />
                  Dashboard
                </Button>
                <Button onClick={signOut} variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  Sign Out
                </Button>
              </div> : <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/10">
                  <Link to="/auth">Log in</Link>
                </Button>
                <Button variant="secondary" size="sm" asChild className="bg-white text-primary hover:bg-white/90">
                  <Link to="/auth">Join as Pro</Link>
                </Button>
              </div>}
          </nav>
          
          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Search - Show when menu is open */}
        {isMenuOpen && <div className="md:hidden mt-4 space-y-3">
            <div className="flex flex-col gap-2">
              <Input placeholder="What service do you need?" value={searchTerm} onChange={e => onSearchChange?.(e.target.value)} onKeyDown={handleKeyDown} className="bg-white h-12" />
              <Input ref={locationInputRef} placeholder="Where? (City, Province)" value={locationQuery} onChange={e => onLocationChange?.(e.target.value)} onKeyDown={handleKeyDown} className="bg-white h-12" />
              <Button onClick={handleSearch} className="h-12 bg-primary-dark hover:bg-primary text-white">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>}

        {/* Mobile Menu */}
        {isMenuOpen && <div className="lg:hidden mt-4 pb-4 border-t border-white/20">
            <nav className="mt-4 space-y-2">
              <Link to="/how-it-works" className="block px-2 py-2 text-white hover:bg-white/10 rounded transition-colors" onClick={() => setIsMenuOpen(false)}>
                How It Works
              </Link>
              <Link to="/industries" className="block px-2 py-2 text-white hover:bg-white/10 rounded transition-colors" onClick={() => setIsMenuOpen(false)}>
                Industries
              </Link>
              
              {user ? <div className="space-y-2 pt-2 border-t border-white/20">
                  <Button onClick={() => {
              navigate('/dashboard');
              setIsMenuOpen(false);
            }} variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button onClick={() => {
              signOut();
              setIsMenuOpen(false);
            }} variant="ghost" className="w-full justify-start text-white hover:bg-white/10">
                    Sign Out
                  </Button>
                </div> : <div className="space-y-2 pt-2 border-t border-white/20">
                  <Button variant="ghost" asChild className="w-full justify-start text-white hover:bg-white/10" onClick={() => setIsMenuOpen(false)}>
                    <Link to="/auth">Log in</Link>
                  </Button>
                  <Button variant="secondary" asChild className="w-full justify-start bg-white text-primary hover:bg-white/90" onClick={() => setIsMenuOpen(false)}>
                    <Link to="/auth">Join as Pro</Link>
                  </Button>
                </div>}
            </nav>
          </div>}
      </div>

      {/* Navigation Categories - Hidden on mobile, show on larger screens */}
      <div className="hidden md:block bg-primary-dark">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-center space-x-6 py-2 text-sm">
            <Link to="/service/plumbing" className="text-white hover:text-primary-light transition-colors">
              Plumbing
            </Link>
            <Link to="/service/electrical" className="text-white hover:text-primary-light transition-colors">
              Electrical
            </Link>
            <Link to="/service/roofing" className="text-white hover:text-primary-light transition-colors">
              Roofing
            </Link>
            <Link to="/service/hvac" className="text-white hover:text-primary-light transition-colors">
              HVAC
            </Link>
            <Link to="/service/landscaping" className="text-white hover:text-primary-light transition-colors">
              Landscaping
            </Link>
            <Link to="/how-it-works" className="text-white hover:text-primary-light transition-colors">
              How It Works
            </Link>
            <Link to="/industries" className="text-white hover:text-primary-light transition-colors">
              Industries
            </Link>
          </nav>
        </div>
      </div>
    </header>;
};
export default SearchHeader;