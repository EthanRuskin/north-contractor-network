import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Star, MapPin, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import GoogleVerificationBadge from "@/components/GoogleVerificationBadge";

interface ContractorBusiness {
  id: string;
  business_name: string;
  description: string;
  city: string;
  province: string;
  years_experience: number;
  rating: number;
  review_count: number;
  logo_url?: string;
  google_business_verified: boolean;
  google_verification_date: string;
  contractor_services: {
    services: {
      name: string;
    };
  }[];
}

const FeaturedContractors = () => {
  const [contractors, setContractors] = useState<ContractorBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedContractors();
  }, []);

  const fetchFeaturedContractors = async () => {
    try {
      const { data, error } = await supabase
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
        .order('rating', { ascending: false })
        .limit(6);

      if (error) throw error;
      setContractors(data || []);
    } catch (error) {
      console.error('Error fetching featured contractors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (contractorId: string) => {
    navigate(`/contractor/${contractorId}`);
  };

  const handleViewAll = () => {
    navigate('/search');
  };

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Top-Rated Contractors
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Meet some of our highest-rated professionals ready to help with your project
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Top-Rated Contractors
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Meet some of our highest-rated professionals ready to help with your project
          </p>
        </div>
        
        <Carousel className="w-full max-w-6xl mx-auto">
          <CarouselContent className="-ml-1">
            {contractors.slice(0, 8).map((contractor, index) => (
              <CarouselItem key={contractor.id} className="pl-1 basis-1/2 md:basis-1/3 lg:basis-1/4">
                <div 
                  className="bg-card rounded-lg p-4 shadow-card hover:shadow-card-hover transition-all duration-300 border group hover:border-primary/20 cursor-pointer h-full"
                  onClick={() => handleViewProfile(contractor.id)}
                >
                  <div className="text-center mb-3">
                    <Avatar className="w-12 h-12 mx-auto mb-2 ring-2 ring-primary/10 group-hover:ring-primary/20 transition-all">
                      <AvatarImage src={contractor.logo_url || ''} alt={contractor.business_name} />
                      <AvatarFallback className="text-sm bg-gradient-to-br from-primary/10 to-primary/5">
                        {contractor.logo_url ? (
                          contractor.business_name.slice(0, 2).toUpperCase()
                        ) : (
                          <Building2 className="h-5 w-5 text-primary/60" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <h3 className="text-sm font-semibold text-card-foreground truncate">
                        {contractor.business_name}
                      </h3>
                      <GoogleVerificationBadge 
                        isVerified={contractor.google_business_verified}
                        verificationDate={contractor.google_verification_date}
                        size="sm"
                        showTooltip={false}
                      />
                    </div>
                    
                    <p className="text-xs text-primary font-medium mb-1 truncate">
                      {contractor.contractor_services[0]?.services.name || 'General Services'}
                    </p>
                    
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">
                        {contractor.city && contractor.province 
                          ? `${contractor.city}, ${contractor.province}` 
                          : 'Location Available'
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {contractor.rating > 0 && (
                      <div className="flex items-center justify-center gap-1">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${i < Math.floor(contractor.rating) ? 'fill-current' : ''}`} 
                            />
                          ))}
                        </div>
                        <span className="text-xs font-semibold">{contractor.rating.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">({contractor.review_count})</span>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <span className="text-xs text-muted-foreground">{contractor.years_experience} yrs exp</span>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProfile(contractor.id);
                      }}
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        
        {contractors.length === 0 ? (
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">No contractors available at the moment.</p>
            <Button variant="outline" onClick={handleViewAll}>
              Join as a Contractor
            </Button>
          </div>
        ) : (
          <div className="text-center mt-12">
            <Button variant="default" size="lg" onClick={handleViewAll}>
              View All Contractors
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedContractors;