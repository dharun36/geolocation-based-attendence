import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { MapPin, Plus } from "lucide-react"
import Link from "next/link"

async function getLocations(organizationId: string) {
  return prisma.location.findMany({
    where: {
      organizationId,
    },
    include: {
      createdBy: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          attendances: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export default async function LocationsPage() {
  const user = await requireAdmin()
  const locations = await getLocations(user.organizationId)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Locations</h1>
          <p className="text-gray-500 mt-1">
            Manage geo-fence locations for attendance
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/locations/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Link>
        </Button>
      </div>

      {/* Locations List */}
      <Card>
        <CardHeader>
          <CardTitle>All Locations</CardTitle>
          <CardDescription>
            Configure allowed locations with geo-fence radius
          </CardDescription>
        </CardHeader>
        <CardContent>
          {locations.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No locations yet</h3>
              <p className="text-gray-500 mb-4">
                Add your first location to enable attendance tracking
              </p>
              <Button asChild>
                <Link href="/dashboard/locations/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Location
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Coordinates</TableHead>
                  <TableHead>Radius</TableHead>
                  <TableHead>Check-ins</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((location: any) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">{location.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{location.address}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </TableCell>
                    <TableCell>{location.radius}m</TableCell>
                    <TableCell>{location._count.attendances}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        location.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {location.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/locations/${location.id}`}>
                          Edit
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">About Geo-fencing</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>
            • Employees can only check in when they are within the specified radius of a location
          </p>
          <p>
            • GPS accuracy must be within 50 meters for reliable check-ins
          </p>
          <p>
            • Recommended radius: 50-200 meters for office buildings
          </p>
          <p>
            • Coordinates can be obtained from Google Maps or similar services
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
