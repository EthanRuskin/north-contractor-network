import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-contractor.jpg";
import canadaFlagOutline from "@/assets/canada-flag-outline.png";
const Hero = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) {
      params.set('search', searchTerm);
    }
    if (location.trim()) {
      params.set('city', location);
    }
    navigate(`/search${params.toString() ? '?' + params.toString() : ''}`);
  };
  return <section className="relative bg-hero-gradient text-primary-foreground overflow-hidden">
      <div className="absolute inset-0" style={{
      backgroundColor: '#A4161A'
    }}></div>
      <div className="absolute inset-0 bg-no-repeat bg-center bg-cover opacity-10 pointer-events-none" style={{
      backgroundImage: `url(${canadaFlagOutline})`,
      backgroundSize: '60%'
    }}></div>
      <div className="relative container mx-auto px-4 py-20 lg:py-32">
        <div className="flex justify-start">
          <div className="space-y-8 animate-fade-in mx-0 max-w-4xl">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              Find Trusted Local Contractors
            </h1>
            <p className="text-xl text-primary-foreground/90">
              Connect with pre-screened professionals for your home improvement and repair needs.
            </p>
            
            <div className="bg-background/95 p-4 sm:p-6 rounded-xl shadow-elegant space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">
                What do you need help with?
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input placeholder="e.g., Plumbing, Electrical, Carpentry" className="pl-10 h-12 text-foreground" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch()} />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input placeholder="Enter your location" className="pl-10 h-12 text-foreground" value={location} onChange={e => setLocation(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch()} />
                </div>
                <Button variant="destructive" size="lg" className="h-12 px-8" onClick={handleSearch}>
                  Search
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 sm:gap-4 text-sm">
              <span className="text-primary-foreground/80 hidden sm:inline">Popular:</span>
              {["Plumbing", "Electrical", "Roofing", "HVAC", "Painting"].map(service => <button key={service} className="bg-white/20 hover:bg-white/30 px-2 sm:px-3 py-1 rounded-full transition-colors text-xs sm:text-sm">
                  {service}
                </button>)}
            </div>
          </div>
          
          
        </div>
      </div>
    </section>;
};
export default Hero;