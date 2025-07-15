import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface Service {
  id: string;
  name: string;
  description: string;
}

interface Business {
  id: string;
  business_name: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  years_experience: number;
  license_number: string;
}

interface BusinessSetupFormProps {
  business?: Business | null;
  onComplete: () => void;
}

const BusinessSetupForm = ({ business, onComplete }: BusinessSetupFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  useEffect(() => {
    fetchServices();
    if (business) {
      fetchBusinessServices();
    }
  }, [business]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchBusinessServices = async () => {
    if (!business) return;
    
    try {
      const { data, error } = await supabase
        .from('contractor_services')
        .select('service_id')
        .eq('contractor_id', business.id);

      if (error) throw error;
      setSelectedServices(data?.map(cs => cs.service_id) || []);
    } catch (error) {
      console.error('Error fetching business services:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const businessData = {
        user_id: user?.id,
        business_name: formData.get('businessName') as string,
        description: formData.get('description') as string,
        phone: formData.get('phone') as string,
        email: formData.get('email') as string,
        website: formData.get('website') as string,
        address: formData.get('address') as string,
        city: formData.get('city') as string,
        province: formData.get('province') as string,
        postal_code: formData.get('postalCode') as string,
        years_experience: parseInt(formData.get('yearsExperience') as string) || 0,
        license_number: formData.get('licenseNumber') as string,
        status: 'approved', // Auto-approve new businesses for immediate visibility
      };

      let businessId = business?.id;

      if (business) {
        // Update existing business
        const { error } = await supabase
          .from('contractor_businesses')
          .update(businessData)
          .eq('id', business.id);

        if (error) throw error;
      } else {
        // Create new business
        const { data, error } = await supabase
          .from('contractor_businesses')
          .insert(businessData)
          .select('id')
          .single();

        if (error) throw error;
        businessId = data.id;
      }

      // Update services
      if (businessId) {
        // Delete existing services
        await supabase
          .from('contractor_services')
          .delete()
          .eq('contractor_id', businessId);

        // Insert new services
        if (selectedServices.length > 0) {
          const serviceInserts = selectedServices.map(serviceId => ({
            contractor_id: businessId,
            service_id: serviceId,
          }));

          const { error: servicesError } = await supabase
            .from('contractor_services')
            .insert(serviceInserts);

          if (servicesError) throw servicesError;
        }
      }

      toast({
        title: business ? "Business updated!" : "Business created!",
        description: business 
          ? "Your business information has been updated successfully."
          : "Your business has been submitted for review.",
      });

      onComplete();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>
            {business ? 'Update Business Information' : 'Set Up Your Business'}
          </CardTitle>
          <CardDescription>
            {business 
              ? 'Update your business information and services'
              : 'Complete your contractor profile to start receiving leads'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  defaultValue={business?.business_name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={business?.phone}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Business Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your business and services..."
                rows={3}
                defaultValue={business?.description}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Business Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={business?.email}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  placeholder="https://"
                  defaultValue={business?.website}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                defaultValue={business?.address}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  defaultValue={business?.city}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <Input
                  id="province"
                  name="province"
                  defaultValue={business?.province}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  defaultValue={business?.postal_code}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Years of Experience</Label>
                <Input
                  id="yearsExperience"
                  name="yearsExperience"
                  type="number"
                  min="0"
                  defaultValue={business?.years_experience}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  name="licenseNumber"
                  defaultValue={business?.license_number}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Services Offered</Label>
              <div className="grid gap-3 md:grid-cols-2">
                {services.map(service => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={service.id}
                      checked={selectedServices.includes(service.id)}
                      onCheckedChange={() => handleServiceToggle(service.id)}
                    />
                    <Label 
                      htmlFor={service.id}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {service.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading 
                  ? (business ? "Updating..." : "Creating...") 
                  : (business ? "Update Business" : "Create Business")
                }
              </Button>
              {business && (
                <Button type="button" variant="outline" onClick={onComplete}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessSetupForm;