/**
 * Venue API Route - /api/venues/[geohash]
 * Handles venue creation, lookup, and metadata with lazy creation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isValidVenueId, createVenueData, type VenueInsert, type Venue } from '@/lib/venues';
import { validateCoordinates, type Coordinates } from '@/lib/location';
import { Pattern } from '@/lib/patterns';

interface VenueRequestBody {
  coordinates: Coordinates;
  label?: string;
  pattern_data?: Pattern;
}

interface VenueApiResponse {
  venue: Venue;
  metadata: {
    active_patterns: number;
    recent_labels: string[];
    is_new: boolean;
  };
}

interface VenueErrorResponse {
  error: string;
  message: string;
  code?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ geohash: string }> }
) {
  try {
    const resolvedParams = await params;
    const { geohash } = resolvedParams;

    // Validate geohash format
    if (!isValidVenueId(geohash)) {
      return NextResponse.json(
        {
          error: 'invalid_venue_id',
          message: 'Invalid venue ID format'
        } satisfies VenueErrorResponse,
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get venue data
    const { data: venue, error: venueError } = await supabase
      .from('venues')
      .select('*')
      .eq('id', geohash)
      .single();

    if (venueError && venueError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Venue lookup error:', venueError);
      return NextResponse.json(
        {
          error: 'database_error',
          message: 'Failed to lookup venue'
        } satisfies VenueErrorResponse,
        { status: 500 }
      );
    }

    // If venue doesn't exist, return not found
    if (!venue) {
      return NextResponse.json(
        {
          error: 'venue_not_found',
          message: 'Venue not found'
        } satisfies VenueErrorResponse,
        { status: 404 }
      );
    }

    // Get active patterns count
    const { count: activePatterns } = await supabase
      .from('patterns')
      .select('*', { count: 'exact', head: true })
      .eq('venue_id', geohash)
      .gte('last_ping', new Date(Date.now() - 30 * 60 * 1000).toISOString()); // Active in last 30 minutes

    // Get recent venue labels
    const { data: labels } = await supabase
      .from('venue_labels')
      .select('label')
      .eq('venue_id', geohash)
      .order('count', { ascending: false })
      .limit(5);

    const response: VenueApiResponse = {
      venue,
      metadata: {
        active_patterns: activePatterns || 0,
        recent_labels: labels?.map(l => l.label) || [],
        is_new: false
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Venue GET error:', error);
    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'Internal server error'
      } satisfies VenueErrorResponse,
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ geohash: string }> }
) {
  try {
    const resolvedParams = await params;
    const { geohash } = resolvedParams;

    // Validate geohash format
    if (!isValidVenueId(geohash)) {
      return NextResponse.json(
        {
          error: 'invalid_venue_id',
          message: 'Invalid venue ID format'
        } satisfies VenueErrorResponse,
        { status: 400 }
      );
    }

    // Parse request body
    let body: VenueRequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: 'invalid_json',
          message: 'Invalid JSON in request body'
        } satisfies VenueErrorResponse,
        { status: 400 }
      );
    }

    // Validate coordinates
    if (!body.coordinates || !validateCoordinates(body.coordinates)) {
      return NextResponse.json(
        {
          error: 'invalid_coordinates',
          message: 'Invalid or missing coordinates'
        } satisfies VenueErrorResponse,
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if venue already exists
    const { data: existingVenue } = await supabase
      .from('venues')
      .select('*')
      .eq('id', geohash)
      .single();

    let venue;
    let isNew = false;

    if (existingVenue) {
      // Update existing venue usage
      const { data: updatedVenue, error: updateError } = await supabase
        .from('venues')
        .update({
          use_count: (existingVenue.use_count || 0) + 1,
          last_active: new Date().toISOString()
        })
        .eq('id', geohash)
        .select()
        .single();

      if (updateError) {
        console.error('Venue update error:', updateError);
        return NextResponse.json(
          {
            error: 'update_failed',
            message: 'Failed to update venue'
          } satisfies VenueErrorResponse,
          { status: 500 }
        );
      }

      venue = updatedVenue;
    } else {
      // Create new venue
      const venueData: VenueInsert = createVenueData(body.coordinates, body.label);
      
      const { data: newVenue, error: createError } = await supabase
        .from('venues')
        .insert(venueData)
        .select()
        .single();

      if (createError) {
        console.error('Venue creation error:', createError);
        return NextResponse.json(
          {
            error: 'creation_failed',
            message: 'Failed to create venue'
          } satisfies VenueErrorResponse,
          { status: 500 }
        );
      }

      venue = newVenue;
      isNew = true;
    }

    // Add venue label if provided and venue is new
    if (body.label && isNew) {
      await supabase
        .from('venue_labels')
        .insert({
          venue_id: geohash,
          label: body.label.trim(),
          count: 1
        })
        .select();
    } else if (body.label && !isNew) {
      // Update existing label count or create new one
      const { data: existingLabel } = await supabase
        .from('venue_labels')
        .select('count')
        .eq('venue_id', geohash)
        .eq('label', body.label.trim())
        .single();

      if (existingLabel) {
        // Increment existing label count
        await supabase
          .from('venue_labels')
          .update({ count: existingLabel.count + 1 })
          .eq('venue_id', geohash)
          .eq('label', body.label.trim());
      } else {
        // Insert new label
        await supabase
          .from('venue_labels')
          .insert({
            venue_id: geohash,
            label: body.label.trim(),
            count: 1
          });
      }
    }

    // Get metadata for response
    const { count: activePatterns } = await supabase
      .from('patterns')
      .select('*', { count: 'exact', head: true })
      .eq('venue_id', geohash)
      .gte('last_ping', new Date(Date.now() - 30 * 60 * 1000).toISOString());

    const { data: labels } = await supabase
      .from('venue_labels')
      .select('label')
      .eq('venue_id', geohash)
      .order('count', { ascending: false })
      .limit(5);

    const response: VenueApiResponse = {
      venue,
      metadata: {
        active_patterns: activePatterns || 0,
        recent_labels: labels?.map(l => l.label) || [],
        is_new: isNew
      }
    };

    return NextResponse.json(response, { status: isNew ? 201 : 200 });
  } catch (error) {
    console.error('Venue POST error:', error);
    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'Internal server error'
      } satisfies VenueErrorResponse,
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ geohash: string }> }
) {
  try {
    const resolvedParams = await params;
    const { geohash } = resolvedParams;

    // Validate geohash format
    if (!isValidVenueId(geohash)) {
      return NextResponse.json(
        {
          error: 'invalid_venue_id',
          message: 'Invalid venue ID format'
        } satisfies VenueErrorResponse,
        { status: 400 }
      );
    }

    // Parse request body
    let body: Partial<VenueRequestBody>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: 'invalid_json',
          message: 'Invalid JSON in request body'
        } satisfies VenueErrorResponse,
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if venue exists
    const { data: existingVenue } = await supabase
      .from('venues')
      .select('*')
      .eq('id', geohash)
      .single();

    if (!existingVenue) {
      return NextResponse.json(
        {
          error: 'venue_not_found',
          message: 'Venue not found'
        } satisfies VenueErrorResponse,
        { status: 404 }
      );
    }

    // Update venue last_active timestamp
    const { data: updatedVenue, error: updateError } = await supabase
      .from('venues')
      .update({
        last_active: new Date().toISOString()
      })
      .eq('id', geohash)
      .select()
      .single();

    if (updateError) {
      console.error('Venue update error:', updateError);
      return NextResponse.json(
        {
          error: 'update_failed',
          message: 'Failed to update venue'
        } satisfies VenueErrorResponse,
        { status: 500 }
      );
    }

    // Add new label if provided
    if (body.label) {
      const { data: existingLabel } = await supabase
        .from('venue_labels')
        .select('count')
        .eq('venue_id', geohash)
        .eq('label', body.label.trim())
        .single();

      if (existingLabel) {
        // Increment existing label count
        await supabase
          .from('venue_labels')
          .update({ count: existingLabel.count + 1 })
          .eq('venue_id', geohash)
          .eq('label', body.label.trim());
      } else {
        // Insert new label
        await supabase
          .from('venue_labels')
          .insert({
            venue_id: geohash,
            label: body.label.trim(),
            count: 1
          });
      }
    }

    return NextResponse.json({ venue: updatedVenue });
  } catch (error) {
    console.error('Venue PATCH error:', error);
    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'Internal server error'
      } satisfies VenueErrorResponse,
      { status: 500 }
    );
  }
}