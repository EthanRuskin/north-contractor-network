import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Phone, Mail, Navigation } from 'lucide-react';

interface ContractorBusiness {
  id: string;
  business_name: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  city: string;
  province: string;
  years_experience: number;
  rating: number;
  review_count: number;
  logo_url?: string;
  gallery_images?: string[];
  service_ids?: string[];
  service_names?: string[];
  base_ranking_score?: number;
  search_ranking_score?: number;
  latitude?: number;
  longitude?: number;
  distance_km?: number;
  features?: string[];
}

interface ContractorMapProps {
  contractors: ContractorBusiness[];
  onContractorSelect: (contractorId: string) => void;
  selectedContractorId?: string;
  userLocation?: { latitude: number; longitude: number } | null;
}

const ContractorMap: React.FC<ContractorMapProps> = ({ 
  contractors, 
  onContractorSelect, 
  selectedContractorId,
  userLocation 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const popup = useRef<mapboxgl.Popup | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [selectedContractor, setSelectedContractor] = useState<ContractorBusiness | null>(null);

  // Get Mapbox token from Supabase edge function
  useEffect(() => {
    const getMapboxToken = async () => {
      try {
        const { data } = await supabase.functions.invoke('get-mapbox-token');
        if (data?.token) {
          setMapboxToken(data.token);
        }
      } catch (error) {
        console.warn('Failed to get Mapbox token:', error);
        // Fallback for when token is not available
        // Users should add their Mapbox token to Supabase secrets
      }
    };
    
    getMapboxToken();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    // Center map on Canada if no user location, otherwise on user location
    const center: [number, number] = userLocation 
      ? [userLocation.longitude, userLocation.latitude]
      : [-106.3468, 56.1304]; // Center of Canada

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: center,
      zoom: userLocation ? 12 : 4,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add user location marker if available
    if (userLocation) {
      new mapboxgl.Marker({
        color: '#3B82F6',
        scale: 1.2
      })
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .setPopup(new mapboxgl.Popup().setDOMContent((() => {
          const div = document.createElement('div');
          div.className = 'p-2';
          const strong = document.createElement('strong');
          strong.textContent = 'Your Location';
          div.appendChild(strong);
          return div;
        })()))
        .addTo(map.current);
    }

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, userLocation]);

  // Update markers when contractors change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add contractor markers
    contractors.forEach((contractor, index) => {
      if (!contractor.latitude || !contractor.longitude) return;

      // Create custom marker element
      const el = document.createElement('div');
      el.className = `contractor-marker ${selectedContractorId === contractor.id ? 'selected' : ''}`;
      
      // Create marker content safely without innerHTML
      const markerDiv = document.createElement('div');
      markerDiv.className = 'w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform';
      markerDiv.textContent = String(index + 1);
      el.appendChild(markerDiv);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([contractor.longitude, contractor.latitude])
        .addTo(map.current!);

      // Click handler for marker
      el.addEventListener('click', () => {
        onContractorSelect(contractor.id);
        setSelectedContractor(contractor);
        
        // Center map on selected contractor
        map.current?.flyTo({
          center: [contractor.longitude!, contractor.latitude!],
          zoom: 15,
          duration: 1000
        });

        // Show popup
        if (popup.current) {
          popup.current.remove();
        }
        
        // Create popup content safely
        const popupContainer = document.createElement('div');
        popupContainer.className = 'p-3 max-w-xs';
        
        const title = document.createElement('h3');
        title.className = 'font-bold text-sm mb-1';
        title.textContent = contractor.business_name;
        popupContainer.appendChild(title);
        
        const ratingContainer = document.createElement('div');
        ratingContainer.className = 'flex items-center gap-1 mb-2';
        
        const starsContainer = document.createElement('div');
        starsContainer.className = 'flex items-center';
        for (let i = 0; i < 5; i++) {
          const star = document.createElement('span');
          star.className = 'text-yellow-400';
          star.textContent = i < Math.floor(contractor.rating) ? '★' : '☆';
          starsContainer.appendChild(star);
        }
        ratingContainer.appendChild(starsContainer);
        
        const reviewCount = document.createElement('span');
        reviewCount.className = 'text-xs text-gray-600';
        reviewCount.textContent = `(${contractor.review_count})`;
        ratingContainer.appendChild(reviewCount);
        popupContainer.appendChild(ratingContainer);
        
        if (contractor.description) {
          const description = document.createElement('p');
          description.className = 'text-xs text-gray-600 mb-2 line-clamp-2';
          description.textContent = contractor.description;
          popupContainer.appendChild(description);
        }
        
        if (contractor.service_names?.length) {
          const servicesContainer = document.createElement('div');
          servicesContainer.className = 'flex gap-1 mb-2';
          contractor.service_names.slice(0, 2).forEach(service => {
            const badge = document.createElement('span');
            badge.className = 'bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded';
            badge.textContent = service;
            servicesContainer.appendChild(badge);
          });
          popupContainer.appendChild(servicesContainer);
        }
        
        if (contractor.phone) {
          const phoneContainer = document.createElement('div');
          phoneContainer.className = 'flex items-center gap-2 text-xs';
          const phoneSpan = document.createElement('span');
          phoneSpan.className = 'flex items-center gap-1';
          const phoneIcon = document.createElement('span');
          phoneIcon.textContent = '📞';
          phoneSpan.appendChild(phoneIcon);
          phoneSpan.appendChild(document.createTextNode(` ${contractor.phone}`));
          phoneContainer.appendChild(phoneSpan);
          popupContainer.appendChild(phoneContainer);
        }

        popup.current = new mapboxgl.Popup({
          offset: 25,
          closeButton: true,
          closeOnClick: false
        })
          .setLngLat([contractor.longitude!, contractor.latitude!])
          .setDOMContent(popupContainer)
          .addTo(map.current!);
      });

      markers.current.push(marker);
    });

    // Fit map to show all contractors
    if (contractors.length > 0 && contractors.some(c => c.latitude && c.longitude)) {
      const bounds = new mapboxgl.LngLatBounds();
      
      contractors.forEach(contractor => {
        if (contractor.latitude && contractor.longitude) {
          bounds.extend([contractor.longitude, contractor.latitude]);
        }
      });

      // Add user location to bounds if available
      if (userLocation) {
        bounds.extend([userLocation.longitude, userLocation.latitude]);
      }

      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    }
  }, [contractors, selectedContractorId, onContractorSelect]);

  // Show token input if no token available
  if (!mapboxToken) {
    return (
      <div className="h-full flex items-center justify-center bg-muted">
        <Card className="p-6 max-w-md">
          <CardContent className="text-center space-y-4">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="font-semibold mb-2">Map View Unavailable</h3>
              <p className="text-sm text-muted-foreground">
                To enable the map view, please add your Mapbox token to the Supabase Edge Function secrets.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Get your free token at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">mapbox.com</a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      
      {/* Custom styles for markers */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .contractor-marker.selected > div {
            background-color: #ef4444 !important;
            transform: scale(1.2);
          }
        `
      }} />
      
      {/* Map overlay info */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium">
          {contractors.length} contractor{contractors.length !== 1 ? 's' : ''} found
        </p>
        {userLocation && (
          <p className="text-xs text-muted-foreground">
            📍 Showing results near you
          </p>
        )}
      </div>
    </div>
  );
};

export default ContractorMap;