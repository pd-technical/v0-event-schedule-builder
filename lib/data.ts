import { createClient } from '@/lib/supabase/client'
import type { Location, LocationWithFeatures, Event, Amenity, FeatureType } from './types'

export async function getLocations(): Promise<Location[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('name')
  
  if (error) {
    console.error('Error fetching locations:', error)
    return []
  }
  return data || []
}

export async function getLocationsWithFeatures(): Promise<LocationWithFeatures[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('locations')
    .select(`
      *,
      location_features (*)
    `)
    .order('name')
  
  if (error) {
    console.error('Error fetching locations with features:', error)
    return []
  }
  return data || []
}

export async function getLocationsByFeature(featureType: FeatureType): Promise<LocationWithFeatures[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('locations')
    .select(`
      *,
      location_features!inner (*)
    `)
    .eq('location_features.feature_type', featureType)
    .order('name')
  
  if (error) {
    console.error('Error fetching locations by feature:', error)
    return []
  }
  return data || []
}

export async function getEvents(): Promise<Event[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      location:locations (*)
    `)
    .order('start_time')
  
  if (error) {
    console.error('Error fetching events:', error)
    return []
  }
  return data || []
}

export async function getEventsByCategory(category: string): Promise<Event[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      location:locations (*)
    `)
    .eq('category', category)
    .order('start_time')
  
  if (error) {
    console.error('Error fetching events by category:', error)
    return []
  }
  return data || []
}

export async function getEventsByLocation(locationId: string): Promise<Event[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      location:locations (*)
    `)
    .eq('location_id', locationId)
    .order('start_time')
  
  if (error) {
    console.error('Error fetching events by location:', error)
    return []
  }
  return data || []
}

export async function searchEvents(query: string): Promise<Event[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      location:locations (*)
    `)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('start_time')
  
  if (error) {
    console.error('Error searching events:', error)
    return []
  }
  return data || []
}

export async function getAmenities(): Promise<Amenity[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('amenities')
    .select('*')
    .order('name')
  
  if (error) {
    console.error('Error fetching amenities:', error)
    return []
  }
  return data || []
}

export async function getAmenitiesByType(type: 'food' | 'bathroom' | 'water'): Promise<Amenity[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('amenities')
    .select('*')
    .eq('type', type)
    .order('name')
  
  if (error) {
    console.error('Error fetching amenities by type:', error)
    return []
  }
  return data || []
}

// Get popular events sorted by how many times they've been added to schedules
export async function getPopularEvents(limit: number = 20): Promise<Event[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      location:locations (*)
    `)
    .order('popularity', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching popular events:', error)
    return []
  }
  return data || []
}
