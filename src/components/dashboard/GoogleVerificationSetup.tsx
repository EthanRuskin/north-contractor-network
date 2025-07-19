import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, Check, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import GoogleVerificationBadge from '@/components/GoogleVerificationBadge';

interface GoogleVerificationSetupProps {
  business: {
    id: string;
    business_name: string;
    address?: string;
    phone?: string;
    google_business_verified: boolean;
    google_place_id?: string;
    google_verification_date?: string;
    google_business_url?: string;
  };
  onVerificationComplete: () => void;
}

const GoogleVerificationSetup = ({ business, onVerificationComplete }: GoogleVerificationSetupProps) => {
  const [googlePlaceId, setGooglePlaceId] = useState(business.google_place_id || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const { toast } = useToast();

  const handleVerification = async () => {
    if (!googlePlaceId.trim()) {
      toast({
        title: "Place ID required",
        description: "Please enter your Google Place ID",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('google-business-verification', {
        body: {
          contractorId: business.id,
          googlePlaceId: googlePlaceId.trim(),
          businessName: business.business_name,
          address: business.address,
          phone: business.phone,
        },
      });

      if (error) throw error;

      setVerificationResult(data);
      
      if (data.verified) {
        toast({
          title: "Verification successful!",
          description: "Your business has been verified with Google Business Profile",
        });
        onVerificationComplete();
      } else {
        toast({
          title: "Verification failed",
          description: "Business details don't match Google Business Profile records",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: "Verification error",
        description: error.message || "Failed to verify business",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (business.google_business_verified) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-green-800">Google Business Verified</CardTitle>
              <CardDescription className="text-green-600">
                Your business is verified with Google Business Profile
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <GoogleVerificationBadge 
            isVerified={business.google_business_verified}
            verificationDate={business.google_verification_date}
            size="lg"
          />
          
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Verified Date:</span>
              <span>{business.google_verification_date ? new Date(business.google_verification_date).toLocaleDateString() : 'Unknown'}</span>
            </div>
            {business.google_business_url && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Google Profile:</span>
                <Button variant="outline" size="sm" asChild>
                  <a href={business.google_business_url} target="_blank" rel="noopener noreferrer" className="gap-1">
                    <ExternalLink className="h-3 w-3" />
                    View Profile
                  </a>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle>Google Business Verification</CardTitle>
            <CardDescription>
              Verify your business with Google to build trust and credibility
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Google verification helps customers trust your business and can improve your search visibility.
            You'll need your Google Business Profile Place ID to verify.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label htmlFor="place-id">Google Place ID</Label>
            <Input
              id="place-id"
              value={googlePlaceId}
              onChange={(e) => setGooglePlaceId(e.target.value)}
              placeholder="Enter your Google Place ID"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Find your Place ID in your Google Business Profile dashboard or use the{' '}
              <a 
                href="https://developers.google.com/maps/documentation/places/web-service/place-id" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Place ID Finder
              </a>
            </p>
          </div>

          <Button 
            onClick={handleVerification}
            disabled={isVerifying || !googlePlaceId.trim()}
            className="w-full"
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Verify with Google
              </>
            )}
          </Button>
        </div>

        {verificationResult && (
          <Alert className={verificationResult.verified ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            {verificationResult.verified ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={verificationResult.verified ? "text-green-800" : "text-red-800"}>
              {verificationResult.verified ? (
                <>
                  <strong>Verification successful!</strong> Your business has been verified with Google Business Profile.
                  {verificationResult.placeDetails && (
                    <div className="mt-2 text-sm">
                      <p>Matched business: {verificationResult.placeDetails.name}</p>
                      <p>Address: {verificationResult.placeDetails.address}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <strong>Verification failed.</strong> Business details don't match Google records.
                  <div className="mt-2 text-sm">
                    Verification score: {Math.round((verificationResult.verificationScore || 0) * 100)}%
                    <br />
                    Please ensure your business name, address, and phone number match your Google Business Profile exactly.
                  </div>
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Benefits of Google Verification:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Builds customer trust and credibility</li>
            <li>• Shows verification badge on your profile</li>
            <li>• Improves search ranking</li>
            <li>• Displays Google reviews alongside platform reviews</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleVerificationSetup;