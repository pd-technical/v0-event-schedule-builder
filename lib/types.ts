export interface Location {
  id: string
  name: string
  short_name: string | null
  address: string
  latitude: number
  longitude: number
  type: string
  created_at: string
}

export interface LocationFeature {
  id: string
  location_id: string
  feature_type: 'food_trucks' | 'entertainment' | 'student_org_fair' | 'childrens_fair'
  feature_name: string | null
  created_at: string
}

export interface LocationWithFeatures extends Location {
  location_features: LocationFeature[]
}

export interface Event {
  id: string
  location_id: string
  name: string
  description: string | null
  start_time: string
  end_time: string
  category: string
  popularity: number
  created_at: string
  location?: Location
}

export interface Amenity {
  id: string
  name: string
  type: 'food' | 'bathroom' | 'water'
  latitude: number
  longitude: number
  created_at: string
}

export interface ScheduledEvent extends Event {
  orderIndex: number
}

export type AmenityVisibility = {
  food: boolean
  bathroom: boolean
  water: boolean
}

export type FeatureType = 'food_trucks' | 'entertainment' | 'student_org_fair' | 'childrens_fair'

// UI-specific types (transformed from DB types)
export interface UIEvent {
  id: string
  name: string
  time: string
  endTime: string
  location: string
  locationId: string
  category: string
  description: string
  mapPosition: { lat: number; lng: number }
  popularity: number
}

export interface UIScheduledEvent extends UIEvent {
  orderIndex: number
}

export interface UIAmenity {
  id: string
  type: "food" | "bathroom" | "water"
  name: string
  position: { lat: number; lng: number }
}
