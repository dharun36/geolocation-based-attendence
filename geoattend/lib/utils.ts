import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3 // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

/**
 * Check if a point is within a geo-fence
 * @param userLat User's latitude
 * @param userLon User's longitude
 * @param centerLat Geo-fence center latitude
 * @param centerLon Geo-fence center longitude
 * @param radius Geo-fence radius in meters
 * @returns true if user is within geo-fence
 */
export function isWithinGeofence(
  userLat: number,
  userLon: number,
  centerLat: number,
  centerLon: number,
  radius: number
): boolean {
  const distance = calculateDistance(userLat, userLon, centerLat, centerLon)
  return distance <= radius
}

/**
 * Format time difference in hours and minutes
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

/**
 * Calculate hours between two dates
 */
export function calculateHours(start: Date, end: Date): number {
  const diff = end.getTime() - start.getTime()
  return Number((diff / (1000 * 60 * 60)).toFixed(2))
}

/**
 * Check if user is late based on expected time
 */
export function calculateLateMinutes(
  checkInTime: Date,
  expectedTime: string = "09:00"
): number {
  const [hours, minutes] = expectedTime.split(":").map(Number)
  const expected = new Date(checkInTime)
  expected.setHours(hours, minutes, 0, 0)

  if (checkInTime <= expected) return 0

  const diff = checkInTime.getTime() - expected.getTime()
  return Math.floor(diff / (1000 * 60))
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}
