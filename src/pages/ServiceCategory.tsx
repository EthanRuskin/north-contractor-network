import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Building2, MapPin, Star } from 'lucide-react';
import SearchHeader from '@/components/SearchHeader';
import GoogleVerificationBadge from '@/components/GoogleVerificationBadge';

interface Service {
  id: number;
  name: string;
  description: string;
  icon?: string;
}

interface ContractorBusiness {
  id: string;
  business_name: string;
  description: string;
  service_area: string;
  founded_year: number;
  verified: boolean;
}

const ServiceCategory = () => {
  const { serviceId } = useParams();
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
        .eq('id', parseInt(serviceId || '0'))
        .single();

      if (serviceError) throw serviceError;
      setService(serviceData);

      // Fetch contractors offering this service
      const { data: contractorsData, error: contractorsError } = await supabase
        .from('contractor_profiles')
        .select(`
          id,
          business_name,
          description,
          service_area,
          founded_year,
          verified
        `)
        .eq('verified', true)
        .order('created_at', { ascending: false });

      if (contractorsError) throw contractorsError;
      setContractors(contractorsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SearchHeader />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <SearchHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Service Not Found</h1>
            <Button asChild>
              <Link to="/search">Back to Search</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SearchHeader />
      
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          asChild 
          className="mb-6 gap-2"
        >
          <Link to="/search">
            <ArrowLeft className="h-4 w-4" />
            Back to Search
          </Link>
        </Button>

        {/* Service Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              {service.icon && <span className="text-2xl">{service.icon}</span>}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{service.name}</h1>
              <p className="text-lg text-muted-foreground">{service.description}</p>
            </div>
          </div>
        </div>

        {/* Contractors */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              Available Contractors ({contractors.length})
            </h2>
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

          {contractors.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No contractors found</h3>
                  <p>No contractors are currently offering this service.</p>
                  <Button asChild className="mt-4">
                    <Link to="/search">Browse All Contractors</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCategory;