import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Image as ImageIcon, Trash2, Clock } from 'lucide-react';
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
  gallery_images?: string[];
  business_hours?: BusinessHours;
}

interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

interface BusinessHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
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
  const [galleryImages, setGalleryImages] = useState<string[]>(business?.gallery_images || []);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Default business hours
  const defaultBusinessHours: BusinessHours = {
    monday: { open: "08:00", close: "18:00", closed: false },
    tuesday: { open: "08:00", close: "18:00", closed: false },
    wednesday: { open: "08:00", close: "18:00", closed: false },
    thursday: { open: "08:00", close: "18:00", closed: false },
    friday: { open: "08:00", close: "18:00", closed: false },
    saturday: { open: "09:00", close: "16:00", closed: false },
    sunday: { open: "09:00", close: "16:00", closed: true }
  };
  
  const [businessHours, setBusinessHours] = useState<BusinessHours>(
    business?.business_hours || defaultBusinessHours
  );

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
        gallery_images: galleryImages,
        business_hours: businessHours as any,
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

  const uploadGalleryImage = async (file: File) => {
    if (!user) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('contractor-galleries')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('contractor-galleries')
        .getPublicUrl(fileName);

      if (data.publicUrl) {
        setGalleryImages(prev => [...prev, data.publicUrl]);
        toast({
          title: "Image uploaded",
          description: "Gallery image uploaded successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const removeGalleryImage = (imageUrl: string) => {
    setGalleryImages(prev => prev.filter(url => url !== imageUrl));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        uploadGalleryImage(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
      }
    }
  };

  const updateBusinessHours = (day: keyof BusinessHours, field: keyof DayHours, value: string | boolean) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const copyHoursToAll = (sourceDay: keyof BusinessHours) => {
    const sourceHours = businessHours[sourceDay];
    setBusinessHours(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(day => {
        if (day !== sourceDay) {
          updated[day as keyof BusinessHours] = { ...sourceHours };
        }
      });
      return updated;
    });
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

            {/* Gallery Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Work Gallery</Label>
                <p className="text-sm text-muted-foreground">Showcase your best work</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload photos of your completed projects to show potential customers your quality of work.
              </p>
              
              <div className="grid gap-4">
                {/* Upload Button */}
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="gallery-upload"
                  />
                  <Label
                    htmlFor="gallery-upload"
                    className="flex items-center gap-2 cursor-pointer bg-muted hover:bg-muted/80 px-4 py-2 rounded-md transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    {uploadingImage ? 'Uploading...' : 'Add Photo'}
                  </Label>
                  {uploadingImage && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      Uploading image...
                    </div>
                  )}
                </div>

                {/* Gallery Grid */}
                {galleryImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {galleryImages.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Gallery image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md border"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(imageUrl)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {galleryImages.length === 0 && (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No gallery images yet</p>
                    <p className="text-sm text-muted-foreground">Upload photos to showcase your work</p>
                  </div>
                )}
              </div>
            </div>

            {/* Business Hours Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Business Hours
                </Label>
                <p className="text-sm text-muted-foreground">Set your operating hours</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Let customers know when your business is open for calls and appointments.
              </p>
              
              <div className="space-y-3">
                {Object.entries(businessHours).map(([day, hours]) => (
                  <div key={day} className="grid grid-cols-12 gap-3 items-center p-3 border rounded-lg bg-muted/20">
                    <div className="col-span-3">
                      <Label className="font-medium capitalize">{day}</Label>
                    </div>
                    
                    <div className="col-span-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={hours.closed}
                          onCheckedChange={(checked) => 
                            updateBusinessHours(day as keyof BusinessHours, 'closed', !!checked)
                          }
                        />
                        <Label className="text-sm">Closed</Label>
                      </div>
                    </div>
                    
                    {!hours.closed && (
                      <>
                        <div className="col-span-3">
                          <Input
                            type="time"
                            value={hours.open}
                            onChange={(e) => 
                              updateBusinessHours(day as keyof BusinessHours, 'open', e.target.value)
                            }
                            className="text-sm"
                          />
                        </div>
                        <div className="col-span-1 text-center text-sm text-muted-foreground">
                          to
                        </div>
                        <div className="col-span-3">
                          <Input
                            type="time"
                            value={hours.close}
                            onChange={(e) => 
                              updateBusinessHours(day as keyof BusinessHours, 'close', e.target.value)
                            }
                            className="text-sm"
                          />
                        </div>
                      </>
                    )}
                    
                    {hours.closed && <div className="col-span-7" />}
                    
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyHoursToAll(day as keyof BusinessHours)}
                        className="text-xs px-2 py-1 h-6"
                        title="Copy to all days"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
                💡 <strong>Tip:</strong> Use the "Copy" button to apply the same hours to all days, then adjust individual days as needed.
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