import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Star, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface ContractorBusiness {
  id: string;
  business_name: string;
  description: string;
  city: string;
  province: string;
  years_experience: number;
  rating: number;
  review_count: number;
}

const ServiceCategory = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [service, setService] = useState<Service | null>(null);
  const [contractors, setContractors] = useState<ContractorBusiness[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (serviceId) {
      fetchServiceAndContractors();
    }
  }, [serviceId]);

  const fetchServiceAndContractors = async () => {
    try {
      // Fetch service details
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();

      if (serviceError) throw serviceError;
      setService(serviceData);

      // Fetch contractors offering this service
      const { data: contractorsData, error: contractorsError } = await supabase
        .from('contractor_businesses')
        .select(`
          id,
          business_name,
          description,
          city,
          province,
          years_experience,
          rating,
          review_count
        `)
        .eq('status', 'approved')
        .in('id', 
          // Subquery to get contractor IDs that offer this service
          await supabase
            .from('contractor_services')
            .select('contractor_id')
            .eq('service_id', serviceId)
            .then(({ data }) => data?.map(cs => cs.contractor_id) || [])
        )
        .order('rating', { ascending: false });

      if (contractorsError) throw contractorsError;
      setContractors(contractorsData || []);
    } catch (error: any) {
      toast({
        title: "Error loading service",
        description: error.message,
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
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

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Service not found</p>
              <Button onClick={() => navigate('/')} className="mt-4">
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>

        {/* Service Header */}
        <div className="text-center mb-12 px-4 sm:px-0">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            {service.icon ? (
              <span className="text-2xl">{service.icon}</span>
            ) : (
              <span className="text-2xl">🔧</span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{service.name}</h1>
          {service.description && (
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              {service.description}
            </p>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{contractors.length} contractors available</span>
            </div>
            <Button 
              onClick={() => navigate(`/search?service=${serviceId}`)}
              className="gap-2"
            >
              Search All {service.name} Contractors
            </Button>
          </div>
        </div>

        {/* Top Contractors */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Top {service.name} Contractors</h2>
          
          {contractors.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No contractors currently offering {service.name} services.
                </p>
                <Button 
                  onClick={() => navigate('/search')} 
                  className="mt-4"
                >
                  Browse All Contractors
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {contractors.slice(0, 6).map(contractor => (
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

                    <div className="flex justify-between items-center">
                      {contractor.years_experience > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {contractor.years_experience} years experience
                        </p>
                      )}
                      <Badge variant="secondary">{service.name}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {contractors.length > 6 && (
            <div className="text-center mt-8">
              <Button 
                onClick={() => navigate(`/search?service=${serviceId}`)}
                variant="outline"
                size="lg"
              >
                View All {contractors.length} {service.name} Contractors
              </Button>
            </div>
          )}
        </div>

        {/* Service Info */}
        <Card>
          <CardHeader>
            <CardTitle>About {service.name} Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-3">What to Expect</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Professional and licensed contractors</li>
                  <li>• Verified business credentials</li>
                  <li>• Customer reviews and ratings</li>
                  <li>• Direct contact with contractors</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">How It Works</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Browse and compare contractors</li>
                  <li>• Read reviews from other customers</li>
                  <li>• Contact contractors directly</li>
                  <li>• Get quotes and schedule services</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServiceCategory;