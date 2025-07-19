import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GooglePlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  business_status: string;
  url: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { contractorId, googlePlaceId, businessName, address, phone } = await req.json();

    if (!contractorId || !googlePlaceId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Google Maps API key from Supabase secrets
    const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    
    if (!googleMapsApiKey) {
      return new Response(
        JSON.stringify({ error: 'Google Maps API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch place details from Google Places API
    const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${googlePlaceId}&key=${googleMapsApiKey}&fields=place_id,name,formatted_address,formatted_phone_number,website,business_status,url`;
    
    const placeResponse = await fetch(placeDetailsUrl);
    const placeData = await placeResponse.json();

    if (placeData.status !== 'OK' || !placeData.result) {
      return new Response(
        JSON.stringify({ error: 'Invalid Google Place ID or place not found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const placeDetails: GooglePlaceDetails = placeData.result;

    // Verify business details match
    const verificationScore = calculateVerificationScore(
      { businessName, address, phone },
      placeDetails
    );

    // Require at least 70% match to verify
    const isVerified = verificationScore >= 0.7;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (isVerified) {
      // Update contractor business with verification status
      const { error: updateError } = await supabase
        .from('contractor_businesses')
        .update({
          google_business_verified: true,
          google_place_id: googlePlaceId,
          google_verification_date: new Date().toISOString(),
          google_business_url: placeDetails.url,
        })
        .eq('id', contractorId);

      if (updateError) {
        throw updateError;
      }
    }

    return new Response(
      JSON.stringify({
        verified: isVerified,
        verificationScore,
        placeDetails: {
          name: placeDetails.name,
          address: placeDetails.formatted_address,
          phone: placeDetails.formatted_phone_number,
          website: placeDetails.website,
          businessStatus: placeDetails.business_status,
          googleUrl: placeDetails.url,
        },
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Verification error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function calculateVerificationScore(
  contractorData: { businessName: string; address: string; phone?: string },
  googleData: GooglePlaceDetails
): number {
  let score = 0;
  let totalChecks = 0;

  // Business name comparison (40% weight)
  if (contractorData.businessName && googleData.name) {
    const nameMatch = calculateSimilarity(
      contractorData.businessName.toLowerCase(),
      googleData.name.toLowerCase()
    );
    score += nameMatch * 0.4;
    totalChecks += 0.4;
  }

  // Address comparison (40% weight)
  if (contractorData.address && googleData.formatted_address) {
    const addressMatch = calculateSimilarity(
      contractorData.address.toLowerCase(),
      googleData.formatted_address.toLowerCase()
    );
    score += addressMatch * 0.4;
    totalChecks += 0.4;
  }

  // Phone number comparison (20% weight)
  if (contractorData.phone && googleData.formatted_phone_number) {
    const phoneMatch = calculateSimilarity(
      contractorData.phone.replace(/\D/g, ''),
      googleData.formatted_phone_number.replace(/\D/g, '')
    );
    score += phoneMatch * 0.2;
    totalChecks += 0.2;
  }

  return totalChecks > 0 ? score / totalChecks : 0;
}

function calculateSimilarity(str1: string, str2: string): number {
  // Simple similarity calculation using Levenshtein distance
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  const maxLen = Math.max(str1.length, str2.length);
  return maxLen === 0 ? 1 : (maxLen - matrix[str2.length][str1.length]) / maxLen;
}