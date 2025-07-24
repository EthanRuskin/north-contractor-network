import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Declare Google Maps types
declare global {
  interface Window {
    google: any;
  }
}

interface UseGooglePlacesOptions {
  onPlaceSelect?: (place: any) => void;
  country?: string;
  types?: string[];
}

export const useGooglePlaces = (options: UseGooglePlacesOptions = {}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    const initAutocomplete = async () => {
      if (!inputRef.current) return;

      try {
        // Get Google Maps API key from edge function
        const { data: keyData } = await supabase.functions.invoke('get-google-maps-key');
        const apiKey = keyData?.apiKey;
        
        if (!apiKey) {
          console.warn('Google Maps API key not available');
          return;
        }

        // Load Google Maps API if not already loaded
        if (!window.google) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
          script.async = true;
          script.defer = true;
          script.onload = setupAutocomplete;
          document.head.appendChild(script);
        } else {
          setupAutocomplete();
        }
      } catch (error) {
        console.error('Failed to load Google Maps API:', error);
      }
    };

    const setupAutocomplete = () => {
      if (!window.google || !inputRef.current) return;

      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: options.types || ['geocode'],
        componentRestrictions: options.country ? { country: options.country } : undefined
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (place && options.onPlaceSelect) {
          options.onPlaceSelect(place);
        }
      });
    };

    initAutocomplete();

    return () => {
      if (autocompleteRef.current && window.google) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [options.country, options.types]);

  return inputRef;
};