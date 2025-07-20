import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Phone, Mail, Building2 } from "lucide-react";
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
        
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {contractors.slice(0, 6).map((contractor, index) => (
            <div 
              key={contractor.id}
              className="bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border group hover:border-primary/20 cursor-pointer"
              style={{ animationDelay: `${index * 150}ms` }}
              onClick={() => handleViewProfile(contractor.id)}
            >
              <div className="text-center mb-6">
                <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-primary/10 group-hover:ring-primary/20 transition-all">
                  <AvatarImage src={contractor.logo_url || ''} alt={contractor.business_name} />
                  <AvatarFallback className="text-lg bg-gradient-to-br from-primary/10 to-primary/5">
                    {contractor.logo_url ? (
                      contractor.business_name.slice(0, 2).toUpperCase()
                    ) : (
                      <Building2 className="h-8 w-8 text-primary/60" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h3 className="text-xl font-semibold text-card-foreground">
                    {contractor.business_name}
                  </h3>
                  <GoogleVerificationBadge 
                    isVerified={contractor.google_business_verified}
                    verificationDate={contractor.google_verification_date}
                    size="sm"
                    showTooltip={false}
                  />
                </div>
                <p className="text-primary font-medium mb-2">
                  {contractor.contractor_services[0]?.services.name || 'General Services'}
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {contractor.city && contractor.province 
                    ? `${contractor.city}, ${contractor.province}` 
                    : 'Location Available'
                  }
                </div>
              </div>
              
              <div className="space-y-4">
                {contractor.rating > 0 && (
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.floor(contractor.rating) ? 'fill-current' : ''}`} 
                        />
                      ))}
                    </div>
                    <span className="font-semibold">{contractor.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({contractor.review_count} reviews)</span>
                  </div>
                )}
                
                {contractor.description && (
                  <p className="text-sm text-muted-foreground text-center line-clamp-2">
                    {contractor.description}
                  </p>
                )}
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2 text-center">Services:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {contractor.contractor_services.slice(0, 2).map((cs, serviceIndex) => (
                      <span 
                        key={serviceIndex}
                        className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs"
                      >
                        {cs.services.name}
                      </span>
                    ))}
                    {contractor.contractor_services.length > 2 && (
                      <span className="text-xs text-muted-foreground">
                        +{contractor.contractor_services.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-center text-sm text-muted-foreground">
                  <span>{contractor.years_experience} years experience</span>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewProfile(contractor.id);
                    }}
                  >
                    View Profile
                  </Button>
                  <Button 
                    className="flex-1" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewProfile(contractor.id);
                    }}
                  >
                    Get Quote
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
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