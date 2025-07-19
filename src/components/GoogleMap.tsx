import { useEffect, useRef, useState } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';

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
  // For demo purposes - in production you'd want to use environment variables
  const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with actual API key
  
  // Fallback component when no API key is provided
  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
    return (
      <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Map Preview</p>
          <p className="text-xs mt-1">
            {address}, {city}, {province}
          </p>
          <p className="text-xs mt-2 opacity-75">
            Google Maps API key required for live maps
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