"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { checkInAction, checkOutAction, getTodayAttendanceAction } from "@/app/actions/attendance"
import { MapPin, Clock, AlertCircle, CheckCircle } from "lucide-react"
import { format } from "date-fns"

export function AttendanceCheckInOut() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [attendance, setAttendance] = useState<any>(null)
  const [location, setLocation] = useState<{ lat: number; lon: number; accuracy: number } | null>(null)
  const [gettingLocation, setGettingLocation] = useState(false)

  // Load today's attendance status
  useEffect(() => {
    loadAttendance()
  }, [])

  async function loadAttendance() {
    const result = await getTodayAttendanceAction()
    if (result.success) {
      setAttendance(result.data)
    }
  }

  async function getLocation() {
    setGettingLocation(true)
    setError("")

    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser")
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      })

      setLocation({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        accuracy: position.coords.accuracy,
      })
    } catch (err: any) {
      setError(err.message || "Failed to get location. Please enable location services.")
    } finally {
      setGettingLocation(false)
    }
  }

  async function handleCheckIn() {
    if (!location) {
      setError("Please get your location first")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await checkInAction({
        latitude: location.lat,
        longitude: location.lon,
        accuracy: location.accuracy,
      })

      if (result.success) {
        setSuccess(result.message || "Checked in successfully")
        await loadAttendance()
        setLocation(null)
      } else {
        setError(result.error || "Check-in failed")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  async function handleCheckOut() {
    if (!location) {
      setError("Please get your location first")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await checkOutAction({
        latitude: location.lat,
        longitude: location.lon,
        accuracy: location.accuracy,
      })

      if (result.success) {
        setSuccess(result.message || "Checked out successfully")
        await loadAttendance()
        setLocation(null)
      } else {
        setError(result.error || "Check-out failed")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const hasCheckedIn = attendance?.checkInTime
  const hasCheckedOut = attendance?.checkOutTime

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mark Attendance</CardTitle>
        <CardDescription>
          Use your device's GPS to check in or check out
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages */}
        {error && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 border border-red-200">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 border border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Location Status */}
        <div className="rounded-lg bg-gray-50 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">GPS Status</span>
            {location ? (
              <span className="text-xs font-medium text-green-600">Location acquired</span>
            ) : (
              <span className="text-xs font-medium text-gray-500">No location</span>
            )}
          </div>
          {location && (
            <div className="text-xs text-gray-600 space-y-1">
              <p>Latitude: {location.lat.toFixed(6)}</p>
              <p>Longitude: {location.lon.toFixed(6)}</p>
              <p>Accuracy: {Math.round(location.accuracy)}m</p>
            </div>
          )}
          <Button
            onClick={getLocation}
            disabled={gettingLocation}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <MapPin className="h-4 w-4 mr-2" />
            {gettingLocation ? "Getting location..." : "Get My Location"}
          </Button>
        </div>

        {/* Attendance Status */}
        {attendance && (
          <div className="rounded-lg border bg-white p-4 space-y-3">
            <h4 className="font-medium text-gray-900">Today's Status</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Check-in</p>
                <p className="font-medium text-gray-900">
                  {hasCheckedIn ? format(new Date(attendance.checkInTime), "h:mm a") : "Not checked in"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Check-out</p>
                <p className="font-medium text-gray-900">
                  {hasCheckedOut ? format(new Date(attendance.checkOutTime), "h:mm a") : "-"}
                </p>
              </div>
              {attendance.checkInLocation && (
                <div className="col-span-2">
                  <p className="text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">{attendance.checkInLocation.name}</p>
                </div>
              )}
              {attendance.isLate && (
                <div className="col-span-2">
                  <p className="text-yellow-600 text-sm">
                    Late by {attendance.lateByMinutes} minutes
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!hasCheckedIn && (
            <Button
              onClick={handleCheckIn}
              disabled={loading || !location}
              className="flex-1"
            >
              <Clock className="h-4 w-4 mr-2" />
              Check In
            </Button>
          )}
          {hasCheckedIn && !hasCheckedOut && (
            <Button
              onClick={handleCheckOut}
              disabled={loading || !location}
              variant="outline"
              className="flex-1"
            >
              <Clock className="h-4 w-4 mr-2" />
              Check Out
            </Button>
          )}
          {hasCheckedOut && (
            <div className="flex-1 text-center py-2 text-green-600 font-medium">
              ✓ Completed for today
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
