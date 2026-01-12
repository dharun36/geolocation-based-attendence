"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createLocationAction } from "@/app/actions/locations"
import { ArrowLeft, MapPin } from "lucide-react"
import Link from "next/link"

export default function NewLocationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError("")

    try {
      const data = {
        name: formData.get("name") as string,
        address: formData.get("address") as string,
        latitude: parseFloat(formData.get("latitude") as string),
        longitude: parseFloat(formData.get("longitude") as string),
        radius: parseFloat(formData.get("radius") as string),
        description: formData.get("description") as string || undefined,
      }

      const result = await createLocationAction(data)

      if (result.success) {
        router.push("/dashboard/locations")
        router.refresh()
      } else {
        setError(result.error || "Failed to create location")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/dashboard/locations">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Locations
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Add New Location</h1>
        <p className="text-gray-500 mt-1">
          Create a new geo-fence location for attendance tracking
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Location Details</CardTitle>
            <CardDescription>
              Enter the location information and geo-fence parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 p-3 border border-red-200">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Location Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Main Office"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="123 Business St, City, Country"
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude *</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    placeholder="40.712776"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude *</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    placeholder="-74.005974"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="radius">Geo-fence Radius (meters) *</Label>
                <Input
                  id="radius"
                  name="radius"
                  type="number"
                  min="10"
                  max="5000"
                  placeholder="100"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">
                  Recommended: 50-200 meters for office buildings
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Additional information about this location"
                  disabled={loading}
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Creating..." : "Create Location"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              How to Get Coordinates
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-4">
            <div>
              <h4 className="font-medium mb-2">Using Google Maps:</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>Open Google Maps</li>
                <li>Right-click on the location</li>
                <li>Click on the coordinates to copy</li>
                <li>Paste here</li>
              </ol>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Tips:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Use exact building location</li>
                <li>Test with different radius values</li>
                <li>Consider parking areas</li>
                <li>Account for GPS accuracy</li>
              </ul>
            </div>

            <div className="border-t pt-4 bg-blue-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> Employees must be within the specified radius to check in.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
