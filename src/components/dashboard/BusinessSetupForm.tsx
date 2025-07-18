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
    
    // Validate required services
    if (selectedServices.length === 0) {
      toast({
        title: "Services Required",
        description: "Please select at least one service you offer.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const description = formData.get('description') as string;
      
      // Additional validation
      if (description.length < 50) {
        throw new Error("Business description must be at least 50 characters long");
      }

      const businessData = {
        user_id: user?.id,
        business_name: formData.get('businessName') as string,
        description: description,
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
        title: business ? "Business updated!" : "🎉 Business Profile Created!",
        description: business 
          ? "Your business information has been updated successfully."
          : "Your business is now live! Homeowners can find and contact you immediately.",
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
                  placeholder="Enter your business name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={business?.phone}
                  required
                  placeholder="(123) 456-7890"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Business Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your business, services, and what makes you unique..."
                rows={4}
                defaultValue={business?.description}
                required
                minLength={50}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 50 characters. Help customers understand what you do and why they should choose you.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Business Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={business?.email}
                  required
                  placeholder="business@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  defaultValue={business?.website}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Service Area *</h3>
              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={business?.address}
                  required
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue={business?.city}
                    required
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Province *</Label>
                  <Input
                    id="province"
                    name="province"
                    defaultValue={business?.province}
                    required
                    placeholder="ON"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    defaultValue={business?.postal_code}
                    required
                    placeholder="A1A 1A1"
                    pattern="[A-Za-z][0-9][A-Za-z] [0-9][A-Za-z][0-9]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Professional Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="yearsExperience">Years of Experience *</Label>
                  <Input
                    id="yearsExperience"
                    name="yearsExperience"
                    type="number"
                    min="0"
                    max="50"
                    defaultValue={business?.years_experience}
                    required
                    placeholder="5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    name="licenseNumber"
                    defaultValue={business?.license_number}
                    placeholder="If applicable"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Services Offered *</Label>
                <p className="text-sm text-muted-foreground">Select at least one service</p>
              </div>
              {selectedServices.length === 0 && (
                <p className="text-sm text-destructive">Please select at least one service you offer</p>
              )}
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {services.map(service => (
                  <div key={service.id} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-muted/50">
                    <Checkbox
                      id={service.id}
                      checked={selectedServices.includes(service.id)}
                      onCheckedChange={() => handleServiceToggle(service.id)}
                    />
                    <Label 
                      htmlFor={service.id}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {service.name}
                      {service.description && (
                        <span className="block text-xs text-muted-foreground mt-1">
                          {service.description}
                        </span>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <Button 
                type="submit" 
                disabled={loading || selectedServices.length === 0} 
                className="flex-1"
              >
                {loading 
                  ? (business ? "Updating..." : "Creating Business Profile...") 
                  : (business ? "Update Business" : "Complete Setup & Go Live")
                }
              </Button>
              {business && (
                <Button type="button" variant="outline" onClick={onComplete}>
                  Cancel
                </Button>
              )}
            </div>
            
            {!business && selectedServices.length === 0 && (
              <p className="text-sm text-muted-foreground text-center">
                Please select at least one service to continue
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessSetupForm;