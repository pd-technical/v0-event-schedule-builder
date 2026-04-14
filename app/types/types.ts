export interface Event {
  id: string
  name: string
  description: string
  startTime: string
  endTime: string
  location: string
  category: string
  showtime: string
  lat: number
  lng: number
  location_details: string
  tags: string[]
}

export interface ScheduledEvent extends Event {
  orderIndex: number
}