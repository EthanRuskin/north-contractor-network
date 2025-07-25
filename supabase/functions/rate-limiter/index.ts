import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RateLimitRequest {
  identifier: string; // IP address or user ID
  action: string; // Type of action being rate limited
  limit?: number; // Optional custom limit
  window?: number; // Optional custom window in minutes
}

interface RateLimitResponse {
  allowed: boolean;
  remaining: number;
  resetTime: string;
  message?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { identifier, action, limit = 100, window = 60 }: RateLimitRequest = await req.json();

    if (!identifier || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get current time and window start
    const now = new Date();
    const windowStart = new Date(now.getTime() - (window * 60 * 1000));

    // Clean up old entries
    await supabase
      .from('rate_limit_log')
      .delete()
      .lt('created_at', windowStart.toISOString());

    // Count requests in current window
    const { data: requests, error: countError } = await supabase
      .from('rate_limit_log')
      .select('id')
      .eq('identifier', identifier)
      .eq('action', action)
      .gte('created_at', windowStart.toISOString());

    if (countError) {
      console.error('Error counting requests:', countError);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const currentCount = requests?.length || 0;
    const remaining = Math.max(0, limit - currentCount);
    const resetTime = new Date(now.getTime() + (window * 60 * 1000)).toISOString();

    // Check if rate limit is exceeded
    if (currentCount >= limit) {
      return new Response(
        JSON.stringify({
          allowed: false,
          remaining: 0,
          resetTime,
          message: `Rate limit exceeded. Try again after ${window} minutes.`
        } as RateLimitResponse),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log the request
    const { error: logError } = await supabase
      .from('rate_limit_log')
      .insert({
        identifier,
        action,
        created_at: now.toISOString()
      });

    if (logError) {
      console.error('Error logging request:', logError);
      // Continue execution even if logging fails
    }

    return new Response(
      JSON.stringify({
        allowed: true,
        remaining: remaining - 1, // Subtract 1 for the current request
        resetTime,
      } as RateLimitResponse),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in rate-limiter function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});