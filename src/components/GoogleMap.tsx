import { useEffect, useRef, useState } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { supabase } from '@/integrations/supabase/client';

// Simple type declarations for Google Maps
declare global {
  interface Window {
    google: any;
  }
}

interface GoogleMapProps {
  address: string;
  businessName: string;
  city?: string;
  province?: string;
}

const MapComponent = ({ address, businessName, city, province }: GoogleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      zoom: 15,
      center: { lat: 43.6532, lng: -79.3832 }, // Default to Toronto
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    setMap(mapInstance);

    // Geocode the address
    const geocoder = new window.google.maps.Geocoder();
    const fullAddress = `${address}, ${city}, ${province}`;
    
    geocoder.geocode({ address: fullAddress }, (results: any, status: any) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        mapInstance.setCenter(location);
        
        new window.google.maps.Marker({
          position: location,
          map: mapInstance,
          title: businessName,
        });
      }
    });
  }, [address, businessName, city, province]);

  return <div ref={mapRef} className="w-full h-64 rounded-lg" />;
};

const GoogleMap = ({ address, businessName, city, province }: GoogleMapProps) => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-google-maps-key');
        
        if (error) {
          console.error('Error fetching Google Maps API key:', error);
          setError('Failed to load map');
        } else if (data?.apiKey) {
          setApiKey(data.apiKey);
        } else {
          setError('No API key configured');
        }
      } catch (err) {
        console.error('Error calling get-google-maps-key function:', err);
        setError('Failed to load map');
      } finally {
        setLoading(false);
      }
    };

    fetchApiKey();
  }, []);
  
  // Loading state
  if (loading) {
    return (
      <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  // Error or no API key
  if (error || !apiKey) {
    return (
      <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Map Preview</p>
          <p className="text-xs mt-1">
            {address}, {city}, {province}
          </p>
          <p className="text-xs mt-2 opacity-75">
            {error || 'Google Maps API key required for live maps'}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <Wrapper apiKey={apiKey}>
      <MapComponent 
        address={address} 
        businessName={businessName}
        city={city}
        province={province}
      />
    </Wrapper>
  );
};

export default GoogleMap;